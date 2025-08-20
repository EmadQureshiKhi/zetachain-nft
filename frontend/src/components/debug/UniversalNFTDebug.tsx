'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUniversalNFT } from '@/hooks/useUniversalNFT';
import { Button } from '@/components/ui/Button';

export function UniversalNFTDebug() {
  const { connected } = useWallet();
  const { getProgramState, loading } = useUniversalNFT();
  const [programState, setProgramState] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(true);

  const testProgramState = async () => {
    console.log('🔍 Testing Universal NFT program state...');
    const state = await getProgramState();
    setProgramState(state);
    console.log('Program State:', state);
  };

  if (!connected) return null;

  return (
    <div className="fixed bottom-20 right-4 bg-gray-900 border border-gray-800 rounded-xl max-w-sm transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-white font-semibold">Universal NFT Debug</h3>
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
      
      {/* Content */}
      {!isMinimized && (
        <div className="px-4 pb-4 space-y-3 text-sm">
          <div className="text-gray-400">
            Program ID: <span className="text-purple-400 font-mono text-xs">GQ8Q...vD4s</span>
          </div>
          <div className="text-gray-400">
            Network: <span className="text-green-400">Devnet</span> • Status: <span className="text-green-400">✅ Deployed</span>
          </div>
          
          {programState && (
            <div className="bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="text-gray-300 font-medium">Program State:</div>
              <div className="text-xs space-y-1">
                {programState.initialized ? (
                  <>
                    <div className="text-gray-400">
                      Authority: <span className="text-green-400 font-mono">{programState.authority?.toString().slice(0, 8)}...</span>
                    </div>
                    <div className="text-gray-400">
                      Gateway: <span className="text-blue-400 font-mono">{programState.gateway?.toString().slice(0, 8)}...</span>
                    </div>
                    <div className="text-gray-400">
                      Next Token ID: <span className="text-yellow-400">{programState.nextTokenId?.toString()}</span>
                    </div>
                    <div className="text-gray-400">
                      Total Minted: <span className="text-purple-400">{programState.totalMinted?.toString()}</span>
                    </div>
                    <div className="text-gray-400">
                      Version: <span className="text-blue-400">{programState.version}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-red-400">
                    ❌ Program not initialized or connection failed
                    <div className="text-xs text-gray-500 mt-1">
                      Error: {programState.error || 'Unknown error'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testProgramState}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Check Program State'}
            </Button>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-2">
            <div className="text-xs text-green-300">
              🎉 Program deployed & working on devnet!
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Test NFT: EG9T...hjq • TX: FXSM...cot
            </div>
          </div>
        </div>
      )}
      
      {/* Minimized state */}
      {isMinimized && (
        <div className="px-4 pb-4 text-xs text-gray-500">
          Universal NFT • {programState ? 'Connected' : 'Not Connected'}
        </div>
      )}
    </div>
  );
}