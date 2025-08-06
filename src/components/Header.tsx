// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useRole } from '../contexts/RoleContext'; // 컨텍스트에서 useRole 가져오기
import styles from '../components/css/Header.module.css';

const Header = () => {
  const { account, connected, connectWallet, disconnectWallet } = useWallet();
  const { role } = useRole(); // 컨텍스트를 통해 role 상태 직접 사용

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <Link to="/">
          <h1 className={styles.logo}></h1>
        </Link>
        <div className={styles.headerRight}>
          <span className="clickable_gray">딜러 셀프등록</span>
          {connected && account ? (
            <>
              <span className="clickable_gray">지갑: {shortenAddress(account)}</span>
              <span>권한: {role}</span>
              <span className="clickable_gray" onClick={disconnectWallet}>Disconnect</span>
            </>
          ) : (
            <span className="clickable_gray" onClick={connectWallet}>메타마스크 로그인</span>
          )}
          <span className={`${styles.nineDots} clickable_gray`}></span>
        </div>
      </div>
  
      <div className={styles.headerB}>
        <nav className={styles.navbar}>
          <h2 className="clickable_white">내차사기</h2>
          <Link to='/' className="clickable_white">Home</Link>
          <Link to='/?filter=korean' className="clickable_white">국산</Link>
          <Link to='/?filter=imported' className="clickable_white">수입</Link>
          <Link to="/" className="clickable_white">전기·친환경</Link>
          <Link to="/" className="clickable_white">화물·특장</Link>
          <Link to="/" className="clickable_white">엔카믿고</Link>
          {role === 'admin' && <Link to="/admin" className="clickable_white">Admin</Link>}
          {role === 'workshop' && <Link to="/workshop" className="clickable_white">Workshop</Link>}
        </nav>
  
        <div className={styles.headerB_Middle}>
          <h4 className="clickable_white">내차팔기</h4>
          <h4 className="clickable_white">비교견적</h4>
          <h4 className="clickable_white">직거래</h4>
        </div>
  
        <div className={styles.headerB_Right}>
          <h4 className="clickable_white">내차관리</h4>
          <h4 className="clickable_white">내차등록</h4>
          <h4 className="clickable_white">내차조회</h4>
        </div>
      </div>
  
      <ul className={styles.headerB_B}>
        <li className="checked">국산차 검색</li>
        <li>엔카진단 차량</li>
        <li>리스·렌트차량</li>
        <li>리스·렌트 제휴물</li>
        <li>엔카종합보증</li>
        <li>엔카중고차론</li>
        <li>엔카프리미엄 진단</li>
      </ul>
    </header>
  );
  
}
export default Header;