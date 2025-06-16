// src/components/Header.tsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useRole } from '../hooks/useRole';

const Header = () => {
  const { account, connectWallet, disconnectWallet, connected } = useWallet();
  const role = useRole(account);

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      {connected ? (
        <>
          <span>Connected: {account}</span> | <span>Role: {role}</span>{' '}
          <button onClick={disconnectWallet} style={{ marginLeft: '1rem' }}>
            Disconnect
          </button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </header>
  );
};

export default Header;
