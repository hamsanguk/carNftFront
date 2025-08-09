// src/pages/VehicleDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { usePurchase } from '../contexts/PurchaseContext';
import { useWallet } from '../contexts/WalletContext';
// import { useIsWorkshopOrAdmin } from '../hooks/useIsWorkshopOrAdmin'; // 현재 미사용이면 제거 권장
import abi from '../abi/VehicleNFT.json';
import HistoryInput from '../components/HistoryInput';
import OwnerHistoryTable from '../components/OwnerHistoryTable';
import Footer from '../components/Footer';
import styles from './css/VehicleDetail.module.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

type Vehicle = {
  vin: string;
  manufacturer: string;
  tokenId: number;
  ownerOnChain: string;
  forSale: boolean;
};

type TradeRequest = {
  id: string;
  token_id: string;
  requester: string;
  status: string; // 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
};

const CONTRACT_ADDRESS = process.env.REACT_APP_VEHICLE_NFT_CA!;
const ABI = abi as any;

const VehicleDetail: React.FC = () => {
  const { tokenId } = useParams();
  const { histories } = useHistory();
  const { addRequest } = usePurchase();
  const { account, connected, provider } = useWallet();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tradeReq, setTradeReq] = useState<TradeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const [ownerHistories, setOwnerHistories] = useState<any[]>([]);
  const [forSale, setForSale] = useState(false);

  // 차량, 이력 로드
  useEffect(() => {
    if (!tokenId) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/vehicles/${tokenId}`)
      .then((res) => {
        setVehicle(res.data);
        setForSale(res.data?.forSale ?? false);
      })
      .finally(() => setLoading(false));
  }, [tokenId]);

  useEffect(() => {
    if (!tokenId) return;
    axios
      .get(`${API_BASE}/ownership-history/${tokenId}`)
      .then((res) => setOwnerHistories(res.data))
      .catch((err) => console.error('Error fetching owner history:', err));
  }, [tokenId]);

  // 파생 상태: 소유자/승인/버튼 노출
  const isOwner =
    !!account &&
    !!vehicle?.ownerOnChain &&
    account.toLowerCase() === vehicle.ownerOnChain.toLowerCase();

  const statusLower = (tradeReq?.status || '').toLowerCase();
  const isApproved = statusLower === 'approved';
  const canExecuteTrade = isOwner && isApproved;
  const showPurchaseButton = !canExecuteTrade && (!tradeReq || statusLower === 'rejected');

  // 거래요청 조회: 판매자면 최신 승인요청(요청자 불문), 구매자면 내 요청
  useEffect(() => {
    if (!tokenId) return;

    if (isOwner) {
      axios
        .get(`${API_BASE}/trade/latest-approved`, { params: { token_id: tokenId } })
        .then((res) => setTradeReq(res.data || null))
        .catch(() => setTradeReq(null));
      return;
    }

    if (account) {
      axios
        .get(`${API_BASE}/trade/request`, { params: { token_id: tokenId, requester: account } })
        .then((res) => setTradeReq(res.data?.[0] || null))
        .catch(() => setTradeReq(null));
    } else {
      setTradeReq(null);
    }
  }, [tokenId, account, isOwner]);

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
      // 내 요청이므로 즉시 최신 요청 재조회
      const res = await axios.get(`${API_BASE}/trade/request`, {
        params: { token_id: tokenId, requester: account },
      });
      setTradeReq(res.data?.[0] || null);
    } catch (err) {
      alert(`이미 요청했거나, 오류가 발생했습니다.\n${err}`);
    }
  };

  // 거래 실행 (판매자만, 승인 상태에서만)
  const handleTrade = async () => {
    if (!provider || !account || !vehicle || !tradeReq) return;

    if (!isOwner) {
      alert('현재 지갑이 토큰 소유자가 아닙니다.');
      return;
    }
    if (!isApproved) {
      alert('승인된 요청이 아닙니다.');
      return;
    }

    const from = account; // 판매자(현재 소유자)
    const to = tradeReq.requester; // 구매자
    if (!to) {
      alert('요청자 주소가 없습니다.');
      return;
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      alert('본인 지갑으로는 거래를 진행할 수 없습니다.');
      return;
    }

    setTxPending(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.safeTransferFrom(from, to, vehicle.tokenId);
      const receipt = await tx.wait();

      // 거래 완료 처리(tx_hash 저장)
      await axios.patch(`${API_BASE}/trade/${tradeReq.id}/complete`, {
        tx_hash: (receipt as any)?.hash ?? tx.hash,
      });

      // 최신 차량 소유자/매물 상태 재조회
      const vehRes = await axios.get(`${API_BASE}/vehicles/${vehicle.tokenId}`);
      const updated = vehRes.data as Vehicle;
      setVehicle(updated);
      setForSale(updated?.forSale ?? false);

      // 후속 UI: 매물 노출 여부 선택
      const expose = window.confirm(
        '거래가 완료되었습니다. 이 차량을 매물로 계속 노출하시겠습니까? 확인=노출 / 취소=비노출',
      );
      if (expose) {
        await axios.patch(`${API_BASE}/vehicles/${vehicle.tokenId}/mark-sale`);
        setForSale(true);
      } else {
        await axios.patch(`${API_BASE}/vehicles/${vehicle.tokenId}/unlist`);
        setForSale(false);
      }

      alert('처리가 완료되었습니다.');
      // 승인요청은 완료 상태로 바뀌었으니 프론트 상태도 정리
      setTradeReq((prev) => (prev ? { ...prev, status: 'completed' } : prev));
    } catch (err) {
      console.error(err);
      alert('거래 처리 중 오류가 발생했습니다.');
    } finally {
      setTxPending(false);
    }
  };

  // 매물 표시 토글
  const handleMarkForSale = async () => {
    await axios.patch(`${API_BASE}/vehicles/${tokenId}/mark-sale`);
    alert('매물로 등록되었습니다.');
    setForSale(true);
  };

  const handleUnlist = async () => {
    await axios.patch(`${API_BASE}/vehicles/${tokenId}/unlist`);
    alert('매물에서 제외되었습니다.');
    setForSale(false);
  };

  if (loading) return <div>로딩 중...</div>;
  if (!vehicle) return <div>차량 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h2 className={styles.title}>차량 상세</h2>
        <p className={styles.info}>
          <strong>VIN:</strong> {vehicle.vin}
        </p>
        <p className={styles.info}>
          <strong>제조사:</strong> {vehicle.manufacturer}
        </p>
        <p className={styles.info}>
          <strong>Token ID:</strong> {vehicle.tokenId}
        </p>

        {/* 소유자 전용: 매물 등록/제외 */}
        {isOwner && (
          <div className={styles.actions}>
            {forSale ? (
              <button onClick={handleUnlist}>매물에서 제외</button>
            ) : (
              <button onClick={handleMarkForSale}>매물로 등록</button>
            )}
          </div>
        )}
      </div>

      {/* 우측 액션: 구매요청 / 거래실행 */}
      <div className={styles.actions}>
        {showPurchaseButton ? (
          <button onClick={handlePurchase} disabled={!connected}>
            {connected ? '구매 요청' : '지갑 연결 필요'}
          </button>
        ) : (
          <div>
            <p>
              거래 요청 상태: <b>{tradeReq?.status}</b>
            </p>
            {canExecuteTrade && (
              <button onClick={handleTrade} disabled={txPending}>
                {txPending ? '거래 진행 중...' : '거래 실행'}
              </button>
            )}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <HistoryInput tokenId={vehicle.tokenId} />
        <OwnerHistoryTable histories={ownerHistories} myAddress={account!} />
      </div>
    </div>
  );
};

export default VehicleDetail;
