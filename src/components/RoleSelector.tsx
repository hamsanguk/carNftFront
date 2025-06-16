import React from 'react';
import { useMockRole } from '../contexts/RoleContext';

const RoleSelector = () => {
  const { role, setRole } = useMockRole();

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>임시 역할 선택: </label>
      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="guest">guest</option>
        <option value="user">user</option>
        <option value="workshop">workshop</option>
        <option value="admin">admin</option>
      </select>
    </div>
  );
};

export default RoleSelector;
