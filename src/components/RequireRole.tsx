// src/components/RequireRole.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireRoleProps {
  required: 'admin' | 'workshop';
  current: string | null;
  children: React.ReactNode;
}

/**
 * 지정된 역할(required)에 해당하지 않으면 Home으로 리디렉션
 */
const RequireRole: React.FC<RequireRoleProps> = ({ required, current, children }) => {
  if (current !== required) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireRole;
