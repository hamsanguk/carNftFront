import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask가 설치되어 있지 않습니다.');
      return;
    }
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await _provider.send('eth_requestAccounts', []);
      const network = await _provider.getNetwork();

      setProvider(_provider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setConnected(true);
    } catch (error) {
      console.error('지갑 연결 오류:', error);
    }
  };

  const disconnectWallet = () => {//메타마스크 조정이 아니면 삭제
    setAccount(null);
    setProvider(null);
    setChainId(null);
    setConnected(false);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else setAccount(accounts[0]);
    };

    const handleChainChanged = (_chainId: string) => {
      window.location.reload(); //network변경시 새로고침
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  useEffect(() => {
    const checkInitialConnection = async () => {
      if (!window.ethereum) return;
  
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts: string[] = await _provider.send('eth_accounts', []);
  
      if (accounts.length > 0) {
        const network = await _provider.getNetwork();
  
        setProvider(_provider);
        setAccount(accounts[0]); // ✅ string만 들어가도록 명확히 함
        setChainId(Number(network.chainId));
        setConnected(true);
      }
    };
  
    checkInitialConnection();
  }, []);
  

  return {
    account,
    provider,
    chainId,
    connected,
    connectWallet,
    disconnectWallet,
  };
};
