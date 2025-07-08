// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useRole } from '../contexts/RoleContext'; // 컨텍스트에서 useRole 가져오기

const Header = () => {
  const { account, connected, connectWallet, disconnectWallet } = useWallet();
  const { role } = useRole(); // 컨텍스트를 통해 role 상태 직접 사용

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/">Home</Link>

        {role === 'admin' && <Link to="/admin">Admin</Link>}
        {role === 'workshop' && <Link to="/workshop">Workshop</Link>}

        <div style={{ marginLeft: 'auto' }}>
          {connected && account ? (
            <>
              <span style={{ marginRight: '1rem' }}>
                지갑: {shortenAddress(account)}
              </span>
              <span style={{ marginRight: '1rem' }}>권한: {role}</span>
              <button onClick={disconnectWallet}>Disconnect</button>
            </>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
