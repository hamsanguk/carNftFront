// src/components/VehicleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface VehicleCardProps {
  vin: string;
  manufacturer: string;
  tokenId: number;
  ownerDb: string;
  ownerOnChain: string | null;
  mintedAt: string;
  tokenUri?: string | null;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vin, manufacturer, tokenId, ownerDb, ownerOnChain, mintedAt, tokenUri,
}) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h3>{manufacturer}</h3>
      <p><strong>VIN:</strong> {vin}</p>
      <p><strong>Token ID:</strong> #{tokenId}</p>
      <p><strong>Current Owner:</strong> {ownerDb}</p>
      <p><strong>On-chain Owner:</strong> {ownerOnChain || '(조회불가)'}</p>
      <p><strong>민팅일:</strong> {new Date(mintedAt).toLocaleString()}</p>
      {tokenUri && (
        <p><strong>Meta URI:</strong> {tokenUri}</p>
      )}
      <div>
        <Link to={`/vehicles/${tokenId}`}>상세 보기</Link>
      </div>
    </div>
  );
};

export default VehicleCard;
