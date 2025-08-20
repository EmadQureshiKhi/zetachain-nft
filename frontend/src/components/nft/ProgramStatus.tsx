'use client';

import React, { useState, useEffect } from 'react';
import { useUniversalNFT } from '@/hooks/useUniversalNFT';
import { DEPLOYMENT_INFO, SUPPORTED_CHAINS } from '@/lib/config';

export function ProgramStatus() {
  const { getProgramState, service } = useUniversalNFT();
  const [programState, setProgramState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgramState();
  }, []);

  const loadProgramState = async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await getProgramState();
      setProgramState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load program state');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300">Loading program status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-xl">❌</div>
          <div>
            <h3 className="text-red-300 font-medium mb-1">Program Status Error</h3>
            <p className="text-red-200/80 text-sm">{error}</p>
            <button
              onClick={loadProgramState}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInitialized = programState?.initialized;
  const statusIcon = isInitialized ? '✅' : '⚠️';
  const statusText = isInitialized ? 'Operational' : 'Not Initialized';

  const containerClasses = isInitialized 
    ? 'bg-green-900/20 border border-green-500/30 rounded-xl p-6'
    : 'bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6';

  const iconClasses = isInitialized 
    ? 'text-green-400 text-xl'
    : 'text-yellow-400 text-xl';

  const titleClasses = isInitialized 
    ? 'text-green-300 font-medium'
    : 'text-yellow-300 font-medium';

  const statusClasses = isInitialized 
    ? 'text-green-200/80 text-sm'
    : 'text-yellow-200/80 text-sm';

  return (
    <div className={containerClasses}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={iconClasses}>{statusIcon}</div>
          <div>
            <h3 className={titleClasses}>Universal NFT Program</h3>
            <p className={statusClasses}>Status: {statusText}</p>
          </div>
        </div>
        <button
          onClick={loadProgramState}
          className="text-gray-400 hover:text-gray-300 transition-colors"
          title="Refresh status"
        >
          🔄
        </button>
      </div>

      {isInitialized && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Total Minted</div>
            <div className="text-white text-lg font-semibold">
              {programState.totalMinted?.toString() || '0'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Transfers</div>
            <div className="text-white text-lg font-semibold">
              {programState.totalTransfers?.toString() || '0'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Receives</div>
            <div className="text-white text-lg font-semibold">
              {programState.totalReceives?.toString() || '0'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Version</div>
            <div className="text-white text-lg font-semibold">
              v{programState.version || '1'}.0
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Program ID:</span>
          <span className="text-gray-300 font-mono text-xs">
            {DEPLOYMENT_INFO.programId}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Network:</span>
          <span className="text-gray-300 capitalize">{DEPLOYMENT_INFO.cluster}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Supported Chains:</span>
          <div className="flex gap-1">
            {SUPPORTED_CHAINS.slice(0, 4).map((chain) => (
              <span key={chain.id} title={chain.name} className="text-lg">
                {chain.icon}
              </span>
            ))}
            {SUPPORTED_CHAINS.length > 4 && (
              <span className="text-gray-400 text-xs">+{SUPPORTED_CHAINS.length - 4}</span>
            )}
          </div>
        </div>
      </div>

      {isInitialized && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Ready for cross-chain NFT operations
          </div>
        </div>
      )}
    </div>
  );
}