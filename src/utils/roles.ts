import { useEffect, useState } from 'react';
import { checkRole } from '../utils/accessControl';
import { useWallet } from '../hooks/useWallet';

export const useRole = (address: string | null) => {
  const [role, setRole] = useState<'admin' | 'workshop' | 'user' | 'guest'>('guest');
  const { provider } = useWallet();

  useEffect(() => {
    const fetchRole = async () => {
      if (!address || !provider) return setRole('guest');
      const realRole = await checkRole(provider, address);
      setRole(realRole);
    };

    fetchRole();
  }, [address, provider]);

  return role;
};
