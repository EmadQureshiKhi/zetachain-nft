import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

export function useMultiChainWallet() {
  const { setWalletState } = useAppStore();
  
  // Solana wallet
  const {
    wallet: solanaWallet,
    publicKey: solanaPublicKey,
    connected: solanaConnected,
    connecting: solanaConnecting,
    disconnect: disconnectSolana,
  } = useWallet();
  
  // Update Solana wallet state
  useEffect(() => {
    setWalletState('solana', {
      connected: solanaConnected,
      address: solanaPublicKey?.toString() || null,
      balance: 0, // TODO: Fetch actual balance
    });
  }, [solanaConnected, solanaPublicKey, setWalletState]);
  
  // Mock EVM wallet states for demo
  useEffect(() => {
    setWalletState('ethereum', {
      connected: false,
      address: null,
      balance: 0,
    });
    
    setWalletState('bnb', {
      connected: false,
      address: null,
      balance: 0,
    });
  }, [setWalletState]);
  
  const disconnectAll = async () => {
    if (solanaConnected) {
      await disconnectSolana();
    }
  };
  
  return {
    solana: {
      wallet: solanaWallet,
      publicKey: solanaPublicKey,
      connected: solanaConnected,
      connecting: solanaConnecting,
      disconnect: disconnectSolana,
    },
    ethereum: {
      address: null,
      connected: false,
      balance: null,
      disconnect: () => {},
    },
    disconnectAll,
  };
}