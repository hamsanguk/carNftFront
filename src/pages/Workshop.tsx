import React, { useState,useEffect } from 'react';
import TradeHistory from '../components/TradeHistory';
import MintVehicleForm from '../components/MIntVehicleForm';
import MintRequestForm from '../components/MintRequestForm';
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
  const [approvedVins, setApprovedVins] = useState<string[]>([]);

  useEffect(() => {
    // 관리자 승인 여부를 조회
    async function fetchApproval() {
      if (!account) return setApproved(false);
      try {
        const res = await axios.get(`http://localhost:3000/api/vin-requests?workshop=${account}&status=approved`);
        setApproved(res.data?.length > 0); // 승인된 항목이 있으면 true 
      } catch {
        setApproved(false);
      }
    }
    fetchApproval();
  }, [account]);

  useEffect(() => {
    async function fetchApprovedVins() {
      if (!account) {
        setApprovedVins([]);
        return;
      }
      try {
        // 승인된 요청 리스트를 받아와서 배열로 저장
        const res = await axios.get(`http://localhost:3000/api/vin-requests?workshop=${account}&status=approved`);
        // 예시: [{vin: "...", manufacturer: "...", ...}]
        setApprovedVins(res.data.map((r: any) => r.vin));
      } catch {
        setApprovedVins([]);
      }
    }
    fetchApprovedVins();
  }, [account]);

  return (
    <div style={{ padding: '1rem' }}>
     <h2>minting(workshop page)</h2>
    
        <div>
          <p style={{ color: 'green' }}>관리자 승인된 VIN으로만 민팅할 수 있습니다.</p>
          <MintVehicleForm
            ownerAddress={account || ''}
            workshopAddress={account || ''}
            approved={approved}                 // 수정: 실제 승인 결과 사용
            allowedVins={approvedVins}
          />
        </div>
 
        <div>
          <p style={{ color: 'orange' }}>아직 관리자 승인 대기 중입니다.<br />아래 폼으로 민팅 요청을 제출하세요.</p>
          <MintRequestForm workshopAddress={account || ''} />
        </div>
   
    </div>
  );
};

export default Workshop;
