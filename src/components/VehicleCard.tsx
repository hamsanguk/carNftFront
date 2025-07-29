// src/components/VehicleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './css/VehicleCard.css';

interface VehicleCardProps {
  vin: string;
  manufacturer: string;
  tokenId: number;
  ownerDb: string;
  ownerOnChain: string | null;
  mintedAt: string;
  tokenUri?: string | null;
  forSale:boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vin, manufacturer, tokenId, ownerDb, ownerOnChain, mintedAt, tokenUri,
}) => {
  return (
    
    <div className="vehicle-card">
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
