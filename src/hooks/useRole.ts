// src/hooks/useRole.ts
import { useEffect, useState } from 'react';
import { getVehicleNFTContract } from '../utils/contract';
import { useWallet } from './useWallet';

/**
 * 지갑 주소에 따른 역할(admin, workshop, user, guest)을 반환하는 커스텀 훅
 */
export const useRole = (address: string | null) => {
  const [role, setRole] = useState<'admin' | 'workshop' | 'user' | 'guest'>('guest');
  const { provider } = useWallet();

  useEffect(() => {
    if (!address || !provider) {
      setRole('guest');
      return;
    }

    const fetchRole = async () => {
      try {
        const contract = getVehicleNFTContract(provider);
        const isAdmin = await contract.admins(address);
        if (isAdmin) {
          setRole('admin');
          return;
        }

        const isWorkshop = await contract.workshops(address);
        if (isWorkshop) {
          setRole('workshop');
          return;
        }

        setRole('user');
      } catch (error) {
        console.error('역할 조회 실패:', error);
        setRole('guest');
      }
    };

    fetchRole();
  }, [address, provider]);

  return role;
};
