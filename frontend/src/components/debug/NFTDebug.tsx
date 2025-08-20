'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

export function NFTDebug() {
  const { publicKey, connected } = useWallet();
  const { nfts, loading, isTestnet } = useAppStore();
  const [isMinimized, setIsMinimized] = useState(false);

  const testFetch = async () => {
    if (!publicKey) return;

    console.log('🔍 Testing NFT fetch for wallet:', publicKey.toString());

    try {
      const { SolanaNFTService } = await import('@/lib/solana-nft-service');
      const service = new SolanaNFTService(isTestnet ? 'devnet' : 'mainnet');

      console.log(`🌐 Using ${isTestnet ? 'DEVNET' : 'MAINNET'} network`);

      console.log('📡 Fetching NFTs...');
      const nfts = await service.fetchNFTsByOwner(publicKey.toString());

      console.log(`✅ Found ${nfts.length} NFTs:`, nfts);

      // Log each NFT
      nfts.forEach((nft, index) => {
        console.log(`NFT ${index + 1}:`, {
          name: nft.name,
          id: nft.id,
          chain: nft.chain,
        });
      });

    } catch (error) {
      console.error('❌ Error fetching NFTs:', error);

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Rate limit') || errorMessage.includes('403')) {
        console.log('💡 This is a rate limit error - normal for mainnet free RPCs');
      }
    }
  };

  if (!connected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-800 rounded-xl max-w-sm transition-all duration-200">
      {/* Header with minimize button */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-white font-semibold">NFT Debug</h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Collapsible content */}
      {!isMinimized && (
        <div className="px-4 pb-4 space-y-2 text-sm">
          <div className="text-gray-400">
            Network: <span className={isTestnet ? 'text-yellow-400' : 'text-green-400'}>
              {isTestnet ? 'DEVNET' : 'MAINNET'}
            </span>
          </div>
          <div className="text-gray-400">
            Wallet: {publicKey?.toString().slice(0, 8)}...
          </div>
          <div className="text-gray-400">
            NFTs in store: {nfts.length}
          </div>
          <div className="text-gray-400">
            Loading: {loading.nfts ? 'Yes' : 'No'}
          </div>
          <div className="space-y-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testFetch}
              className="w-full"
            >
              Test Fetch
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )}

      {/* Minimized state indicator */}
      {isMinimized && (
        <div className="px-4 pb-4 text-xs text-gray-500">
          {nfts.length} NFTs • {isTestnet ? 'DEV' : 'MAIN'} • {loading.nfts ? 'Loading...' : 'Ready'}
        </div>
      )}
    </div>
  );
}