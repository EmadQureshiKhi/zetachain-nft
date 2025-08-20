'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { MultiChainWalletManager } from '@/components/wallet/MultiChainWalletManager';
import { CrossChainTransfer } from './CrossChainTransfer';
import { NFTCard } from './NFTCard';
import { Button } from '@/components/ui/Button';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { NFT } from '@/lib/types';

interface WalletState {
  solana: { connected: boolean; publicKey: any };
  ethereum: { address: string; chainId: number; connected: boolean } | null;
}

export function CrossChainTransferTab() {
  const { nfts } = useAppStore();
  const [wallets, setWallets] = useState<WalletState>({
    solana: { connected: false, publicKey: null },
    ethereum: null
  });
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showTransferInterface, setShowTransferInterface] = useState(false);

  // Filter NFTs that can be transferred (currently on Solana)
  const transferableNFTs = nfts.filter(nft => nft.chain === 'solana');

  const handleWalletChange = useCallback((newWallets: WalletState) => {
    setWallets(newWallets);
  }, []);

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowTransferInterface(true);
  };

  const handleTransferComplete = () => {
    setSelectedNFT(null);
    setShowTransferInterface(false);
    // Optionally refresh NFTs or show success message
  };

  const isReadyForTransfer = wallets.solana.connected && transferableNFTs.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Cross-Chain NFT Transfer</h2>
        <p className="text-gray-400">
          Transfer your NFTs between Solana and EVM chains using ZetaChain
        </p>
      </div>

      {/* Multi-Chain Wallet Manager */}
      <MultiChainWalletManager onWalletChange={handleWalletChange} />

      {/* Transfer Interface */}
      {isReadyForTransfer ? (
        <div className="space-y-6">
          {/* NFT Selection */}
          {!showTransferInterface ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Select NFT to Transfer</h3>
                <p className="text-gray-400">
                  Choose an NFT from your Solana collection to transfer to another chain
                </p>
              </div>

              {transferableNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transferableNFTs.map((nft) => (
                    <div key={nft.id} className="relative">
                      <NFTCard
                        nft={nft}
                        onTransfer={() => handleNFTSelect(nft)}
                        onView={() => {}}
                        showTransferButton={true}
                      />
                      <div className="absolute top-2 right-2">
                        <ChainBadge chain="solana" size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-lg font-bold text-white mb-2">No Transferable NFTs</h3>
                  <p className="text-gray-400 mb-4">
                    You need NFTs on Solana to transfer to other chains
                  </p>
                  <Button variant="primary" onClick={() => window.location.reload()}>
                    Refresh Collection
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            /* Transfer Interface */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setShowTransferInterface(false)}
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to NFT Selection</span>
              </Button>

              {/* Selected NFT Display */}
              {selectedNFT && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Selected NFT</h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src={selectedNFT.image}
                      alt={selectedNFT.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{selectedNFT.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{selectedNFT.description}</p>
                      <div className="flex items-center space-x-2">
                        <ChainBadge chain={selectedNFT.chain} size="sm" />
                        <span className="text-xs text-gray-500">Current Chain</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cross-Chain Transfer Component */}
              {selectedNFT && (
                <CrossChainTransfer
                  nft={selectedNFT}
                  ethereumWallet={wallets.ethereum}
                  onTransferComplete={handleTransferComplete}
                />
              )}
            </motion.div>
          )}
        </div>
      ) : (
        /* Prerequisites */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800"
        >
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-xl font-bold text-white mb-2">Ready to Transfer?</h3>
          <div className="space-y-3 text-gray-400 mb-6">
            <div className={`flex items-center justify-center space-x-2 ${wallets.solana.connected ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${wallets.solana.connected ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>Connect Solana wallet</span>
            </div>
            <div className={`flex items-center justify-center space-x-2 ${transferableNFTs.length > 0 ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${transferableNFTs.length > 0 ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>Have NFTs on Solana</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Connect destination wallet (optional)</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Complete the prerequisites above to start transferring NFTs across chains
          </p>
        </motion.div>
      )}

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium text-white">Burn & Mint</div>
          <div className="text-xs text-gray-400 mt-1">Secure cross-chain transfer</div>
        </div>
        
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🌐</div>
          <div className="text-sm font-medium text-white">ZetaChain Powered</div>
          <div className="text-xs text-gray-400 mt-1">Universal interoperability</div>
        </div>
        
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm font-medium text-white">Full History</div>
          <div className="text-xs text-gray-400 mt-1">Track all transfers</div>
        </div>
      </div>
    </div>
  );
}