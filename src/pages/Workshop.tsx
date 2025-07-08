import React, { useState } from 'react';
import TradeHistory from '../components/TradeHistory';
import { mintVehicle, Vehicle } from '../api/api';
import { useWallet } from '../contexts/WalletContext';

const Workshop = () => {
  const [vin, setVin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  // const [metadataUri, setMetadataUri] = useState(''); // 현재 백엔드 미지원
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { account, connectWallet } = useWallet();

  const handleMint = async () => {
    if (!account) {
      await connectWallet();
      return;
    }
    if (!vin || !manufacturer) {
      setError('VIN, 제조사 모두 입력하세요.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // metadataUri는 현재 백엔드 미지원이므로 제외
      const vehicle = await mintVehicle(vin, manufacturer, account);
      setResult(vehicle);
    } catch (e: any) {
      setError(e.message || 'minting fail');
    } finally {
      setLoading(false);
    }
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
      {/* 
      <div>
        <input
          placeholder="메타데이터 URI (ipfs://...)"
          value={metadataUri}
          onChange={e => setMetadataUri(e.target.value)}
        />
      </div>
      */}
      <button onClick={handleMint} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? '민팅 중...' : '민팅하기'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3>민팅 완료! Token ID: #{result.tokenId}</h3>
          <p>소유자 (On-Chain): {result.ownerOnChain}</p>
          <TradeHistory tokenId={result.tokenId} />
        </div>
      )}
    </div>
  );
};

export default Workshop;
