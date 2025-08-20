'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NFTCard } from './NFTCard';
import { TransferModal } from './TransferModal';
import { NFTDetailsModal } from './NFTDetailsModal';
import { useAppStore } from '@/store/useAppStore';
import { NFT, ChainId } from '@/lib/types';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { Button } from '@/components/ui/Button';

export function NFTGallery() {
  const { nfts, loading, selectedChain, setSelectedChain, isTestnet } = useAppStore();
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterChain, setFilterChain] = useState<ChainId | 'all'>('all');
  
  // Filter NFTs by chain
  const filteredNfts = filterChain === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.chain === filterChain);
  
  // Group NFTs by chain for stats
  const nftsByChain = nfts.reduce((acc, nft) => {
    acc[nft.chain] = (acc[nft.chain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const handleTransfer = (nft: NFT) => {
    setSelectedNft(nft);
    setShowTransferModal(true);
  };
  
  const handleViewDetails = (nft: NFT) => {
    setSelectedNft(nft);
    setShowDetailsModal(true);
  };
  
  const chains: (ChainId | 'all')[] = ['all', 'solana', 'ethereum', 'bnb', 'zetachain'];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">Your NFT Collection</h2>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isTestnet 
                ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' 
                : 'bg-green-900/50 text-green-400 border border-green-800'
            }`}>
              {isTestnet ? 'DEVNET' : 'MAINNET'}
            </div>
          </div>
          <p className="text-gray-400">
            {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} across {Object.keys(nftsByChain).length} chain{Object.keys(nftsByChain).length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </Button>
          
          {/* Chain Stats */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(nftsByChain).map(([chain, count]) => (
              <div key={chain} className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                <ChainBadge chain={chain} size="sm" showName={false} />
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {chains.map((chain) => (
          <Button
            key={chain}
            variant={filterChain === chain ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterChain(chain)}
            className="flex items-center space-x-2"
          >
            {chain !== 'all' && <ChainBadge chain={chain} size="sm" showName={false} />}
            <span className="capitalize">
              {chain === 'all' ? 'All Chains' : chain}
            </span>
            {chain !== 'all' && nftsByChain[chain] && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {nftsByChain[chain]}
              </span>
            )}
          </Button>
        ))}
      </div>
      
      {/* Loading State */}
      {loading.nfts && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="text-gray-400">Loading your NFTs...</span>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!loading.nfts && filteredNfts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {filterChain === 'all' ? 'No NFTs Found' : `No NFTs on ${filterChain}`}
          </h3>
          <p className="text-gray-400 mb-6">
            {filterChain === 'all' 
              ? 'Start by minting your first Universal NFT or connect your wallets to see existing NFTs.'
              : `You don't have any NFTs on ${filterChain} yet.`
            }
          </p>
          <Button variant="primary" onClick={() => setFilterChain('all')}>
            {filterChain === 'all' ? 'Mint Your First NFT' : 'View All NFTs'}
          </Button>
        </motion.div>
      )}
      
      {/* NFT Grid */}
      {!loading.nfts && filteredNfts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredNfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <NFTCard
                  nft={nft}
                  onTransfer={handleTransfer}
                  onView={handleViewDetails}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Modals */}
      <AnimatePresence>
        {showTransferModal && selectedNft && (
          <TransferModal
            nft={selectedNft}
            onClose={() => {
              setShowTransferModal(false);
              setSelectedNft(null);
            }}
          />
        )}
        
        {showDetailsModal && selectedNft && (
          <NFTDetailsModal
            nft={selectedNft}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedNft(null);
            }}
            onTransfer={() => {
              setShowDetailsModal(false);
              setShowTransferModal(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}