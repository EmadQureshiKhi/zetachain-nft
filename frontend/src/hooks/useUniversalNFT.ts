import { useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { UniversalNFTService, MintNFTParams } from '@/lib/universal-nft-service';
import { useAppStore } from '@/store/useAppStore';
import { NFT } from '@/lib/types';
import toast from 'react-hot-toast';

export function useUniversalNFT() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { addNft } = useAppStore();
  const [loading, setLoading] = useState(false);

  const service = useMemo(() => {
    return new UniversalNFTService(connection);
  }, [connection]);

  const mintNFT = async (params: MintNFTParams) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      console.log('🎨 Minting Universal NFT:', params.metadata.name);

      // Check program state first
      const programState = await service.getProgramState();
      if (!programState?.initialized) {
        throw new Error('Universal NFT program is not initialized. Please contact support.');
      }

      console.log('📊 Program ready - Total minted:', programState.totalMinted?.toString() || '0');

      const { transaction, mint, tokenAccount, metadataAccount, masterEditionAccount } =
        await service.mintNFT(publicKey, params);

      console.log('🔍 Simulating transaction...');
      const simResult = await connection.simulateTransaction(transaction);
      console.log('Simulation result:', simResult);
      
      // Always show logs first, even if there's an error
      if (simResult.value.logs) {
        console.log('📋 Program logs:');
        simResult.value.logs.forEach(log => console.log('  ', log));
      }
      
      if (simResult.value.err) {
        console.error('❌ Simulation failed:', simResult.value.err);
        console.log('🔍 Full simulation result:', JSON.stringify(simResult, null, 2));
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simResult.value.err)}`);
      }

      console.log('✅ Simulation successful, sending transaction...');
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('📝 Transaction sent:', signature);
      console.log('⏳ Waiting for confirmation...');

      await connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ Universal NFT minted successfully!');
      console.log('🔑 Mint:', mint.toString());
      console.log('🏦 Token Account:', tokenAccount.toString());
      console.log('📝 Metadata:', metadataAccount.toString());
      console.log('🏆 Master Edition:', masterEditionAccount.toString());

      // Create NFT object for local state
      const newNFT: NFT = {
        id: mint.toString(),
        name: params.metadata.name,
        description: params.metadata.description,
        image: params.metadata.image,
        chain: 'solana',
        tokenId: mint.toString(),
        owner: publicKey.toString(),
        metadata: {
          attributes: params.metadata.attributes || [],
          creator: publicKey.toString(),
          royalty: 0,
        },
        originChain: 'solana',
        transferHistory: [],
      };

      addNft(newNFT);

      toast.success(`🎉 Universal NFT "${params.metadata.name}" minted successfully!`, {
        duration: 5000,
      });

      return {
        signature,
        mint,
        tokenAccount,
        metadataAccount,
        masterEditionAccount,
      };
    } catch (error) {
      console.error('❌ Error minting Universal NFT:', error);

      let errorMessage = 'Failed to mint NFT';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Provide more specific error messages
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance for minting. Please add more SOL to your wallet.';
      } else if (errorMessage.includes('simulation failed')) {
        errorMessage = 'Transaction failed validation. Please check your inputs and try again.';
      } else if (errorMessage.includes('not initialized')) {
        errorMessage = 'Program not ready. Please contact support.';
      }

      toast.error(errorMessage, { duration: 6000 });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const transferCrossChain = async (
    mint: PublicKey,
    destinationChainId: number,
    recipient: string
  ) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      console.log('🌐 Transferring NFT cross-chain:', {
        mint: mint.toString(),
        destinationChainId,
        recipient,
      });

      const recipientBytes = new TextEncoder().encode(recipient);
      const recipientArray = new Uint8Array(32);
      recipientArray.set(recipientBytes.slice(0, 32));

      const transaction = await service.transferCrossChain(
        publicKey,
        mint,
        destinationChainId,
        recipientArray
      );

      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ Cross-chain transfer initiated!');
      console.log('Signature:', signature);

      toast.success('Cross-chain transfer initiated successfully!');

      return { signature };
    } catch (error) {
      console.error('❌ Error transferring NFT:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer NFT';
      toast.error(`Failed to transfer NFT: ${errorMessage}`);

      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProgramState = async () => {
    try {
      return await service.getProgramState();
    } catch (error) {
      console.error('Error fetching program state:', error);
      return null;
    }
  };

  const getNFTOrigin = async (mint: PublicKey) => {
    try {
      return await service.getNFTOrigin(mint);
    } catch (error) {
      console.error('Error fetching NFT origin:', error);
      return null;
    }
  };

  return {
    mintNFT,
    transferCrossChain,
    getProgramState,
    getNFTOrigin,
    loading,
    service,
  };
}