'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function WalletDebug() {
  const { wallets, connected, connecting, publicKey } = useWallet();

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-800 rounded-xl p-4 max-w-sm text-xs">
      <h3 className="text-white font-semibold mb-2">Wallet Debug</h3>
      
      <div className="space-y-2">
        <div className="text-gray-400">
          Connected: <span className={connected ? 'text-green-400' : 'text-red-400'}>
            {connected ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="text-gray-400">
          Connecting: <span className={connecting ? 'text-yellow-400' : 'text-gray-400'}>
            {connecting ? 'Yes' : 'No'}
          </span>
        </div>
        
        {publicKey && (
          <div className="text-gray-400">
            PublicKey: <span className="text-green-400 font-mono">
              {publicKey.toString().slice(0, 8)}...
            </span>
          </div>
        )}
        
        <div className="text-gray-400">
          Available Wallets: {wallets.length}
        </div>
        
        <div className="space-y-1">
          {wallets.map((wallet, index) => (
            <div key={`${wallet.adapter.name}-${index}`} className="text-xs">
              <span className="text-white">{wallet.adapter.name}</span>
              <span className={`ml-2 ${
                wallet.readyState === 'Installed' ? 'text-green-400' : 
                wallet.readyState === 'Loadable' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {wallet.readyState}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}