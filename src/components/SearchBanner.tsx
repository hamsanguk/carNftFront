import React from 'react';
import styles from './css/SeachBanner.module.css'
import { useState,useEffect } from 'react';
import { ethers } from 'ethers';
interface SearchBannerProps{
    className?: string;
    totalNft:number;
    withHistory:number;
}
const RPC_URL = 'https://public-en-kairos.node.kaia.io';
const provider = new ethers.JsonRpcProvider(RPC_URL)
const SearchBanner: React.FC<SearchBannerProps> = ({ className, totalNft, withHistory }) => {

  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const[networkStatus, setNetworkStatus] = useState<'정상'|'지연'|'오프라인'>('정상');
  const[gasPrice, setGasPrice] = useState<string>('...');
  const[avgTxDelay, setAvgTxDelay] = useState<string>('...');

  const toGwei = ( v:bigint | null | undefined ):string | null =>
    typeof v === 'bigint' ? ethers.formatUnits(v,9):null;

  const fetchNetworkData = async () => {
    try {
      const latestBlock = await provider.getBlockNumber();
      setBlockNumber(latestBlock);
  
      // v6에서는 getFeeData()가 기본
      const fee = await provider.getFeeData();
  
      // gasPrice 필드 사용 (bigint | null)
      let gweiStr = toGwei(fee.gasPrice);
  
      // maxFeePerGas 폴백 (EIP-1559 네트워크용)
      if (!gweiStr) gweiStr = toGwei(fee.maxFeePerGas);
  
      setGasPrice(gweiStr ? `${gweiStr} Gwei` : 'N/A');
      setNetworkStatus('정상');
    } catch (err) {
      console.error('네트워크 연결 실패:', err);
      setNetworkStatus('오프라인');
    }
  };


  const fetchTxDelay = async () => {
    try {
      const latestBlock = await provider.getBlock('latest');
      if (!latestBlock) {
        setAvgTxDelay('블록 데이터 없음');
        return;
      }
  
      if (latestBlock.transactions.length === 0) {
        setAvgTxDelay('트랜잭션 없음');
        return;
      }
  
      const txHash = latestBlock.transactions[0];
      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.blockNumber) {
        setAvgTxDelay('트랜잭션 데이터 없음');
        return;
      }
  
      const block = await provider.getBlock(tx.blockNumber);
      if (!block) {
        setAvgTxDelay('블록 정보 불러오기 실패');
        return;
      }
  
      // block.timestamp는 초 단위 Unix Time
      const delay = latestBlock.timestamp - block.timestamp;
      setAvgTxDelay(`${delay}초`);
    } catch (err) {
      console.error('대기 시간 측정 실패:', err);
      setAvgTxDelay('측정 실패');
    }
  };
  

  useEffect(() => {
    fetchNetworkData();
    fetchTxDelay();
    const interval = setInterval(() => {
      fetchNetworkData();
      fetchTxDelay();
    }, 15000); // 15초마다 갱신
    return () => clearInterval(interval);
  }, []);


    return (
      <div className={`${styles.bannerBox} ${className || ''}`}>
        <strong className={styles.title}>NFT 인증 차량 플랫폼</strong>
        <div className={styles.stats}>
          <div>현재 등록된 NFT 차량: <strong>{totalNft}대</strong></div>
          <div>인증 대기 중 일반 차량: <strong>100,100건</strong></div>
          <div>정비소 관리 이력 보유 차량: <strong>{withHistory}대</strong></div>
        </div>
       <ol className={styles.stats}>
       <li>네트워크 가스비: <strong>{gasPrice}</strong></li>
        <li>네트워크 상태: <strong>{networkStatus}</strong></li>
      
        <li>평균 트랜잭션 대기시간:<strong>{avgTxDelay}</strong></li>
        <li>메인넷 블록 높이: <strong>{blockNumber ?? '...'}</strong></li>
       </ol>
      </div>
    );
  };

  export default SearchBanner;
