// src/hooks/useRole.ts
import { useEffect, useState } from 'react';
import { checkRole } from '../utils/accessControl'; // 실제 contract 호출
import { useWallet } from './useWallet';

export const useRole = (address: string | null) => {
  const [role, setRole] = useState<'admin' | 'workshop' | 'user' | 'guest'>('guest');
  const { provider } = useWallet();

  useEffect(() => {
    const fetchRole = async () => {
      if (!address || !provider) {
        setRole('guest');
        return;
      }
      try {
        const realRole = await checkRole(provider, address);
        setRole(realRole);
      } catch (error) {
        console.error('역할 조회 실패:', error);
        setRole('guest');
      }
    };

    fetchRole();
  }, [address, provider]);

  return role;
};
