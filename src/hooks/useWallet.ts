import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * MetaMask 지갑 연결 상태를 관리하는 커스텀 훅
 */
export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  /**
   * MetaMask 연결 요청
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask가 설치되어 있지 않습니다.');
      return;
    }
    try {
      const _provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await _provider.send('eth_requestAccounts', []);
      const network = await _provider.getNetwork();

      setProvider(_provider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setConnected(true);
    } catch (error) {
      console.error('지갑 연결 오류:', error);
    }
  };

  /**
   * 상태 초기화 (연결 해제)
   */
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    setConnected(false);
  };

  // 계정 또는 네트워크 변경 이벤트 핸들러
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else setAccount(accounts[0]);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // 초기 연결 상태 확인
  useEffect(() => {
    const checkInitialConnection = async () => {
      if (!window.ethereum) return;

      const _provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await _provider.send('eth_accounts', []);

      if (accounts.length > 0) {
        const network = await _provider.getNetwork();
        setProvider(_provider);
        setAccount(accounts[0]);
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
