'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';

export function SimpleWalletButton() {
  const { connected, publicKey, disconnect } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-gray-800/50 px-3 py-2 rounded-lg">
          <div className="text-xs text-gray-400">Connected</div>
          <div className="text-white text-sm font-mono">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-4">👛</div>
        <h3 className="text-lg font-bold text-white mb-2">Connect Your Solana Wallet</h3>
        <p className="text-gray-400 mb-6">
          Choose your preferred Solana wallet to continue
        </p>
      </div>
      
      {/* Standard Wallet Multi Button with custom styling */}
      <div className="flex justify-center">
        <div className="wallet-adapter-button-trigger-wrapper">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !border-none !rounded-xl !px-6 !py-3 !text-white !font-medium !transition-all" />
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500">
        <p>Don't have a wallet? Install one:</p>
        <div className="flex justify-center space-x-4 mt-2">
          <button
            onClick={() => window.open('https://phantom.app/', '_blank')}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Phantom
          </button>
          <button
            onClick={() => window.open('https://solflare.com/', '_blank')}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Solflare
          </button>
        </div>
      </div>
    </div>
  );
}