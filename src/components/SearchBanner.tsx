import React from 'react';
import styles from './css/SeachBanner.module.css'

interface SearchBannerProps{
    className?: string;
    totalNft:number;
    withHistory:number;
}

const SearchBanner: React.FC<SearchBannerProps> = ({ className, totalNft, withHistory }) => {
    return (
      <div className={`${styles.bannerBox} ${className || ''}`}>
        <strong className={styles.title}>NFT 인증 차량 플랫폼</strong>
        <div className={styles.stats}>
          <div>현재 등록된 NFT 차량: <strong>{totalNft}대</strong></div>
          <div>인증 대기 중 일반 차량: <strong>100,100건</strong></div>
          <div>정비소 관리 이력 보유 차량: <strong>{withHistory}대</strong></div>
        </div>
      </div>
    );
  };

  export default SearchBanner;
