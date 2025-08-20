'use client';

import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/Button';
import { useUniversalNFT } from '@/hooks/useUniversalNFT';
import { NFT } from '@/lib/types';
import { motion } from 'framer-motion';

interface UniversalNFTCardProps {
  nft: NFT;
  onTransfer?: () => void;
}

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', icon: '⟠', color: 'text-blue-400' },
  { id: 56, name: 'BNB Chain', icon: '🟡', color: 'text-yellow-400' },
  { id: 137, name: 'Polygon', icon: '🟣', color: 'text-purple-400' },
  { id: 8453, name: 'Base', icon: '🔵', color: 'text-blue-500' },
];

export function UniversalNFTCard({ nft, onTransfer }: UniversalNFTCardProps) {
  const { transferCrossChain, loading } = useUniversalNFT();
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [recipient, setRecipient] = useState('');

  const handleTransfer = async () => {
    if (!selectedChain || !recipient) {
      alert('Please select a destination chain and enter recipient address');
      return;
    }

    try {
      const mint = new PublicKey(nft.tokenId);
      const result = await transferCrossChain(mint, selectedChain, recipient);
      
      if (result) {
        setShowTransfer(false);
        setSelectedChain(null);
        setRecipient('');
        onTransfer?.();
      }
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-200"
    >
      {/* NFT Image */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-nft.png';
          }}
        />
        
        {/* Universal NFT Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            🌐 Universal
          </div>
        </div>

        {/* Chain Origin Badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {nft.originChain || 'Solana'}
          </div>
        </div>
      </div>

      {/* NFT Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white truncate">{nft.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{nft.description}</p>
        </div>

        {/* Attributes */}
        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Attributes</h4>
            <div className="grid grid-cols-2 gap-2">
              {nft.metadata.attributes.slice(0, 4).map((attr, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-2">
                  <div className="text-xs text-gray-400">{attr.trait_type}</div>
                  <div className="text-sm text-white font-medium truncate">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Universal NFT Info */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-300 font-medium mb-1">Universal Token ID</div>
          <div className="text-xs text-purple-200 font-mono break-all">
            {nft.tokenId.slice(0, 16)}...{nft.tokenId.slice(-8)}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!showTransfer ? (
            <Button
              variant="primary"
              onClick={() => setShowTransfer(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              🌐 Transfer Cross-Chain
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              {/* Chain Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Destination Chain
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setSelectedChain(chain.id)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        selectedChain === chain.id
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{chain.icon}</span>
                        <span>{chain.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x... or recipient address"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Transfer Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTransfer(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTransfer}
                  disabled={loading || !selectedChain || !recipient}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    '🚀 Transfer'
                  )}
                </Button>
              </div>

              {/* Transfer Info */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-2">
                <div className="text-xs text-yellow-300">
                  ⚠️ Cross-chain transfers are irreversible. Double-check the recipient address.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}