// src/components/VehicleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './css/VehicleCard.module.css';

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
const shortenAddress = (addr: string|null)=>{
  if(!addr) return '조회불가';
  return `${addr.slice(0,6)}...${addr.slice(-4)}`;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vin, manufacturer, tokenId, ownerDb, ownerOnChain, mintedAt, tokenUri,
}) => {
  return (
    <div className={styles.vehicles_card}>
      <h3 className={styles.title}>{manufacturer}</h3>
      <div className={styles.info}><strong>VIN:</strong> {vin}</div>
      <div className={styles.info}><strong>Token ID:</strong> #{tokenId}</div>
      <div className={styles.info}><strong>Current Owner:</strong> {shortenAddress(ownerDb)}</div>
      <div className={styles.info}><strong>On-chain Owner:</strong> {shortenAddress(ownerOnChain) || '(조회불가)'}</div>
      <div className={styles.info}><strong>민팅일:</strong> {new Date(mintedAt).toLocaleString()}</div>
      <div className={styles.actions}>
        <Link to={`/vehicles/${tokenId}`} className={styles.detailButton}>상세 보기</Link>
      </div>
    </div>
  );
  
};

export default VehicleCard;
