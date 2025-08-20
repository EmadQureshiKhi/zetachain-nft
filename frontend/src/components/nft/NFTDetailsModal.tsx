'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { NFT } from '@/lib/types';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { Button } from '@/components/ui/Button';
import { truncateAddress } from '@/lib/utils';

interface NFTDetailsModalProps {
  nft: NFT;
  onClose: () => void;
  onTransfer: () => void;
}

export function NFTDetailsModal({ nft, onClose, onTransfer }: NFTDetailsModalProps) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-white">
              NFT Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* NFT Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <ChainBadge chain={nft.chain} size="sm" />
              </div>
            </div>
            
            {/* NFT Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{nft.name}</h2>
                <p className="text-gray-400">{nft.description}</p>
              </div>
              
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token ID:</span>
                  <span className="text-white font-mono">{truncateAddress(nft.tokenId, 6)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Chain:</span>
                  <ChainBadge chain={nft.chain} size="sm" />
                </div>
                
                {nft.originChain && nft.originChain !== nft.chain && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Origin Chain:</span>
                    <ChainBadge chain={nft.originChain} size="sm" />
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-white font-mono">{truncateAddress(nft.owner)}</span>
                </div>
                
                {nft.metadata.creator && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creator:</span>
                    <span className="text-white font-mono">{truncateAddress(nft.metadata.creator)}</span>
                  </div>
                )}
                
                {nft.metadata.royalty && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Royalty:</span>
                    <span className="text-white">{nft.metadata.royalty}%</span>
                  </div>
                )}
              </div>
              
              {/* Attributes */}
              {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.metadata.attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 p-3 rounded-lg"
                      >
                        <div className="text-gray-400 text-xs uppercase tracking-wide">
                          {attr.trait_type}
                        </div>
                        <div className="text-white font-medium">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Transfer History */}
              {nft.transferHistory && nft.transferHistory.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Transfer History</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {nft.transferHistory.map((transfer, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 p-3 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <ChainBadge chain={transfer.fromChain} size="sm" showName={false} />
                            <span className="text-gray-400">→</span>
                            <ChainBadge chain={transfer.toChain} size="sm" showName={false} />
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            transfer.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                            transfer.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {transfer.status}
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(transfer.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button variant="primary" onClick={onTransfer} className="flex-1">
                  🌉 Transfer
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}