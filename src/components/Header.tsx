// src/components/Header.tsx
import React from 'react';
import {Link} from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useRole } from '../hooks/useRole';

const Header = () => {
  const { account, connectWallet, disconnectWallet, connected } = useWallet();
  const role = useRole(account);

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to='/'>Home</Link>
        {role === 'admin' && <Link to='/admin'>Admin</Link>}
        {role === 'workshop' && <Link to='/workshop'>Workshop</Link>}

        <div style={{marginLeft:'auto'}}>
          {connected ? (
            <>
              <span>현재 사용자:{account?.slice(0.6)}...{account?.slice(-4)}</span>
              <span>권한:{role}</span>
              <button onClick={disconnectWallet}>연결 해제</button>
            </>
          ) : (
            <button onClick={connectWallet}>지갑 연결하기</button>
         )} 
         {/* 버튼 동작이 최초 연결시에는 메타마스크 팝업을 가져오지만, 이 후에는 수동으로 메타마스크 팝업으로
         들어가야: 최초 연결시 사라지게 하던가 disconnetWallet confirm하던가 */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
