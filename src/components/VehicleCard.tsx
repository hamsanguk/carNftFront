// src/components/VehicleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { usePurchase } from '../contexts/PurchaseContext';

interface VehicleCardProps {
  vin: string;
  manufacturer: string;
  mileage: number;
  tokenId: number; // tokenId는 항상 있어야 구매 요청이 가능하므로 필수로 변경
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vin, manufacturer, mileage, tokenId }) => {
  const { account, connected } = useWallet();
  const { addRequest } = usePurchase();

  const handlePurchase = () => {
    if (!connected || !account) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    addRequest({
      tokenId,
      buyerAddress: account,
      date: new Date().toISOString().slice(0, 10),
    });

    alert(`Token #${tokenId}에 대한 구매 요청이 전송되었습니다.`);
  };
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h3>{manufacturer}</h3>
      <p><strong>VIN:</strong> {vin}</p>
      <p><strong>주행거리:</strong> {mileage.toLocaleString()} km</p>
      <p><strong>Token ID:</strong> #{tokenId}</p>

      <div>
        <Link to={`/vehicle/${tokenId}`}>상세 보기</Link>

      </div>

      <button onClick={handlePurchase} disabled={!connected} style={{ marginTop: '0.5rem' }}>
        {connected ? '구매 요청' : '지갑 연결 필요'}
      </button>
    </div>
  );
};
export default VehicleCard;


