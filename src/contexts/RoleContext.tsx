import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'admin' | 'workshop' | 'user' | 'guest';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('guest');

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useMockRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useMockRole must be used within a RoleProvider');
  }
  return context;
};
