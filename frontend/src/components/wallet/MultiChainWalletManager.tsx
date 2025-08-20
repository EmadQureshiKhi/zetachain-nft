'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { motion } from 'framer-motion';

interface EthereumWallet {
  address: string;
  chainId: number;
  connected: boolean;
}

interface MultiChainWalletManagerProps {
  onWalletChange?: (wallets: { solana: any; ethereum: EthereumWallet | null }) => void;
}

export function MultiChainWalletManager({ onWalletChange }: MultiChainWalletManagerProps) {
  const { connected: solanaConnected, publicKey: solanaPublicKey } = useWallet();
  const [ethereumWallet, setEthereumWallet] = useState<EthereumWallet | null>(null);
  const [isConnectingEthereum, setIsConnectingEthereum] = useState(false);

  // Notify parent of wallet changes
  useEffect(() => {
    const walletState = {
      solana: { connected: solanaConnected, publicKey: solanaPublicKey },
      ethereum: ethereumWallet
    };
    onWalletChange?.(walletState);
  }, [solanaConnected, solanaPublicKey, ethereumWallet, onWalletChange]);

  const connectEthereumWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to connect Ethereum wallet');
      return;
    }

    setIsConnectingEthereum(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setEthereumWallet({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        connected: true,
      });

      console.log('✅ Ethereum wallet connected:', accounts[0]);
    } catch (error) {
      console.error('❌ Failed to connect Ethereum wallet:', error);
      alert('Failed to connect Ethereum wallet');
    } finally {
      setIsConnectingEthereum(false);
    }
  };

  const disconnectEthereumWallet = () => {
    setEthereumWallet(null);
    console.log('🔌 Ethereum wallet disconnected');
  };

  const switchEthereumNetwork = async (targetChainId: number) => {
    if (!window.ethereum || !ethereumWallet) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });

      setEthereumWallet(prev => prev ? { ...prev, chainId: targetChainId } : null);
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      // Handle specific error cases
      if (error.code === 4902) {
        // Chain not added to MetaMask
        console.log('Chain not added to MetaMask, user needs to add it manually');
      } else if (error.code === 4001) {
        // User rejected the request
        console.log('User rejected network switch request');
      } else {
        console.log('Network switch failed:', error.message || 'Unknown error');
      }
    }
  };

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      56: 'BNB Chain',
      97: 'BNB Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Multi-Chain Wallet Connection</h3>
        <p className="text-gray-400">Connect wallets from different chains for cross-chain transfers</p>
      </div>

      {/* Wallet Connections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Solana Wallet */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <ChainBadge chain="solana" size="md" />
            <h4 className="text-lg font-semibold text-white">Solana Wallet</h4>
          </div>

          {solanaConnected && solanaPublicKey ? (
            <div className="space-y-3">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 text-sm font-medium mb-1">✅ Connected</div>
                <div className="text-white font-mono text-sm break-all">
                  {solanaPublicKey.toString()}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                This wallet will be used to send NFTs from Solana
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-12 !text-white !font-medium" />
              <div className="text-xs text-gray-400">
                Connect your Solana wallet (Phantom, Solflare, etc.)
              </div>
            </div>
          )}
        </motion.div>

        {/* Ethereum/EVM Wallet */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <ChainBadge chain="ethereum" size="md" />
            <h4 className="text-lg font-semibold text-white">EVM Wallet</h4>
          </div>

          {ethereumWallet?.connected ? (
            <div className="space-y-3">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 text-sm font-medium mb-1">✅ Connected</div>
                <div className="text-white font-mono text-sm break-all">
                  {ethereumWallet.address}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {getChainName(ethereumWallet.chainId)}
                </div>
              </div>

              {/* Network Switcher */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-2">Switch to testnet for testing:</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchEthereumNetwork(5)}
                    className="text-xs"
                  >
                    Goerli
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchEthereumNetwork(97)}
                    className="text-xs"
                  >
                    BNB Testnet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchEthereumNetwork(80001)}
                    className="text-xs"
                  >
                    Mumbai
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectEthereumWallet}
                className="w-full text-red-400 hover:text-red-300"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={connectEthereumWallet}
                disabled={isConnectingEthereum}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isConnectingEthereum ? 'Connecting...' : '🦊 Connect MetaMask'}
              </Button>
              <div className="text-xs text-gray-400">
                This wallet will receive NFTs on EVM chains
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Connection Status */}
      {(solanaConnected || ethereumWallet?.connected) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="text-center">
            <div className="text-sm font-medium text-white mb-2">Wallet Connection Status</div>
            <div className="flex justify-center items-center space-x-4">
              <div className={`flex items-center space-x-2 ${solanaConnected ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${solanaConnected ? 'bg-green-400' : 'bg-gray-500'}`} />
                <span className="text-sm">Solana</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className={`flex items-center space-x-2 ${ethereumWallet?.connected ? 'text-blue-400' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${ethereumWallet?.connected ? 'bg-blue-400' : 'bg-gray-500'}`} />
                <span className="text-sm">EVM</span>
              </div>
            </div>
            {solanaConnected && ethereumWallet?.connected && (
              <div className="text-xs text-green-400 mt-2">
                ✅ Ready for cross-chain transfers!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}