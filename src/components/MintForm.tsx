import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getVehicleNFTContract } from '../utils/contract';
import { Log } from 'ethers';


const MintForm = () => {
  const [vin, setVin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { provider, account } = useWallet();

  const handleMint = async () => {
    if (!provider || !account) return alert('지갑이 연결되지 않았습니다.');
    if (!vin || !manufacturer) return alert('VIN과 제조사를 모두 입력해주세요.');

    try {
      setStatus('loading');

      const signer = await provider.getSigner();
      const contract = getVehicleNFTContract(signer);

      const tx = await contract.mintVehicle(
        account,            // to
        vin,                // VIN
        manufacturer,       // 제조사
        metadataUri || ''   // 메타데이터 URI (없어도 빈 문자열로 처리)
      );

      const receipt = await tx.wait();

      // 이벤트에서 tokenId 추출
      const event = receipt.logs
        .map((log:Log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed:any) => parsed?.name === 'VehicleMinted');

      if (event) {
        const tokenId = event.args.tokenId.toString();
        setStatus('success');
        alert(`민팅 성공! Token ID: ${tokenId}`);
      } else {
        setStatus('success');
        alert('민팅은 성공했지만 토큰 ID를 확인할 수 없습니다.');
      }

      setVin('');
      setManufacturer('');
      setMetadataUri('');
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
        placeholder="VIN"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
      /><br />
      <input
        placeholder="제조사"
        value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)}
      /><br />
      <input
        placeholder="메타데이터 URI (선택)"
        value={metadataUri}
        onChange={(e) => setMetadataUri(e.target.value)}
      /><br />
      <button onClick={handleMint} disabled={status === 'loading'}>
        {status === 'loading' ? '진행 중...' : '민팅'}
      </button>
    </div>
  );
};

export default MintForm;
