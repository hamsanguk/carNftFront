import React,{useState} from "react";
import axios from "axios";

const MintRequestForm: React.FC<{workshopAddress: string}> = ({workshopAddress})=>{
    const [vin, setVin]=useState('');
    const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  // 기타 필요한 필드...

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!vin || !manufacturer) {
      setError('VIN과 제조사는 필수입니다.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:3000/api/vin-requests', {
        vin,
        manufacturer,
        model,
        workshop: workshopAddress,
        // 기타 정보
      });
      setResult('요청이 성공적으로 제출되었습니다.');
      setVin(''); setManufacturer(''); setModel('');
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || '요청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input placeholder="VIN" value={vin} onChange={e => setVin(e.target.value)} /><br/>
      <input placeholder="제조사" value={manufacturer} onChange={e => setManufacturer(e.target.value)} /><br/>
      <input placeholder="모델" value={model} onChange={e => setModel(e.target.value)} /><br/>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '제출 중...' : '민팅 요청 제출'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && <div style={{ color: 'green' }}>{result}</div>}
    </div>
  );

}
export default MintRequestForm;