// src/pages/VehicleDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useParams, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import abi from '../abi/VehicleNFT.json';
import HistoryInput from '../components/HistoryInput';
import OwnerHistoryTable from '../components/OwnerHistoryTable';
import { Vehicle } from '../api/api';
import styles from './css/VehicleDetail.module.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000',
EXPLORER_BASE = process.env.REACT_APP_EXPLORER_URL || 'https://kairos.kaiascan.io/nft';

const buildExpolorerUrl = (ca: string, tokenId: number)=>{
  if(!ca || tokenId === undefined || tokenId === null) return '';
  return `${EXPLORER_BASE}/${ca}/${tokenId}?tabId=nftTokenTransfer&page=1`;
}

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
  const { account, connected, provider } = useWallet();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tradeReq, setTradeReq] = useState<TradeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const [ownerHistories, setOwnerHistories] = useState<any[]>([]);
  const [forSale, setForSale] = useState(false);
  const [model, setModel] = useState<string>('');

  const location = useLocation();
  const navState = (location.state ?? null) as { model?: string; tokenUri?: string } | null;
  
  const fetchOwnerHistories = async (id: string | number) => {
    try {
      const res = await axios.get(`${API_BASE}/ownership-history/${id}`);
      setOwnerHistories(res.data);
    } catch (err) {
      console.error('Error fetching owner history:', err);
      setOwnerHistories([]);
    }
  };

  const handleOpenExplorer =()=>{
    const url = buildExpolorerUrl(CONTRACT_ADDRESS, vehicle?.tokenId);
    if(!url) return;
    window.open(url,'_blank');
  }

  // 차량 기본 정보 조회
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

  // 소유 이력 조회
  useEffect(() => {
    if(!tokenId)  return;
    fetchOwnerHistories(tokenId);
  }, [tokenId]);

  // 내 지갑이 소유자인지 여부
  const isOwner =
    !!account &&
    !!vehicle?.ownerOnChain &&
    account.toLowerCase() === vehicle.ownerOnChain.toLowerCase();

  const statusLower = (tradeReq?.status ?? '').toLowerCase();
  const isApproved = statusLower === 'approved';
  const canExecuteTrade = isOwner && isApproved;
  const showPurchaseButton = !canExecuteTrade && (!tradeReq || statusLower === 'rejected');

  // 거래 요청 조회
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
      alert('이전 요청이 전송되었습니다.');

      const res = await axios.get(`${API_BASE}/trade/request`, {
        params: { token_id: tokenId, requester: account },
      });
      setTradeReq(res.data?.[0] || null);
    } catch (err) {
      alert(`이미 요청했거나, 오류가 발생했습니다.\n${err}`);
    }
  };

  // 거래 실행
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

    const from = account;
    const to = tradeReq.requester;
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

      await axios.patch(`${API_BASE}/trade/${tradeReq.id}/complete`, {
        tx_hash: (receipt as any)?.hash ?? tx.hash,
      });

      const vehRes = await axios.get(`${API_BASE}/vehicles/${vehicle.tokenId}`);
      const updated = vehRes.data as Vehicle;
      setVehicle(updated);
      setForSale(updated?.forSale ?? false);

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
      setTradeReq((prev) => (prev ? { ...prev, status: 'completed' } : prev));
      await fetchOwnerHistories(vehicle.tokenId);
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

  // 모델 정보 조회
  useEffect(() => {
    setModel(''); // tokenId 변경 시 초기화
    if (!vehicle?.tokenUri || !vehicle?.tokenId) return;

    const source = axios.CancelToken.source();
    axios
      .get(`${API_BASE}/metadata`, {
        params: { token_id: String(vehicle.tokenId), token_uri: vehicle.tokenUri },
        cancelToken: source.token,
      })
      .then((res) => setModel(res.data?.model || ''))
      .catch(() => setModel(''));

    return () => source.cancel();
  }, [vehicle?.tokenId, vehicle?.tokenUri]);

  if (loading) return <div>찾는 중...</div>;
  if (!vehicle) return <div>차량 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <header className={styles.header}>
          <h1 className={styles.title}>{`${vehicle.manufacturer} 차량`}</h1>
          <div className={styles.meta}>
            <span>VIN: {vehicle.vin}</span>
            <span>제조사: {vehicle.manufacturer}</span>
            <span>{model}</span>
            <span>Token ID: {vehicle.tokenId}</span>
          </div>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.badgeRed}`}>성능 점검</span>
            <span className={`${styles.badge} ${styles.badgeDark}`}>소유/거래 이력 조회</span>
          </div>
        </header>
        <section className={styles.section}>
          <h3>이 차량을 추천하는 이유</h3>
          <p className={styles.note}>
            옵션 구성과 관리 상태가 준수한 편이며, 실사용 이력 기반의 거래 이력이 블록체인에 투명하게 기록된 차량입니다.
          </p>
        </section>

        <section className={styles.section}>
          <h3>차량 상태</h3>
          <ul className={styles.stateList}>
            <li><b>프레임 진단</b><em>정상</em></li>
            <li><b>외부패널 진단</b><em>정상</em></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3>소유/거래 이력</h3>
          <HistoryInput tokenId={vehicle.tokenId} />
        </section>
      </div>

      <aside className={styles.aside}>
        <div className={styles.asideCard}>
          <div className={styles.priceBox}>
            <strong className={styles.price}>가격 정보 준비중</strong>
            <small className={styles.sub}>보증/이력은 블록체인으로 검증</small>
          </div>
          <OwnerHistoryTable histories={ownerHistories} myAddress={(account ?? '').toLowerCase()} />
  <button className={`${styles.encar_link}`}>엔카에서 보기</button>
  <button
  type="button"
  className={styles.encar_link}  onClick={handleOpenExplorer}
  disabled={!vehicle?.tokenId}
>
  익스플로러에서 보기
</button>

{/* 소유자 화면 */}
{isOwner ? (
  <div className={styles.actionGroup}>
    {/* 매물 토글 */}
    {forSale ? (
      <button onClick={handleUnlist}>매물에서 제외</button>
    ) : (
      <button onClick={handleMarkForSale}>매물로 등록</button>
    )}

    {/* 거래 실행: 관리자 승인된 요청이 있을 때만 노출 */}
    {tradeReq && isApproved && (
      <button onClick={handleTrade} disabled={txPending}>
        {txPending ? '거래 진행 중...' : '거래 실행'}
      </button>
    )}

    {/* 참고: 승인된 요청이 없을 때 상태 표시(선택) */}
    {tradeReq && !isApproved && (
      <p className={styles.tradeInfo}>
        거래 요청 상태: <b>{tradeReq.status}</b>
      </p>
    )}
  </div>
) : (
  /* 비소유자(구매자/기타) 화면 */
  <div className={styles.actionGroup}>
    {showPurchaseButton ? (
      <button onClick={handlePurchase} disabled={!connected}>
        {connected ? '이전 요청' : '지갑 연결 필요'}
      </button>
    ) : (
      <>
        <p className={styles.tradeInfo}>
          거래 요청 상태: <b>{tradeReq?.status}</b>
        </p>
        {/* 비소유자는 실행 버튼이 없음 */}
      </>
    )}
  </div>
)}
        </div>
      </aside>
      <div className={styles.policyInfo}>
        <h2>면책 사항</h2>
        <p>
        NFT는 개인키 보유자에 의해 지갑 간 직접 전송·거래가 가능합니다. <br />
        다만 본 서비스가 안내하는 감독 절차 (거래 요청 → 승인 → 컨트랙트 실행)를<br />
        거치지 않고 이루어진 직접 전송은 서비스 범위를 벗어난 거래로 간주되며, <br />
        이로 인한 손실·분쟁에 대해서는 지원 또는 책임을 지기 어렵습니다. <br />
        안전한 이용을 위해 반드시 서비스 내 절차를 따르십시오.
        또한 메타마스크 및 기타 지갑/게이트웨이/RPC 등 외부 서비스의 장애·정책 <br />
        변경으로 인한 영향에 대해 당사는 책임을 지지 않습니다.
        </p>
      </div>
    </div>
  );
};
export default VehicleDetail;
