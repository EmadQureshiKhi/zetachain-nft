'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/Button';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { useUniversalNFT } from '@/hooks/useUniversalNFT';
import { motion } from 'framer-motion';
import { NFT } from '@/lib/types';
import toast from 'react-hot-toast';

interface CrossChainTransferProps {
  nft: NFT;
  ethereumWallet?: {
    address: string;
    chainId: number;
    connected: boolean;
  } | null;
  onTransferComplete?: () => void;
}

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', testnet: false, icon: '🔷' },
  { id: 5, name: 'Goerli Testnet', symbol: 'ETH', testnet: true, icon: '🔷' },
  { id: 11155111, name: 'Sepolia Testnet', symbol: 'ETH', testnet: true, icon: '🔷' },
  { id: 56, name: 'BNB Chain', symbol: 'BNB', testnet: false, icon: '🟡' },
  { id: 97, name: 'BNB Testnet', symbol: 'BNB', testnet: true, icon: '🟡' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', testnet: false, icon: '🟣' },
  { id: 80001, name: 'Mumbai Testnet', symbol: 'MATIC', testnet: true, icon: '🟣' },
];

export function CrossChainTransfer({ nft, ethereumWallet, onTransferComplete }: CrossChainTransferProps) {
  const { connected: solanaConnected } = useWallet();
  const { transferCrossChain, loading } = useUniversalNFT();
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [customRecipient, setCustomRecipient] = useState('');
  const [useConnectedWallet, setUseConnectedWallet] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedChain = SUPPORTED_CHAINS.find(chain => chain.id === selectedChainId);
  const recipientAddress = useConnectedWallet ? ethereumWallet?.address : customRecipient;

  const handleTransfer = async () => {
    if (!solanaConnected) {
      toast.error('Please connect your Solana wallet');
      return;
    }

    if (!selectedChainId) {
      toast.error('Please select a destination chain');
      return;
    }

    if (!recipientAddress) {
      toast.error('Please provide a recipient address');
      return;
    }

    try {
      const mintPublicKey = new PublicKey(nft.tokenId);
      
      console.log('🌉 Initiating cross-chain transfer:', {
        nft: nft.name,
        mint: nft.tokenId,
        destinationChain: selectedChain?.name,
        recipient: recipientAddress,
      });

      const result = await transferCrossChain(
        mintPublicKey,
        selectedChainId,
        recipientAddress
      );

      if (result) {
        toast.success(`🎉 Cross-chain transfer initiated! NFT "${nft.name}" is being sent to ${selectedChain?.name}`, {
          duration: 8000,
        });
        
        onTransferComplete?.();
        
        // Reset form
        setSelectedChainId(null);
        setCustomRecipient('');
        setIsExpanded(false);
      }
    } catch (error) {
      console.error('❌ Transfer failed:', error);
    }
  };

  const isTransferReady = solanaConnected && selectedChainId && recipientAddress;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌉</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Cross-Chain Transfer</h3>
              <p className="text-sm text-gray-400">Send this NFT to another blockchain</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isTransferReady && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Transfer Interface */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-800"
        >
          <div className="p-6 space-y-6">
            {/* Prerequisites Check */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3">Prerequisites</h4>
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 text-sm ${solanaConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${solanaConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>Solana wallet connected</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${ethereumWallet?.connected ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${ethereumWallet?.connected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span>Destination wallet connected {!ethereumWallet?.connected && '(optional)'}</span>
                </div>
              </div>
            </div>

            {/* Chain Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Select Destination Chain
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORTED_CHAINS.filter(chain => chain.testnet).map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChainId(chain.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedChainId === chain.id
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{chain.icon}</span>
                      <div className="text-left">
                        <div className="text-white font-medium text-sm">{chain.name}</div>
                        <div className="text-gray-400 text-xs">{chain.symbol}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                💡 Using testnets for safe testing of cross-chain functionality
              </div>
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Recipient Address
              </label>
              
              {ethereumWallet?.connected && (
                <div className="mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useConnectedWallet}
                      onChange={() => setUseConnectedWallet(true)}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-white">Use connected wallet</span>
                  </label>
                  {useConnectedWallet && (
                    <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="text-blue-400 text-sm font-medium">Connected Wallet</div>
                      <div className="text-white font-mono text-sm break-all">
                        {ethereumWallet.address}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input
                  type="radio"
                  checked={!useConnectedWallet}
                  onChange={() => setUseConnectedWallet(false)}
                  className="text-purple-600"
                />
                <span className="text-sm text-white">Use custom address</span>
              </label>

              {!useConnectedWallet && (
                <input
                  type="text"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  placeholder="0x... (Ethereum address)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              )}
            </div>

            {/* Transfer Summary */}
            {selectedChain && recipientAddress && (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3">Transfer Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">NFT:</span>
                    <span className="text-white">{nft.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white">Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">To:</span>
                    <span className="text-white">{selectedChain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recipient:</span>
                    <span className="text-white font-mono text-xs">
                      {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Button */}
            <Button
              variant="primary"
              onClick={handleTransfer}
              disabled={!isTransferReady || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Initiating Transfer...</span>
                </div>
              ) : (
                `🌉 Transfer to ${selectedChain?.name || 'Selected Chain'}`
              )}
            </Button>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-yellow-400 text-sm">
                ⚠️ <strong>Testnet Transfer:</strong> This will burn the NFT on Solana and mint it on the destination chain. 
                Make sure you're using testnet addresses for testing.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}