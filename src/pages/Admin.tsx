import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import MintVehicleForm from '../components/MIntVehicleForm';
import axios from 'axios';
import styles from './css/Admin.module.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

type TradeRequest = {
  id: string;
  token_id: string;
  requester: string;
  status: string;
  created_at: string;
};

type MintRequest = {
  id: number;
  vin: string;
  manufacturer: string;
  model: string;
  workshop: string;
  status: string;
  createdAt: string;
};

const SKELETON_ROWS = 3;

function SkeletonTable({ cols }: { cols: number }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}><div className={styles.skelBarShort} /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: SKELETON_ROWS }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((__, c) => (
              <td key={c}><div className={styles.skelBar} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const Admin = () => {
  const { account } = useWallet();

  // 목록/로딩 상태 분리
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [mintRequests, setMintRequests] = useState<MintRequest[]>([]);
  const [loadingTrade, setLoadingTrade] = useState(true);
  const [loadingMint, setLoadingMint] = useState(true);

  // 리프레시 버튼 상태
  const [refreshing, setRefreshing] = useState(false);
  const [errorTrade, setErrorTrade] = useState<string | null>(null);
  const [errorMint, setErrorMint] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoadingTrade(true);
    setErrorTrade(null);
    try {
      const res = await axios.get(`${API_BASE}/trade/requests?status=pending`);
      setRequests(res.data);
    } catch (e: any) {
      setRequests([]);
      setErrorTrade('구매 요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingTrade(false);
    }
  }, []);

  const fetchMintRequests = useCallback(async () => {
    setLoadingMint(true);
    setErrorMint(null);
    try {
      const res = await axios.get(`${API_BASE}/api/vin-requests?status=pending`);
      setMintRequests(res.data);
    } catch (e: any) {
      setMintRequests([]);
      setErrorMint('민팅 요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingMint(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    // 짧은 선행 호출로 백엔드/DB를 깨우는 효과
    try { await axios.get(`${API_BASE}/health`).catch(() => { }); } catch { }
    await Promise.all([fetchRequests(), fetchMintRequests()]);
    setRefreshing(false);
  }, [fetchRequests, fetchMintRequests]);

  // 최초 로딩
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleDecision = async (id: string, approve: boolean) => {
    try {
      if (approve) await axios.patch(`${API_BASE}/trade/${id}/approve`);
      else await axios.patch(`${API_BASE}/trade/${id}/reject`);
      await fetchRequests();
    } catch {
      alert('처리 실패');
    }
  };

  const handleMintRequestDecision = async (id: number, approve: boolean) => {
    try {
      if (approve) await axios.patch(`${API_BASE}/api/vin-requests/${id}/approve`);
      else await axios.patch(`${API_BASE}/api/vin-requests/${id}/reject`);
      await fetchMintRequests();
    } catch {
      alert('처리 실패');
    }
  };

  const handleManualIndexing = async () => {
    try {
      await axios.post(`${API_BASE}/ownership-history/poll`);
      alert('인덱싱이 실행되었습니다.');
    } catch (err) {
      alert(`인덱싱 실패: ${err}`);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <h2>워크샵 차량 민팅 요청 승인</h2>
        <div className={styles.headerActions}>
          <button onClick={refreshAll} disabled={refreshing} className={styles.refreshBtn}>
            {refreshing ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {loadingMint ? (
        <SkeletonTable cols={7} />
      ) : errorMint ? (
        <div className={styles.errorBox}>
          {errorMint}{' '}
          <button onClick={fetchMintRequests} className={styles.linkBtn}>다시 시도</button>
        </div>
      ) : mintRequests.length === 0 ? (
        <div className={styles.empty}>대기 중인 요청이 없습니다.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>VIN</th>
              <th>제조사</th>
              <th>모델</th>
              <th>워크샵</th>
              <th>요청일시</th>
              <th>상태</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {mintRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.vin}</td>
                <td>{req.manufacturer}</td>
                <td>{req.model}</td>
                <td>{req.workshop}</td>
                <td>{new Date(req.createdAt).toLocaleString()}</td>
                <td>{req.status}</td>
                <td>
                  <button onClick={() => handleMintRequestDecision(req.id, true)}>승인</button>
                  <button style={{ marginLeft: '0.5rem' }} onClick={() => handleMintRequestDecision(req.id, false)}>
                    거절
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.headerRow} style={{ marginTop: '2rem' }}>
        <h2>차량 인수 요청 관리</h2>
        <div className={styles.headerActions}>
          <button onClick={fetchRequests} disabled={loadingTrade} className={styles.refreshBtn}>
            {loadingTrade ? '새로고침 중...' : '목록 새로고침'}
          </button>
        </div>
      </div>

      {loadingTrade ? (
        <SkeletonTable cols={5} />
      ) : errorTrade ? (
        <div className={styles.errorBox}>
          {errorTrade}{' '}
          <button onClick={fetchRequests} className={styles.linkBtn}>다시 시도</button>
        </div>
      ) : requests.length === 0 ? (
        <div className={styles.empty}>대기 중인 요청이 없습니다.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Token ID</th>
              <th>요청자</th>
              <th>요청일시</th>
              <th>상태</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.token_id}</td>
                <td>{req.requester}</td>
                <td>{new Date(req.created_at).toLocaleString()}</td>
                <td>{req.status}</td>
                <td>
                  <button onClick={() => handleDecision(req.id, true)}>승인</button>
                  <button style={{ marginLeft: '0.5rem' }} onClick={() => handleDecision(req.id, false)}>
                    거절
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '2rem' }}>관리자용 차량 민팅</h2>
      <MintVehicleForm ownerAddress={account || ''} approved={true} />

      <div className={styles.rightside}>
        <button onClick={handleManualIndexing}>수동 인덱싱</button>
      </div>
    </div>
  );
};

export default Admin;
