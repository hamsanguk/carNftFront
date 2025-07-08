import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  chainId: number | null;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const connectWallet = async () => {
    if (isConnecting || connected) return;
    if (!window.ethereum) {
      alert('MetaMask가 설치되어 있지 않습니다.');
      return;
    }
    try {
      setIsConnecting(true);
      const _provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await _provider.send('eth_requestAccounts', []);
      const network = await _provider.getNetwork();

      setProvider(_provider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setConnected(true);
    } catch (error) {
      console.error('지갑 연결 오류:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    setConnected(false);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // 초기 연결 상태 확인
    const checkInitialConnection = async () => {
      try {
        const _provider = new BrowserProvider(window.ethereum);
        const accounts: string[] = await _provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          const network = await _provider.getNetwork();
          setProvider(_provider);
          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
          setConnected(true);
        }
      } catch (err) {
        console.error("초기 연결 확인 실패", err);
      }
    };

    checkInitialConnection();

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const value = { account, provider, chainId, connected, connectWallet, disconnectWallet };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
