import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { getVehicleNFTContract } from '../utils/contract';

const MintForm = () => {
  const [vin, setVin] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { provider, account } = useWallet();

  const handleMint = async () => {
    if (!provider || !account) return alert('지갑이 연결되지 않았습니다.');
    if (!vin) return alert('VIN을 입력해주세요.');

    try {
      setStatus('loading');

      const signer = await provider.getSigner();
      const contract = getVehicleNFTContract(signer);

      const tx = await contract.mintVehicle(account, vin); // 컨트랙트에 따라 함수명 조정
      await tx.wait();

      setStatus('success');
      alert(`NFT 민팅 완료: ${vin}`);
      setVin('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      alert('민팅 실패');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h3>VIN NFT 민팅</h3>
      <input
        placeholder="차량 VIN 입력"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
      />
      <button onClick={handleMint} disabled={status === 'loading'}>
        {status === 'loading' ? '진행 중...' : '민팅'}
      </button>
    </div>
  );
};

export default MintForm;
