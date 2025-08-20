'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { WalletConnectionHub } from '@/components/wallet/WalletConnectionHub';
import { NFTGallery } from '@/components/nft/NFTGallery';
import { useAppStore } from '@/store/useAppStore';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useSolanaNFTs } from '@/hooks/useSolanaNFTs';
import { Button } from '@/components/ui/Button';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { ClientOnly } from '@/components/ClientOnly';
import { NFTDebug } from '@/components/debug/NFTDebug';
import { UniversalNFTDashboard } from '@/components/nft/UniversalNFTDashboard';
import { UniversalNFTDebug } from '@/components/debug/UniversalNFTDebug';
import { WalletDebug } from '@/components/debug/WalletDebug';

export default function Home() {
  const { wallets, isTestnet, setIsTestnet, nfts } = useAppStore();
  const { solana, ethereum } = useMultiChainWallet();
  const { refreshNFTs, error } = useSolanaNFTs();
  
  const hasConnectedWallets = Object.values(wallets).some(wallet => wallet.connected);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="text-2xl">🌉</div>
                <div>
                  <h1 className="text-xl font-bold text-white">Universal NFT</h1>
                  <p className="text-xs text-gray-400">Cross-Chain NFT Platform</p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Network Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Network:</span>
                <Button
                  variant={isTestnet ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsTestnet(!isTestnet)}
                >
                  {isTestnet ? 'Testnet' : 'Mainnet'}
                </Button>
              </div>
              
              {/* Wallet Status & Logout */}
              {hasConnectedWallets ? (
                <div className="flex items-center space-x-3">
                  {/* Chain Status */}
                  <div className="flex items-center space-x-2">
                    {Object.entries(wallets)
                      .filter(([_, wallet]) => wallet.connected)
                      .map(([chain]) => (
                        <ChainBadge key={chain} chain={chain} size="sm" showName={false} />
                      ))}
                  </div>
                  
                  {/* Wallet Address Display */}
                  {solana.connected && solana.publicKey && (
                    <div className="hidden sm:flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-mono">
                        {solana.publicKey.toString().slice(0, 4)}...{solana.publicKey.toString().slice(-4)}
                      </span>
                    </div>
                  )}
                  
                  {/* Logout Button */}
                  <LogoutButton />
                </div>
              ) : (
                /* Connect Wallet Button in Header */
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Scroll to wallet connection section
                    const walletSection = document.querySelector('[data-wallet-section]');
                    walletSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Universal{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NFTs
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Experience cross-chain NFT capabilities powered by ZetaChain
            </p>
            <div className="inline-flex items-center gap-2 bg-green-900/50 text-green-400 border border-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              DEVNET • Program Deployed
            </div>
            
            {!hasConnectedWallets && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <div className="flex items-center space-x-2 text-gray-400">
                  <ChainBadge chain="solana" size="sm" />
                  <span>↔</span>
                  <ChainBadge chain="ethereum" size="sm" />
                  <span>↔</span>
                  <ChainBadge chain="bnb" size="sm" />
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* Wallet Connection */}
          <ClientOnly fallback={
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading wallet connection...</p>
              </div>
            </div>
          }>
            {!hasConnectedWallets ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                data-wallet-section
              >
                <WalletConnectionHub />
              </motion.div>
            ) : (
              <UniversalNFTDashboard />
            )}
          </ClientOnly>
          
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 py-12"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-white mb-2">Cross-Chain Transfers</h3>
              <p className="text-gray-400">
                Move your NFTs between Solana, Ethereum, and BNB Chain with just a few clicks.
              </p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Trustless</h3>
              <p className="text-gray-400">
                Powered by ZetaChain's universal interoperability with built-in security.
              </p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Fast & Efficient</h3>
              <p className="text-gray-400">
                Optimized for speed with minimal fees across all supported chains.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>Built for ZetaChain Universal Interoperability Hackathon</p>
            <p className="mt-2 text-sm">
              Powered by{' '}
              <span className="text-purple-400 font-medium">ZetaChain</span>
              {' • '}
              <span className="text-purple-400 font-medium">Solana</span>
              {' • '}
              <span className="text-blue-400 font-medium">Ethereum</span>
              {' • '}
              <span className="text-yellow-400 font-medium">BNB Chain</span>
            </p>
            <p className="mt-3 text-xs text-green-400">
              ✅ Universal NFT Program: GQ8Q...vD4s • Successfully Deployed on Devnet
            </p>
          </div>
        </div>
      </footer>
      
      {/* Debug Components */}
      <ClientOnly>
        <NFTDebug />
        <UniversalNFTDebug />
        <WalletDebug />
      </ClientOnly>
    </div>
  );
}