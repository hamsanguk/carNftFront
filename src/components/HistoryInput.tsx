import {useWallet} from '../contexts/WalletContext'
import {useIsWorkshopOrAdmin} from '../hooks/useIsWorkshopOrAdmin'
import React, { useState } from 'react';
import VehicleHistoryForm from './VehicleHistoryForm';
import VehicleHistoryList from './VehicleHistoryList';

const HistoryInput: React.FC<{ tokenId: number }> = ({ tokenId }) => {
    const {provider,account} = useWallet();
    const isAllowed = useIsWorkshopOrAdmin(provider, account);
  const [refetchFlag, setRefetchFlag] = useState(0);
  return (
    <div>
      <h1>Vehicle #{tokenId}</h1>
     {/* 이력 등록 권한이 있는 경우에만 폼 보여짐 */}
        {isAllowed && (
            <VehicleHistoryForm
            tokenId={tokenId}
            onComplete={() => setRefetchFlag(prev => prev + 1)} // 이력 등록 후 리스트 새로고침
            />
        )}
      <VehicleHistoryList key={refetchFlag} tokenId={tokenId} />
     
    </div>
  );
};
export default HistoryInput;