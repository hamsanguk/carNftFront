// src/pages/VehicleDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { usePurchase } from '../contexts/PurchaseContext';
import { useWallet } from '../hooks/useWallet';
import VehicleHistoryTable from '../components/VehicleHistoryTable';

const VehicleDetail = () => {
  const { tokenId } = useParams(); // URL의 tokenId
  const { histories } = useHistory();
  const { addRequest } = usePurchase();
  const { account, connected } = useWallet();

  const myHistories = histories.filter((h) => h.tokenId === Number(tokenId));

  const handlePurchaseRequest = () => {
    if (!connected || !account) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    addRequest({
      tokenId: Number(tokenId),
      buyerAddress: account,
      date: new Date().toISOString().slice(0, 10),
    });
    alert('구매 요청이 전송되었습니다.');
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h2>차량 상세 정보 (Token ID: {tokenId})</h2>

      <h3>이력 정보</h3>
      {myHistories.length === 0 ? (
        <p>등록된 이력이 없습니다.</p>
      ) : (
        <VehicleHistoryTable histories={myHistories} />
      )}

      <br />
      <button onClick={handlePurchaseRequest} disabled={!connected}>
        {connected ? '구매 요청' : '지갑 연결 필요'}
      </button>
    </div>
  );
};

export default VehicleDetail;
