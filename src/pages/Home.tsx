// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

type Vehicle = {
  tokenId: number;
  vin: string;
  manufacturer: string;
  ownerDb: string;
  ownerOnChain: string | null;
  mintedAt: string;
  tokenUri?: string | null;
};

const Home = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/vehicles`)
      .then(res => setVehicles(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>차량 목록</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : vehicles.length === 0 ? (
        <div>등록된 차량이 없습니다.</div>
      ) : (
        vehicles.map((v) => (
          <VehicleCard key={v.tokenId} {...v} />
        ))
      )}
    </div>
  );
};

export default Home;
