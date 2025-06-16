// src/pages/VehicleDetail.tsx
import React from 'react';
import VehicleHistoryTable from '../components/VehicleHistoryTable';

const mockVehicle = {
  vin: 'KMHEC41DAD0123456',
  manufacturer: 'Hyundai',
  mileage: 78400,
  tokenId: 1,
};

const mockHistories = [
  {
    date: '2024-11-03',
    type: '정비' as const,
    description: '엔진 오일 교체',
    workshop: '한빛 정비소',
  },
  {
    date: '2025-01-15',
    type: '사고' as const,
    description: '후방 추돌 사고, 범퍼 교체',
    workshop: 'ABC Auto',
  },
];

const VehicleDetail = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>차량 상세 정보</h2>
      <p><strong>제조사:</strong> {mockVehicle.manufacturer}</p>
      <p><strong>VIN:</strong> {mockVehicle.vin}</p>
      <p><strong>주행거리:</strong> {mockVehicle.mileage.toLocaleString()} km</p>
      <p><strong>Token ID:</strong> #{mockVehicle.tokenId}</p>

      <h3>이력 정보</h3>
      <VehicleHistoryTable histories={mockHistories} />
    </div>
  );
};

export default VehicleDetail;
