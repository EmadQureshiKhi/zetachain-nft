'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';

const getWalletUrl = (walletName: string) => {
  switch (walletName) {
    case 'Phantom':
      return 'https://phantom.app/';
    case 'Solflare':
      return 'https://solflare.com/';
    case 'Torus':
      return 'https://tor.us/';
    default:
      return 'https://solana.com/ecosystem/explore?categories=wallet';
  }
};

export function SafeWalletButton() {
  const { select, connect, wallets, publicKey, disconnect, connected, connecting } = useWallet();
  const [error, setError] = useState<string | null>(null);

  // Debug wallet state changes
  useEffect(() => {
    console.log('🔍 Wallet state changed:', { connected, connecting, publicKey: publicKey?.toString() });
  }, [connected, connecting, publicKey]);

  const handleConnect = async (walletName: string) => {
    try {
      setError(null);
      console.log('🔗 Attempting to connect to:', walletName);
      
      const wallet = wallets.find(w => w.adapter.name === walletName);
      if (wallet) {
        console.log('👛 Wallet found:', wallet.adapter.name);
        console.log('📊 Wallet ready state:', wallet.readyState);
        
        // Method 1: Try using select + connect with proper waiting
        console.log('🔄 Selecting wallet...');
        select(wallet.adapter.name);
        
        // Wait longer and check if selection worked
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if wallet is actually selected
        console.log('🔍 Checking if wallet is selected...');
        
        try {
          console.log('🔄 Connecting wallet...');
          await connect();
          console.log('✅ Wallet connected via context');
        } catch (connectError) {
          console.log('⚠️ Context connect failed, trying direct approach...');
          
          // Method 2: Try direct wallet connection and then sync with context
          await wallet.adapter.connect();
          console.log('✅ Wallet connected directly');
          
          // Force a re-selection to sync the context
          select(wallet.adapter.name);
        }
      } else {
        throw new Error(`Wallet ${walletName} not found`);
      }
    } catch (err) {
      console.error('❌ Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setError(null);
    } catch (err) {
      console.error('Wallet disconnect error:', err);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-gray-800/50 px-3 py-2 rounded-lg">
          <div className="text-xs text-gray-400">Connected</div>
          <div className="text-white text-sm font-mono">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <div className="text-red-300 text-sm">
            ⚠️ Connection Error: {error}
          </div>
          <div className="text-red-200/60 text-xs mt-1">
            Try refreshing the page or using a different wallet
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {wallets.map((wallet) => {
          const isInstalled = wallet.readyState === 'Installed';
          const isLoadable = wallet.readyState === 'Loadable';
          
          // Show installed wallets and some loadable ones
          if (!isInstalled && !isLoadable) return null;
          
          return (
            <Button
              key={wallet.adapter.name}
              variant={isInstalled ? "outline" : "ghost"}
              onClick={() => isInstalled ? handleConnect(wallet.adapter.name) : window.open(getWalletUrl(wallet.adapter.name), '_blank')}
              disabled={connecting}
              className={`flex items-center space-x-2 p-4 h-auto ${!isInstalled ? 'opacity-60' : ''}`}
            >
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name}
                className="w-6 h-6"
              />
              <div className="text-left">
                <div className="text-sm">
                  {isInstalled ? `Connect ${wallet.adapter.name}` : `Install ${wallet.adapter.name}`}
                </div>
                <div className="text-xs text-gray-400">
                  {isInstalled ? 'Ready' : 'Not installed'}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Debug info */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-xs">
        <div className="text-gray-300">Debug Info:</div>
        <div className="text-gray-400">Connected: {connected ? 'Yes' : 'No'}</div>
        <div className="text-gray-400">Connecting: {connecting ? 'Yes' : 'No'}</div>
        <div className="text-gray-400">PublicKey: {publicKey ? publicKey.toString().slice(0, 8) + '...' : 'None'}</div>
      </div>

      {/* Fallback to standard wallet button if custom doesn't work */}
      {error && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-blue-300 text-sm mb-2">
            💡 Trying standard wallet connection...
          </div>
          <div className="wallet-adapter-button-trigger-wrapper">
            <WalletMultiButton />
          </div>
        </div>
      )}

      {wallets.filter(wallet => wallet.readyState === 'Installed').length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👛</div>
          <h3 className="text-lg font-bold text-white mb-2">No Wallets Found</h3>
          <p className="text-gray-400 mb-4">
            Please install a Solana wallet to continue
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => window.open('https://phantom.app/', '_blank')}
            >
              Install Phantom
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://solflare.com/', '_blank')}
            >
              Install Solflare
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}