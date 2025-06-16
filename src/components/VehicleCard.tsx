// components/VehicleCard.tsx
import React from 'react';

interface VehicleCardProps {
  vin: string;
  manufacturer: string;
  mileage: number;
  tokenId?: number;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vin, manufacturer, mileage, tokenId }) => {
    return (
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
        <h3>{manufacturer}</h3>
        <p><strong>VIN:</strong> {vin}</p>
        <p><strong>주행거리:</strong> {mileage.toLocaleString()} km</p>
        {tokenId !== undefined && <p><strong>Token ID:</strong> #{tokenId}</p>}
        <button>구매 요청</button>
      </div>
    );
  };

export default VehicleCard;
