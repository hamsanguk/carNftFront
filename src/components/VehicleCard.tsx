// src/components/VehicleCard.tsx
import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import styles from './css/VehicleCard.module.css';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

const VehicleCard: React.FC<VehicleCardProps> = ({vin, manufacturer ,tokenId, ownerDb, ownerOnChain, mintedAt, tokenUri,}) => {
  const [model,setModel]=useState<string>('');

useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!tokenUri) return;
      try {
        const res = await axios.get(`${API_BASE}/metadata`, {
          params: { token_id: String(tokenId), token_uri: tokenUri },
        });
        if (!cancelled) setModel(res.data?.model || '');
      } catch {
        if (!cancelled) setModel('');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tokenId, tokenUri]);

  return (
    <div>
      <div className={styles.vehicles_card}>
      <h3 className={styles.title}>{manufacturer}</h3>
      <div className={styles.info}><strong>Model:</strong>{model}</div>
      <div className={styles.info}><strong>VIN:</strong> {vin}</div>
      <div className={styles.info}><strong>On-chain Owner:</strong> {shortenAddress(ownerOnChain) || '(조회불가)'}</div>
      <div className={styles.info}><strong>Token ID:</strong> #{tokenId}</div>
      <div className={styles.info}><strong>NFT 등록일:</strong> {new Date(mintedAt).toLocaleString()}</div>
      <div className={styles.actions}>
        <Link to={`/vehicles/${tokenId}`} state={{model, tokenUri}} className={styles.detailButton}>상세 보기</Link>
      </div>
    </div>
    </div>
  );
  
};

export default VehicleCard;
