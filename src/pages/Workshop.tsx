// src/pages/Workshop.tsx
import React, { useState } from 'react';
import {useParams} from 'react-router-dom'
import { useHistory } from '../contexts/HistoryContext';
import MintForm from '../components/MintForm';
import {mintVehicle, Vehicle} from '../api/api';
import { useWallet }  from '../hooks/useWallet';



interface Request {
  vin: string;
  manufacturer: string;
  mileage: number;
}
interface History {
    tokenId: number;
    date: string;
    type: '정비' | '사고';
    description: string;
    workshop: string;
  }

const Workshop = () => {
  const [form, setForm] = useState<Request>({ vin: '', manufacturer: '', mileage: 0 });
  const [submitted, setSubmitted] = useState<Request[]>([]);
  const [vin, setVin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addHistory } = useHistory();
  const { account, connectWallet } = useWallet();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'mileage' ? Number(value) : value });
  };
  const [histories, setHistories] = useState<History[]>([]);
  const [historyForm, setHistoryForm] = useState<History>({
    tokenId: 0,
    date: '',
    type: '정비',
    description: '',
    workshop: '한빛정비소', // 필요 시 수정
  });

  const handleMint = async () => {
    if(!account){
      await connectWallet();
      return;
    }
    try{
      setLoading(true);
      setError(null);
      const vehicle = await mintVehicle(vin, manufacturer, account)
      setResult(vehicle)
    }catch (e:any) {
      setError(e.message || 'minting fail');
    }finally{ 
      setLoading(false);
    }
  };
  const handleSubmit = () => {
    setSubmitted([...submitted, form]);
    setForm({ vin: '', manufacturer: '', mileage: 0 });
    alert('차량 등록 요청이 전송되었습니다.');
  };
  const handleHistoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHistoryForm({ ...historyForm, [name]: name === 'tokenId' ? Number(value) : value });
  };
  
  const handleHistorySubmit = () => {
    addHistory(historyForm); // context에 저장
    setHistoryForm({ ...historyForm, description: '', date: '' });
    alert('이력이 등록되었습니다.');
  };
  
  return (
    <div style={{ padding: '1rem' }}>
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
      <button onClick={handleMint} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? '민팅 중...' : '민팅하기'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3>민팅 완료! Token ID: #{result.tokenId}</h3>
          <p>소유자 (On-Chain): {result.ownerOnChain}</p>
        </div>
      )}
       {/*  <h2>차량 등록 요청 </h2> 
      <input name="vin" value={form.vin} onChange={handleChange} placeholder="VIN" /><br />
      <input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="제조사" /><br />
      <input name="mileage" value={form.mileage} onChange={handleChange} placeholder="주행거리" type="number" /><br />
      <button onClick={handleSubmit}>등록 요청</button>

      <hr />
    <h3>내가 요청한 목록 (mock)</h3>
      <ul>
        {submitted.map((v, i) => (
          <li key={i}>{v.vin} / {v.manufacturer} / {v.mileage}km</li>
        ))}
      </ul>
      <MintForm/>
      <h2>차량 이력 등록</h2>
        <input name="tokenId" value={historyForm.tokenId} onChange={handleHistoryChange} placeholder="Token ID" /><br />
        <input name="date" value={historyForm.date} onChange={handleHistoryChange} placeholder="YYYY-MM-DD" /><br />
        <select name="type" value={historyForm.type} onChange={handleHistoryChange}>
        <option value="정비">정비</option>
        <option value="사고">사고</option>
        </select><br />
        <input name="description" value={historyForm.description} onChange={handleHistoryChange} placeholder="내용 설명" /><br />
        <button onClick={handleHistorySubmit}>이력 등록</button>

        <hr />
        <h3>등록된 이력 목록 (mock)</h3>
        <ul>
        {histories.map((h, i) => (
            <li key={i}>
            #{h.tokenId} / {h.date} / {h.type} / {h.description}
            </li>
        ))}
        </ul> */}

    </div>
  );
};

export default Workshop;