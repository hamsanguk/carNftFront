// src/pages/VehicleDetail.tsx
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {ethers} from 'ethers';
import { useParams } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { usePurchase } from '../contexts/PurchaseContext';
import { useWallet } from '../contexts/WalletContext';
import { useIsWorkshopOrAdmin } from '../hooks/useIsWorkshopOrAdmin';
import abi from '../abi/VehicleNFT.json'
import HistoryInput  from '../components/HistoryInput'
import OwnerHistoryTable from '../components/OwnerHistoryTable';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

type Vehicle = {
  vin: string; manufacturer: string;
  tokenId: number; ownerOnChain: string;
  forSale: boolean;
};
type TradeRequest = {
  id: string; token_id: string;
  requester: string; status: string;
};

const CONTRACT_ADDRESS = process.env.REACT_APP_VEHICLE_NFT_CA!;
const ABI = abi;

const VehicleDetail = () => {
  const { tokenId } = useParams();
  const { histories } = useHistory();
  const { addRequest } = usePurchase();
  const { account, connected, provider } = useWallet();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tradeReq, setTradeReq] = useState<TradeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const myHistories = histories.filter((h) => h.tokenId === Number(tokenId));
  const [ownerHistories, setOwnerHistories] = useState([]);
  const [forSale, setForSale] = useState(false);

  useEffect(() =>{
    if (vehicle) setForSale(vehicle.forSale);
  },[vehicle]);

  // 거래 요청 상태 가져오기
  useEffect(() => {
    if (!tokenId || !account) return;
    axios.get(`${API_BASE}/trade/request?token_id=${tokenId}&requester=${account}`)
      .then(res => {
        const latest = res.data?.[0];
        if (latest?.status === 'rejected') {
          alert('요청이 거절되었습니다. 다시 요청할 수 있습니다.');
        }
        setTradeReq(latest || null);
      });
  }, [tokenId, account]);

  useEffect(() => {
    if (!tokenId) return;
    axios.get(`${API_BASE}/ownership-history/${tokenId}`)
      .then(res => setOwnerHistories(res.data))
      .catch(err => console.error("Error fetching owner history:", err));
  }, [tokenId]);

  useEffect(() => {
    if (!tokenId) return;
    axios.get(`${API_BASE}/vehicles/${tokenId}`)
      .then(res => setVehicle(res.data))
      .finally(() => setLoading(false));
  }, [tokenId]);

  // 구매 요청 전송
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
    } catch (err) {
      alert(`이미 요청했거나, 오류가 발생했습니다.\n${err}`);
    }
  };

  // 거래 실행
  const handleTrade = async () => {
    if (!provider || !account || !vehicle) return;
    setTxPending(true);
    try {
      const from = account;
      const to = tradeReq?.requester;
      const tokenIdNum = vehicle.tokenId;

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.safeTransferFrom(from, to, tokenIdNum);
      await tx.wait();

      alert('거래가 블록체인에 기록되었습니다.');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setTxPending(false);
    }
  };

  // 거래완료후 처리
  const handleMarkForSale = async () => {
    await axios.patch(`${API_BASE}/vehicles/${tokenId}/mark-sale`);
    alert('매물로 등록되었습니다');
    setForSale(true);
  }
  const handleUnlist = async () => {
    await axios.patch(`${API_BASE}/vehicles/${tokenId}/unlist`);
    alert('매물에서 제외되었습니다.');
    setForSale(false);
  };

  if (loading) return <div>로딩 중...</div>;
  if (!vehicle) return <div>차량 정보를 찾을 수 없습니다.</div>;

  const reqStatus = tradeReq?.status;
  const isApproved = reqStatus === 'approved';

  const isOwner = account &&
    vehicle &&
    vehicle.ownerOnChain &&
    account.toLowerCase() === vehicle.ownerOnChain.toLowerCase();

  const showPurchaseButton = !tradeReq || tradeReq.status === 'rejected';
  
  return (
    <div style={{ padding: '1rem' }}>
      <h2>차량 상세</h2>
      <p><strong>VIN:</strong> {vehicle.vin}</p>
      <p><strong>제조사:</strong> {vehicle.manufacturer}</p>
      <p><strong>Token ID:</strong> {vehicle.tokenId}</p>

      { isOwner && (
        <div>
          {forSale ? (
            <button onClick={handleUnlist}> 매물에서 제외</button>
          ) : (
            <button onClick={handleMarkForSale}> 매물로 등록</button>
          )}
        </div>
      )}

      <div>
        {showPurchaseButton ? (
          <button onClick={handlePurchase} disabled={!connected}>
            {connected ? '구매 요청' : '지갑 연결 필요'}
          </button>
        ) : (
          <div>
            <p>거래 요청 상태: <b>{reqStatus}</b></p>
            {isOwner && isApproved && (
              <button onClick={handleTrade} disabled={txPending}>
                {txPending ? '거래 진행 중...' : '거래 실행'}
              </button>
            )}
          </div>
        )}
      </div>

      <hr />
      <HistoryInput tokenId={vehicle.tokenId} />
      <OwnerHistoryTable histories={ownerHistories} myAddress={account!} />
    </div>
  );
};

export default VehicleDetail;
