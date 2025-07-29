import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getHistories } from '../api/historyManager';
import axios from 'axios';

interface Meta { date: string; description: string; imageCid?: string; }

const VehicleHistoryList: React.FC<{ tokenId: number }> = ({ tokenId }) => {
  const { provider } = useWallet();
  const [items, setItems] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!provider) return;
      setLoading(true);
      try {
        const cids = await getHistories(provider, tokenId);
        const metas = await Promise.all(
          cids.map(cid => axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`).then(r => r.data))
        );
        setItems(metas);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [provider, tokenId]);

  if (loading) return <p>로딩 중...</p>;
  if (items.length === 0) return <p>등록된 정비,유지 이력이 없습니다.</p>;

  return (
    <ul>
      {items.map((it, idx) => (
        <li key={idx}>
          <strong>{it.date}</strong> - {it.description}
          {it.imageCid && <img src={`https://gateway.pinata.cloud/ipfs/${it.imageCid}`} style={{width:100}} />}
        </li>
      ))}
    </ul>
  );
};

export default VehicleHistoryList;
