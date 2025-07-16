import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { uploadHistoryMetadata } from '../api/vehicleHistory';
import { addHistory } from '../api/historyManager';



interface Props {
  tokenId: number;
  onComplete?: () => void;
}

const VehicleHistoryForm: React.FC<Props> = ({ tokenId, onComplete }) => {
  const { provider } = useWallet();
  const [category, setCategory] = useState<'maintenance' | 'accident'>('maintenance');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    setLoading(true);
    setError(null);
    try {
      // 1) IPFS 메타데이터 업로드
      const metadataCid = await uploadHistoryMetadata({ tokenId, category, date, description, imageFile });
      // 2) 온체인 addHistory
      await addHistory(provider, tokenId, category, metadataCid);
      onComplete?.();
    } catch (err: any) {
      setError(err.message || '이력 등록 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>구분:</label>
        <select value={category} onChange={e => setCategory(e.target.value as any)}>
          <option value="maintenance">정비</option>
          <option value="accident">사고</option>
        </select>
      </div>
      <div>
        <label>날짜:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <label>설명:</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required />
      </div>
      <div>
        <label>사진(선택):</label>
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0])} />
      </div>
      <button type="submit" disabled={loading || !date || !description}>
        {loading ? '등록 중...' : '이력 등록'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default VehicleHistoryForm;
