// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { usePurchase } from '../hooks/usePurchase'; // API 기반으로 구현된 usePurchase
import { PurchaseRequest } from '../api/purchase';

interface VinRequest {
  vin: string;
  manufacturer: string;
  mileage: number;
}

// 임시 mock VIN 등록 요청 (추후 API 연동 예정)
const mockVinRequests: VinRequest[] = [
  { vin: 'KMHEC41DAD0123456', manufacturer: 'Hyundai', mileage: 78000 },
  { vin: 'JN8AS5MT8CW305678', manufacturer: 'Nissan', mileage: 102000 },
];

const Admin = () => {
  const [vinRequests, setVinRequests] = useState<VinRequest[]>(mockVinRequests);
  const [minted, setMinted] = useState<VinRequest[]>([]);

  const {
    requests: purchaseRequests,
    fetchRequests,
  } = usePurchase(); // axios 기반 구매 요청 목록

  useEffect(() => {
    fetchRequests(); // 페이지 진입 시 구매 요청 최신화
  }, []);

  const handleApproveVin = (vin: string) => {
    const approved = vinRequests.find((r) => r.vin === vin);
    if (!approved) return;
    setMinted([...minted, approved]);
    setVinRequests(vinRequests.filter((r) => r.vin !== vin));
    alert(`NFT 민팅 승인 완료: ${vin}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>VIN 등록 요청 승인</h2>
      {vinRequests.length === 0 ? (
        <p>요청 없음</p>
      ) : (
        <ul>
          {vinRequests.map((r, i) => (
            <li key={i}>
              {r.vin} / {r.manufacturer} / {r.mileage}km
              <button
                onClick={() => handleApproveVin(r.vin)}
                style={{ marginLeft: '1rem' }}
              >
                승인
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h2>구매 요청 목록</h2>
      {purchaseRequests.length === 0 ? (
        <p>요청 없음</p>
      ) : (
        <ul>
          {purchaseRequests.map((r: PurchaseRequest, i) => (
            <li key={i}>
              Token #{r.tokenId} / 구매자: {r.buyerAddress} / 날짜: {r.date}
            </li>
          ))}
        </ul>
      )}

      <hr />
      <h3>민팅 승인 완료 목록</h3>
      <ul>
        {minted.map((r, i) => (
          <li key={i}>{r.vin} / {r.manufacturer}</li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
