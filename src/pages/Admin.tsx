// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import MintVehicleForm from '../components/MIntVehicleForm'
import axios from 'axios';

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
}
//나도 이제는 정신차리고 이력서 어플라이를 진행하면서 면접을 간보고 경험하고, 인간답게
//살아야 되는데 CreonExpression
const Admin = () => {
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [mintRequests, setMintRequests] = useState<MintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();

  // 구매 요청 목록 불러오기
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/trade/requests?status=pending`, {
        // 필요시 인증 토큰 등 추가
        // headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (e) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchMintRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/vin-requests?status=pending`);
      setMintRequests(res.data);
    } catch (e) {
      setMintRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // 승인 또는 거절
  const handleDecision = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await axios.patch(`${API_BASE}/trade/${id}/approve`);
      } else {
        await axios.patch(`${API_BASE}/trade/${id}/reject`);
      }
      await fetchRequests(); // 승인/거절 후 목록 갱신
    } catch (e) {
      alert('처리 실패');
    }
  };

  const handleMintRequestDecision = async (id: number, approve: boolean) => {
    try {
      if (approve) {
        await axios.patch(`${API_BASE}/api/vin-requests/${id}/approve`);
      } else {
        // 거절 API가 있다면 아래처럼 호출
        await axios.patch(`${API_BASE}/api/vin-requests/${id}/reject`);
      }
      await fetchMintRequests(); // 승인/거절 후 목록 갱신
    } catch (e) {
      alert('처리 실패');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchMintRequests();
  }, []);

  const handleManualIndexing = async()=>{
    try{
      await axios.post(`${API_BASE}/ownership-history/poll`);
      alert('인덱싱이 실행되었습니다.');
    }catch(err){
      alert (`인덱싱 실패:${err}`)
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
       <h2>워크샵 차량 민팅 요청 승인</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : mintRequests.length === 0 ? (
        <div>대기 중인 요청이 없습니다.</div>
      ) : (
        <table border={1} cellPadding={4}>
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
                  <button onClick={() => handleMintRequestDecision(req.id, true)}>
                    승인
                  </button>
                  <button
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => handleMintRequestDecision(req.id, false)}
                  >
                    거절
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <h2>구매 요청 관리</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : requests.length === 0 ? (
        <div>대기 중인 요청이 없습니다.</div>
      ) : (
        <table>
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
                  <button onClick={() => handleDecision(req.id, true)}>
                    승인
                  </button>
                  <button
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => handleDecision(req.id, false)}
                  >
                    거절
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>관리자용 차량 민팅</h2>
      <MintVehicleForm ownerAddress = {account || ''} approved={true}/>
      <button onClick={handleManualIndexing}>수동 인덱싱</button>
    </div>
  );
};

export default Admin;
//지금 프로젝트에 적용된 폴링이 어떻게돌아가는지 이해 하기 
//자동화와 수동을 동시에 가져가는 것이 좋겠다. 수동으로 동작시킬때는 범위를 지정하는 ui와 특정 토큰을 지장할 수 있는 ui를 만들어야지 
//마지막 블록이 어디에 저장이 되나요? / db에 저장이 되것지?
//페이지를 하나 더 만들기 내 차량 관리 페이지[home에 노출되는 나의 차량을 제외하거나, 다시 불러와서 노출 시킬수가 있다]
//admin에 수동 폴링 ui만들기