'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '@/store/useAppStore';
import { ChainBadge } from '@/components/ui/ChainBadge';
import { Button } from '@/components/ui/Button';
import { SimpleWalletButton } from './SimpleWalletButton';
import { truncateAddress } from '@/lib/utils';
import { ClientOnly } from '@/components/ClientOnly';

export function WalletConnectionHub() {
  const { wallets } = useAppStore();
  const { publicKey, connected, disconnect } = useWallet();
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
        {connected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="text-red-400 hover:text-red-300"
          >
            Disconnect
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Solana Wallet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <ChainBadge chain="solana" size="sm" />
            <div>
              <p className="text-white font-medium">Solana Wallet</p>
              {connected && publicKey && (
                <p className="text-gray-400 text-sm">
                  {truncateAddress(publicKey.toString())}
                </p>
              )}
            </div>
          </div>
          <div className="solana-wallet-button">
            <ClientOnly fallback={
              <div className="wallet-adapter-button wallet-adapter-button-trigger">
                Loading...
              </div>
            }>
              <SimpleWalletButton />
            </ClientOnly>
          </div>
        </motion.div>
        
        {/* EVM Wallets - Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 opacity-60"
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <ChainBadge chain="ethereum" size="sm" showName={false} />
              <ChainBadge chain="bnb" size="sm" showName={false} />
            </div>
            <div>
              <p className="text-white font-medium">EVM Wallets</p>
              <p className="text-gray-400 text-sm">Coming Soon</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled>
            Connect
          </Button>
        </motion.div>
        
        {/* Connection Status */}
        {connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-green-400 text-sm font-medium">
                Solana wallet connected
              </p>
            </div>
            <div className="mt-2">
              <ChainBadge chain="solana" size="sm" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}