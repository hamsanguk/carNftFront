import React, { useState,useEffect } from 'react';
import TradeHistory from '../components/TradeHistory';
import MintVehicleForm from '../components/MIntVehicleForm';
import { mintVehicle, Vehicle } from '../api/api';
import { useWallet } from '../contexts/WalletContext';
import axios from 'axios';

const Workshop = () => {
  const { account, connectWallet } = useWallet();

  const [vin, setVin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    // 관리자 승인 여부를 조회
    async function fetchApproval() {
      if (!account) return setApproved(false);
      try {
        const res = await axios.get(`/api/vin-requests?workshop=${account}&status=approved`);
        setApproved(res.data?.length > 0); // 승인된 항목이 있으면 true 
      } catch {
        setApproved(false);
      }
    }
    fetchApproval();
  }, [account]);

  return (
    <div style={{ padding: '1rem' }}>
      <MintVehicleForm ownerAddress={account || ''} approved={approved}/>
      <h2>VIN 기반 NFT 민팅</h2>
      <div>
        <input
          placeholder="VIN"
          value={vin}
          onChange={e => setVin(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="제조사"
          value={manufacturer}
          onChange={e => setManufacturer(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Workshop;
