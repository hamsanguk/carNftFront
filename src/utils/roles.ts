import { useEffect, useState } from 'react';
import { checkRole } from '../utils/accessControl';
import { useWallet } from '../hooks/useWallet';

/**
 * 지갑 주소에 따른 역할(admin, workshop, user, guest)을 반환하는 커스텀 훅
 * @param address 지갑 주소
 */
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
        console.error('Role 조회 오류:', error);
        setRole('user');
      }
    };

    fetchRole();
  }, [address, provider]);

  return role;
};
