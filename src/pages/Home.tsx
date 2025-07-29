// src/pages/Home.tsx
import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import './css/Home.css';


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

type Vehicle = {
  tokenId: number;
  vin: string;
  manufacturer: string;
  ownerDb: string;
  ownerOnChain: string | null;
  mintedAt: string;
  tokenUri?: string | null;
  forSale: boolean;
};

const Home = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTokenIds, setCompletedTokenIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    axios.get(`${API_BASE}/vehicles`).then(res => {
      setVehicles(res.data);
    });
  
    axios.get(`${API_BASE}/trade/requests?status=completed`).then(res => {
      const tokenSet = new Set<number>(res.data.map((req: any) => Number(req.token_id)));
      setCompletedTokenIds(tokenSet);
    });
  }, []);
  
  const visibleVehicles= vehicles.filter(v => !completedTokenIds.has(v.tokenId));

  return (
    <div className='page'>
    <h1>차량 목록</h1>
    <div className='vehicle-list'>
      {/* {loading ? (
        <div>로딩 중...</div>
      ) : vehicles.length === 0 ? (
        <div>등록된 차량이 없습니다.</div>
      ) : (
        vehicles.map((v) => (
          <VehicleCard key={v.tokenId} {...v} />
        ))
      )} */}
       {visibleVehicles.slice().reverse().map(v => (
        <VehicleCard key={v.tokenId} {...v} />
      ))}
    </div>
    </div>
  );
};

export default Home;
