'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NFT, ChainId } from '@/lib/types';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { CHAIN_CONFIG } from '@/lib/config';
import { truncateAddress } from '@/lib/utils';

interface TransferModalProps {
  nft: NFT;
  onClose: () => void;
}

export function TransferModal({ nft, onClose }: TransferModalProps) {
  const { wallets, loading, setLoading } = useAppStore();
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  
  // Available destination chains (exclude current chain)
  const availableChains = Object.keys(CHAIN_CONFIG).filter(
    chain => chain !== nft.chain && wallets[chain as keyof typeof wallets]?.connected
  ) as ChainId[];
  
  const handleTransfer = async () => {
    if (!selectedChain || !recipientAddress) return;
    
    setStep('processing');
    setLoading('transferring', true);
    
    try {
      // TODO: Implement actual cross-chain transfer logic
      // This would call your Universal NFT program
      
      // Simulate transfer process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStep('success');
    } catch (error) {
      console.error('Transfer failed:', error);
      setStep('confirm');
    } finally {
      setLoading('transferring', false);
    }
  };
  
  const getStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Destination Chain</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableChains.map((chain) => (
                  <motion.button
                    key={chain}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedChain(chain)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedChain === chain
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <ChainBadge chain={chain} size="md" />
                    <p className="text-gray-400 text-sm mt-2">
                      Connected: {truncateAddress(wallets[chain as keyof typeof wallets]?.address || '')}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {selectedChain && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address on {CHAIN_CONFIG[selectedChain].name}
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder={`Enter ${CHAIN_CONFIG[selectedChain].name} address...`}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </motion.div>
            )}
            
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep('confirm')}
                disabled={!selectedChain || !recipientAddress}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );
        
      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Confirm Transfer</h3>
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">NFT:</span>
                  <span className="text-white font-medium">{nft.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">From:</span>
                  <ChainBadge chain={nft.chain} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">To:</span>
                  <ChainBadge chain={selectedChain!} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-mono text-sm">{truncateAddress(recipientAddress)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ This will burn the NFT on {CHAIN_CONFIG[nft.chain].name} and mint it on {CHAIN_CONFIG[selectedChain!].name}. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={() => setStep('select')} className="flex-1">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleTransfer}
                loading={loading.transferring}
                className="flex-1"
              >
                Confirm Transfer
              </Button>
            </div>
          </div>
        );
        
      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Processing Transfer</h3>
              <p className="text-gray-400">
                Burning NFT on {CHAIN_CONFIG[nft.chain].name} and minting on {CHAIN_CONFIG[selectedChain!].name}...
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                This may take a few minutes. Please don't close this window.
              </p>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Transfer Successful!</h3>
              <p className="text-gray-400">
                Your NFT has been successfully transferred to {CHAIN_CONFIG[selectedChain!].name}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 text-sm">
                ✅ NFT is now available on {CHAIN_CONFIG[selectedChain!].name} at {truncateAddress(recipientAddress)}
              </p>
            </div>
            <Button variant="primary" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-white">
              Transfer NFT
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {getStepContent()}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}