import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useRole as useRoleHook } from '../hooks/useRole';

type Role = 'admin' | 'workshop' | 'user' | 'guest';

interface RoleContextType {
  role: Role;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { account } = useWallet();
  const role = useRoleHook(account);

  return (
    <RoleContext.Provider value={{ role }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
