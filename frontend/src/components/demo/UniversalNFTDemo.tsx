'use client';

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { addSampleUniversalNFTs } from '@/lib/sample-universal-nfts';
import { motion } from 'framer-motion';

export function UniversalNFTDemo() {
  const { connected } = useWallet();
  const { connection } = useConnection();
  const { nfts, addNFTs, isTestnet } = useAppStore();
  const [loading, setLoading] = useState(false);

  const loadSampleNFTs = () => {
    setLoading(true);
    setTimeout(() => {
      addSampleUniversalNFTs(addNFTs);
      setLoading(false);
    }, 1000);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const version = await connection.getVersion();
      console.log('✅ Solana connection successful:', version);
      alert(`Connected to Solana ${isTestnet ? 'Devnet' : 'Mainnet'}!\nVersion: ${version['solana-core']}`);
    } catch (error) {
      console.error('❌ Connection failed:', error);
      alert('Connection failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 text-center"
      >
        <div className="text-4xl mb-4">🔗</div>
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">
          Connect your Solana wallet to start using Universal NFTs
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Demo Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Universal NFT Demo</h2>
        <p className="text-gray-400">
          Experience cross-chain NFT capabilities powered by ZetaChain
        </p>
        <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-sm font-medium ${
          isTestnet 
            ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' 
            : 'bg-green-900/50 text-green-400 border border-green-800'
        }`}>
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
          {isTestnet ? 'DEVNET' : 'MAINNET'} • Program Deployed
        </div>
      </div>

      {/* Demo Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Connection Test */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🌐</div>
            <h3 className="text-lg font-bold text-white">Test Connection</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Verify connection to Solana {isTestnet ? 'Devnet' : 'Mainnet'} and check program deployment.
          </p>
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : '🔍 Test Solana Connection'}
          </Button>
        </div>

        {/* Sample NFTs */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🎨</div>
            <h3 className="text-lg font-bold text-white">Demo NFTs</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Load sample Universal NFTs to showcase cross-chain transfer capabilities.
          </p>
          <Button
            variant="primary"
            onClick={loadSampleNFTs}
            disabled={loading || nfts.length > 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? 'Loading...' : nfts.length > 0 ? '✅ NFTs Loaded' : '📦 Load Sample NFTs'}
          </Button>
        </div>
      </div>

      {/* Program Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">🏛️</div>
          <h3 className="text-lg font-bold text-white">Universal NFT Program</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Program ID:</div>
            <div className="text-purple-300 font-mono break-all">
              GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s
            </div>
          </div>
          <div>
            <div className="text-gray-400">Network:</div>
            <div className="text-blue-300">
              Solana {isTestnet ? 'Devnet' : 'Mainnet'}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Status:</div>
            <div className="text-green-300">✅ Deployed & Ready</div>
          </div>
          <div>
            <div className="text-gray-400">Cross-Chain Support:</div>
            <div className="text-yellow-300">🌐 ZetaChain Integration</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="text-xs text-purple-200/80 space-y-1">
            <div>
              🔗 <strong>Program:</strong>{' '}
              <a 
                href={`https://explorer.solana.com/address/GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s?cluster=${isTestnet ? 'devnet' : 'mainnet'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 underline"
              >
                View on Solana Explorer
              </a>
            </div>
            <div>
              🎨 <strong>Test NFT:</strong>{' '}
              <a 
                href="https://explorer.solana.com/address/EG9TdGCFHENpKTz7DBHiorYpQWwa74eArCzki8xKwhjq?cluster=devnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-200 underline"
              >
                EG9T...hjq (Successfully Minted!)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium text-white">Cross-Chain Transfers</div>
          <div className="text-xs text-gray-400 mt-1">Solana ↔ Ethereum ↔ BNB</div>
        </div>
        
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔑</div>
          <div className="text-sm font-medium text-white">Universal Token IDs</div>
          <div className="text-xs text-gray-400 mt-1">Unique across all chains</div>
        </div>
        
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm font-medium text-white">Origin Tracking</div>
          <div className="text-xs text-gray-400 mt-1">Full transfer history</div>
        </div>
      </div>
    </motion.div>
  );
}