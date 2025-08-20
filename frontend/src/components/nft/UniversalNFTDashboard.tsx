'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NFTGallery } from './NFTGallery';
import { UniversalNFTMinter } from './UniversalNFTMinter';
import { CrossChainTransferTab } from './CrossChainTransferTab';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { addSampleUniversalNFTs } from '@/lib/sample-universal-nfts';
import { UniversalNFTDemo } from '@/components/demo/UniversalNFTDemo';

type TabType = 'gallery' | 'mint' | 'transfer' | 'universal';

export function UniversalNFTDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const { nfts, addNFTs } = useAppStore();

  const loadSampleNFTs = () => {
    addSampleUniversalNFTs(addNFTs);
  };

  const tabs = [
    {
      id: 'gallery' as TabType,
      name: 'My NFTs',
      icon: '🖼️',
      count: nfts.length,
      description: 'View your existing NFT collection',
    },
    {
      id: 'mint' as TabType,
      name: 'Mint Universal NFT',
      icon: '🎨',
      description: 'Create new cross-chain compatible NFTs',
    },
    {
      id: 'transfer' as TabType,
      name: 'Cross-Chain Transfer',
      icon: '🌉',
      description: 'Transfer NFTs between blockchains',
    },
    {
      id: 'universal' as TabType,
      name: 'Demo & Features',
      icon: '🌐',
      description: 'Test program and cross-chain features',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 h-auto flex flex-col items-center text-center space-y-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{tab.icon}</span>
                <span className="font-semibold">{tab.name}</span>
                {tab.count !== undefined && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </div>
              <p className="text-sm opacity-80">{tab.description}</p>
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
      >
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Demo Button */}
            {nfts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">No NFTs Yet</h3>
                <p className="text-gray-400 mb-6">
                  Load some sample Universal NFTs to see the interface in action, or mint your first NFT.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={loadSampleNFTs}
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    📦 Load Sample Universal NFTs
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab('mint')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    🎨 Mint Your First NFT
                  </Button>
                </div>
              </div>
            )}
            
            <NFTGallery />
          </div>
        )}
        
        {activeTab === 'mint' && <UniversalNFTMinter />}
        
        {activeTab === 'transfer' && <CrossChainTransferTab />}
        
        {activeTab === 'universal' && (
          <div className="space-y-8">
            {/* Demo Component */}
            <UniversalNFTDemo />
            
            {/* Features Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Universal NFT Features</h2>
              <p className="text-gray-400">
                Advanced cross-chain capabilities powered by ZetaChain
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cross-Chain Transfer */}
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🌐</div>
                  <h3 className="text-xl font-bold text-white">Cross-Chain Transfer</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Transfer your NFTs between Solana, Ethereum, BNB Chain, and other ZetaChain-connected networks.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Burn & Mint mechanism for security</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Metadata preservation across chains</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Origin tracking and history</span>
                  </div>
                </div>
              </div>

              {/* Universal Token IDs */}
              <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🔑</div>
                  <h3 className="text-xl font-bold text-white">Universal Token IDs</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Each NFT gets a unique identifier that works across all supported blockchains.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Unique 32-byte identifiers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Cross-chain compatibility</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Replay attack prevention</span>
                  </div>
                </div>
              </div>

              {/* ZetaChain Integration */}
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">⚡</div>
                  <h3 className="text-xl font-bold text-white">ZetaChain Integration</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Built on ZetaChain's universal interoperability protocol for seamless cross-chain operations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Universal blockchain connectivity</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Trustless cross-chain messaging</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Decentralized gateway protocol</span>
                  </div>
                </div>
              </div>

              {/* Smart Contract Security */}
              <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🔒</div>
                  <h3 className="text-xl font-bold text-white">Smart Contract Security</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Built with security-first principles and comprehensive testing for safe cross-chain operations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Compute budget optimization</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Proper authority verification</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✅</span>
                    <span>Rent exemption management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Go Universal?</h3>
              <p className="text-gray-300 mb-6">
                Start by minting your first Universal NFT and experience true cross-chain interoperability.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setActiveTab('mint')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                🎨 Mint Universal NFT
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}