// src/hooks/useRole.ts
import { useEffect, useState } from 'react';
import { getRoleByAddress } from '../utils/roles';

export const useRole = (address: string | null) => {
  const [role, setRole] = useState<'admin' | 'workshop' | 'user' | 'guest'>('guest');

  useEffect(() => {
    if (!address) {
      setRole('guest');
      return;
    }
    const result = getRoleByAddress(address);
    setRole(result);
  }, [address]);

  return role;
};
