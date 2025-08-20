import { NFT } from './types';

export const SAMPLE_UNIVERSAL_NFTS: NFT[] = [
  {
    id: 'universal-1',
    name: 'Cosmic Voyager #001',
    description: 'A Universal NFT that has traveled across multiple blockchains, carrying the essence of cosmic exploration.',
    image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=400&fit=crop',
    chain: 'solana',
    tokenId: 'BtLDSZV972yDM3rPttojPTioCY9fndP4wtuAFLHrzBWu',
    owner: 'EtwqtKTxp5g829oUYk2npAR7b6S2mXgTmw6Rmc1kEo5V',
    metadata: {
      attributes: [
        { trait_type: 'Origin Chain', value: 'Solana' },
        { trait_type: 'Cross-Chain Transfers', value: '3' },
        { trait_type: 'Universal Token ID', value: 'UNFT-001' },
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Power Level', value: '9000' },
        { trait_type: 'Element', value: 'Cosmic' },
      ],
      creator: 'UniversalNFTCreator',
      royalty: 5,
    },
    originChain: 'solana',
    transferHistory: [
      {
        from: 'solana',
        to: 'ethereum',
        timestamp: Date.now() - 86400000 * 7, // 7 days ago
        txHash: '0x123...abc',
      },
      {
        from: 'ethereum',
        to: 'bnb',
        timestamp: Date.now() - 86400000 * 3, // 3 days ago
        txHash: '0x456...def',
      },
      {
        from: 'bnb',
        to: 'solana',
        timestamp: Date.now() - 86400000, // 1 day ago
        txHash: '5KJh...xyz',
      },
    ],
  },
  {
    id: 'universal-2',
    name: 'Quantum Bridge #042',
    description: 'A Universal NFT representing the quantum entanglement between different blockchain networks.',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
    chain: 'solana',
    tokenId: 'QuantumBridge042UniversalTokenID123456789',
    owner: 'EtwqtKTxp5g829oUYk2npAR7b6S2mXgTmw6Rmc1kEo5V',
    metadata: {
      attributes: [
        { trait_type: 'Origin Chain', value: 'Ethereum' },
        { trait_type: 'Cross-Chain Transfers', value: '1' },
        { trait_type: 'Universal Token ID', value: 'UNFT-042' },
        { trait_type: 'Rarity', value: 'Epic' },
        { trait_type: 'Quantum State', value: 'Entangled' },
        { trait_type: 'Bridge Protocol', value: 'ZetaChain' },
      ],
      creator: 'QuantumArtist',
      royalty: 2.5,
    },
    originChain: 'ethereum',
    transferHistory: [
      {
        from: 'ethereum',
        to: 'solana',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        txHash: '0x789...ghi',
      },
    ],
  },
  {
    id: 'universal-3',
    name: 'Interchain Phoenix #777',
    description: 'A mythical Universal NFT that rises from the ashes of traditional single-chain limitations.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    chain: 'solana',
    tokenId: 'InterchainPhoenix777UniversalNFTToken',
    owner: 'EtwqtKTxp5g829oUYk2npAR7b6S2mXgTmw6Rmc1kEo5V',
    metadata: {
      attributes: [
        { trait_type: 'Origin Chain', value: 'BNB Chain' },
        { trait_type: 'Cross-Chain Transfers', value: '5' },
        { trait_type: 'Universal Token ID', value: 'UNFT-777' },
        { trait_type: 'Rarity', value: 'Mythical' },
        { trait_type: 'Phoenix Level', value: 'Ascended' },
        { trait_type: 'Fire Power', value: 'Infinite' },
      ],
      creator: 'PhoenixMaster',
      royalty: 7.5,
    },
    originChain: 'bnb',
    transferHistory: [
      {
        from: 'bnb',
        to: 'ethereum',
        timestamp: Date.now() - 86400000 * 10, // 10 days ago
        txHash: '0xabc...123',
      },
      {
        from: 'ethereum',
        to: 'polygon',
        timestamp: Date.now() - 86400000 * 8, // 8 days ago
        txHash: '0xdef...456',
      },
      {
        from: 'polygon',
        to: 'ethereum',
        timestamp: Date.now() - 86400000 * 6, // 6 days ago
        txHash: '0xghi...789',
      },
      {
        from: 'ethereum',
        to: 'bnb',
        timestamp: Date.now() - 86400000 * 4, // 4 days ago
        txHash: '0xjkl...012',
      },
      {
        from: 'bnb',
        to: 'solana',
        timestamp: Date.now() - 86400000 * 1, // 1 day ago
        txHash: '7Mno...345',
      },
    ],
  },
];

/**
 * Add sample Universal NFTs to the store for demo purposes
 */
export function addSampleUniversalNFTs(addNFTs: (nfts: NFT[]) => void) {
  console.log('🎨 Adding sample Universal NFTs for demo...');
  addNFTs(SAMPLE_UNIVERSAL_NFTS);
  console.log(`✅ Added ${SAMPLE_UNIVERSAL_NFTS.length} sample Universal NFTs`);
}