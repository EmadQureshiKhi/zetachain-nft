import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolanaNFTService } from '@/lib/solana-nft-service';
import { useAppStore } from '@/store/useAppStore';

import toast from 'react-hot-toast';

export function useSolanaNFTs() {
  const { publicKey, connected } = useWallet();
  const { setNfts, setLoading, isTestnet } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  // Create new service when network changes
  const nftService = useMemo(() => {
    return new SolanaNFTService(isTestnet ? 'devnet' : 'mainnet');
  }, [isTestnet]);

  const fetchNFTs = async () => {
    if (!connected || !publicKey) {
      setNfts([]);
      return;
    }

    setLoading('nfts', true);
    setError(null);

    try {
      console.log('Fetching NFTs for wallet:', publicKey.toString());
      const nfts = await nftService.fetchNFTsByOwner(publicKey.toString());

      console.log(`Found ${nfts.length} NFTs`);
      setNfts(nfts);

      if (nfts.length === 0) {
        toast(`No NFTs found on ${isTestnet ? 'Devnet' : 'Mainnet'}`, {
          icon: '🔍',
          duration: 3000,
        });
      } else {
        toast.success(`Found ${nfts.length} NFT${nfts.length > 1 ? 's' : ''} on ${isTestnet ? 'Devnet' : 'Mainnet'}!`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFTs';
      setError(errorMessage);
      console.error('Error fetching NFTs:', err);

      // Show specific error message for rate limits
      if (errorMessage.includes('Rate limit') || errorMessage.includes('403') || errorMessage.includes('Access forbidden')) {
        toast.error(`Rate limit exceeded on ${isTestnet ? 'Devnet' : 'Mainnet'}. ${isTestnet ? 'Try again in a moment.' : 'Switch to Devnet for testing.'}`, {
          duration: 5000,
        });
      } else {
        toast.error('Failed to load NFTs. Please try again.');
      }

      // Fallback to empty array
      setNfts([]);
    } finally {
      setLoading('nfts', false);
    }
  };

  const refreshNFTs = () => {
    fetchNFTs();
  };

  // Fetch NFTs when wallet connects or network changes
  useEffect(() => {
    fetchNFTs();
  }, [connected, publicKey, isTestnet]);

  return {
    fetchNFTs,
    refreshNFTs,
    error,
  };
}