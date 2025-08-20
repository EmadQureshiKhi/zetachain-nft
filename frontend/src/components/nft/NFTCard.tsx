'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NFT } from '@/lib/types';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { Button } from '@/components/ui/Button';
import { truncateAddress } from '@/lib/utils';

interface NFTCardProps {
  nft: NFT;
  onTransfer?: (nft: NFT) => void;
  onView?: (nft: NFT) => void;
  showTransferButton?: boolean;
}

export function NFTCard({ nft, onTransfer, onView, showTransferButton = true }: NFTCardProps) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-all duration-300"
    >
      {/* NFT Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageError ? (
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
            <div className="text-6xl opacity-50">🖼️</div>
          </div>
        )}
        
        {/* Chain Badge Overlay */}
        <div className="absolute top-3 left-3">
          <ChainBadge chain={nft.chain} size="sm" />
        </div>
        
        {/* Transfer History Indicator */}
        {nft.transferHistory && nft.transferHistory.length > 0 && (
          <div className="absolute top-3 right-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-1"
            >
              <span className="text-yellow-400 text-xs font-medium">
                🌉 {nft.transferHistory.length}
              </span>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* NFT Details */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-white font-bold text-lg mb-1 truncate">{nft.name}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{nft.description}</p>
        </div>
        
        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token ID:</span>
            <span className="text-white font-mono">{truncateAddress(nft.tokenId, 3)}</span>
          </div>
          
          {nft.originChain && nft.originChain !== nft.chain && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Origin:</span>
              <ChainBadge chain={nft.originChain} size="sm" />
            </div>
          )}
          
          {nft.metadata.creator && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Creator:</span>
              <span className="text-white font-mono">{truncateAddress(nft.metadata.creator)}</span>
            </div>
          )}
        </div>
        
        {/* Attributes */}
        {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                <div
                  key={index}
                  className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300"
                >
                  {attr.trait_type}: {attr.value}
                </div>
              ))}
              {nft.metadata.attributes.length > 3 && (
                <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">
                  +{nft.metadata.attributes.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(nft)}
              className={showTransferButton ? "flex-1" : "w-full"}
            >
              View Details
            </Button>
          )}
          {showTransferButton && onTransfer && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onTransfer(nft)}
              className="flex-1"
            >
              🌉 Transfer
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}