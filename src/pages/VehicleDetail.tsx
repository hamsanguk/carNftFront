// src/pages/VehicleDetail.tsx
import React,{useState, useEffect} from 'react';
import axios from 'axios';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { usePurchase } from '../contexts/PurchaseContext';
import { useWallet } from '../contexts/WalletContext';
import VehicleHistoryTable from '../components/VehicleHistoryTable';
import * as abi from '../abi/VehicleNFT.json'

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000'

type Vehicle = {
  vin: string; manufacturer: string;
  mileage:number; tokenId:number;
};
type TradeRequest = {
  id:string; token_id:string;
  requester: string; status:string;
};

const CONTRACT_ADDRESS = process.env.REACT_APP_VEHICLE_NFT_CA!
const ABI = abi; //             이렇게 가져오는거 맞나?


const VehicleDetail = () => {
  const { tokenId } = useParams(); // URL의 tokenId
  const { histories } = useHistory();
  const { addRequest } = usePurchase();
  const { account, connected, provider } = useWallet();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tradeReq, setTradeReq] = useState<TradeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);

  const myHistories = histories.filter((h) => h.tokenId === Number(tokenId));
  //거래 요청 상태 조회
  useEffect(() => {
    if (!tokenId) return;
    axios.get(`${API_BASE}/vehicles/${tokenId}`)
      .then(res => setVehicle(res.data))
      .finally(() => setLoading(false));
  }, [tokenId]);
//구매 요청 전송
  useEffect(()=>{
    if (!tokenId|| !account) return;
    axios.get(`${API_BASE}/trade/request?token_id=${tokenId}&requester=${account}`)
    .then(res=> setTradeReq(res.data[0] || null))
  },[tokenId, account])

  const handlePurchase = async () => {
    if (!connected || !account) {
      alert('지갑 연결이 필요합니다.');
      return;
    }
    try {
      await axios.post(`${API_BASE}/trade/request`, {
        token_id: tokenId,
        requester: account,
      });
      alert('구매 요청이 전송되었습니다.');
      window.location.reload();
    } catch {
      alert('이미 요청했거나, 오류가 발생했습니다.');
    }
  };
   // 거래 실행 (safeTransferFrom)
   const handleTrade = async () => {
    if (!provider || !account || !vehicle) return;
    setTxPending(true);
    try {
      // 판매자 주소 조회
      const ownerRes = await axios.get(`${API_BASE}/vehicles/${tokenId}/owner`);
      const from = ownerRes.data.owner;
      // ethers.js 컨트랙트 연결
      const signer =await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.safeTransferFrom(from, account, vehicle.tokenId);
      await tx.wait();
      alert('거래가 블록체인에 기록되었습니다.');
      window.location.reload();
    } catch (e) {
      alert('거래 실행에 실패했습니다.');
    } finally {
      setTxPending(false);
    }
  };
  if (loading) return <div>로딩 중...</div>;
  if (!vehicle) return <div>차량 정보를 찾을 수 없습니다.</div>;

  // 상태 표시
  const reqStatus = tradeReq?.status;
  const canTrade = reqStatus === 'approved';
  
  return (
    <div style={{ padding: '1rem' }}>
      <h2>차량 상세</h2>
      <p><strong>VIN:</strong> {vehicle.vin}</p>
      <p><strong>제조사:</strong> {vehicle.manufacturer}</p>
      <p><strong>주행거리:</strong> {vehicle.mileage.toLocaleString()} km</p>
      <p><strong>Token ID:</strong> {vehicle.tokenId}</p>

      <div>
        {!tradeReq ? (
          <button onClick={handlePurchase} disabled={!connected}>
            {connected ? '구매 요청' : '지갑 연결 필요'}
          </button>
        ) : (
          <div>
            <p>거래 요청 상태: <b>{reqStatus}</b></p>
            {canTrade && (
              <button onClick={handleTrade} disabled={txPending}>
                {txPending ? '거래 진행 중...' : '거래 실행'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;
