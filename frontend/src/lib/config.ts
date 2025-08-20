// Universal NFT Configuration - Production Ready
// Deployed Program: H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC

export const UNIVERSAL_NFT_PROGRAM_ID = '89BWBddtdbMriDFjotkPyzDvcehdJaZMvPYU1LifVjRc';
export const ZETACHAIN_GATEWAY_ID = 'ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis';
export const SOLANA_CLUSTER = 'devnet';

// Program State PDA (calculated from program_state seed)
export const PROGRAM_STATE_PDA = 'E46P1ev8UYUnkRFtngqwXQe61RBqFNVTp2cZnDRTDZTB';

// RPC Configuration
export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  localnet: 'http://127.0.0.1:8899',
};

export const CURRENT_RPC_URL = RPC_ENDPOINTS[SOLANA_CLUSTER as keyof typeof RPC_ENDPOINTS] || RPC_ENDPOINTS.devnet;

// Program Information
// Program Information
// Program Information
// Program Information
// Program Information
export const DEPLOYMENT_INFO = {
  programId: '89BWBddtdbMriDFjotkPyzDvcehdJaZMvPYU1LifVjRc',
  programStatePda: 'E46P1ev8UYUnkRFtngqwXQe61RBqFNVTp2cZnDRTDZTB',
  cluster: 'devnet',
  deployedAt: '2025-01-17T20:15:00Z',
  initialized: true,
  authority: 'GjyjvJLfrNxT5FdzruCiSRK1xDqmnJHYdAxiahbyxc29',
  gateway: 'ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis',
  version: '2.0.0',
  status: 'DEPLOYED',
  features: [
    'Cross-chain NFT transfers via ZetaChain',
    'Universal token ID system',
    'Origin tracking across chains',
    'Metaplex-compatible metadata',
    'Comprehensive error handling',
    'Real-time logging and monitoring'
  ]
};;;;;

// Chain IDs for cross-chain operations (ZetaChain compatible)
export const CHAIN_IDS = {
  SOLANA: 101,
  ETHEREUM: 1,
  BNB_CHAIN: 56,
  POLYGON: 137,
  AVALANCHE: 43114,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BITCOIN: 8332, // ZetaChain Bitcoin support
  // Testnet Chain IDs
  ETHEREUM_GOERLI: 5,
  ETHEREUM_SEPOLIA: 11155111,
  BNB_TESTNET: 97,
  POLYGON_MUMBAI: 80001,
};

// Supported destination chains for cross-chain transfers
export const SUPPORTED_CHAINS = [
  // Mainnet chains
  { id: CHAIN_IDS.ETHEREUM, name: 'Ethereum', symbol: 'ETH', icon: '🔷' },
  { id: CHAIN_IDS.BNB_CHAIN, name: 'BNB Chain', symbol: 'BNB', icon: '🟡' },
  { id: CHAIN_IDS.POLYGON, name: 'Polygon', symbol: 'MATIC', icon: '🟣' },
  { id: CHAIN_IDS.AVALANCHE, name: 'Avalanche', symbol: 'AVAX', icon: '🔺' },
  { id: CHAIN_IDS.ARBITRUM, name: 'Arbitrum', symbol: 'ETH', icon: '🔵' },
  { id: CHAIN_IDS.OPTIMISM, name: 'Optimism', symbol: 'ETH', icon: '🔴' },
  { id: CHAIN_IDS.BITCOIN, name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  // Testnet chains (for development and testing)
  { id: CHAIN_IDS.ETHEREUM_GOERLI, name: 'Ethereum Goerli', symbol: 'ETH', icon: '🔷', testnet: true },
  { id: CHAIN_IDS.ETHEREUM_SEPOLIA, name: 'Ethereum Sepolia', symbol: 'ETH', icon: '🔷', testnet: true },
  { id: CHAIN_IDS.BNB_TESTNET, name: 'BNB Testnet', symbol: 'BNB', icon: '🟡', testnet: true },
  { id: CHAIN_IDS.POLYGON_MUMBAI, name: 'Polygon Mumbai', symbol: 'MATIC', icon: '🟣', testnet: true },
];

// Chain configuration for UI components (compatible with existing components)
export const CHAIN_CONFIG = {
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    color: '#9945FF',
    id: CHAIN_IDS.SOLANA,
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '🔷',
    color: '#627EEA',
    id: CHAIN_IDS.ETHEREUM,
  },
  bnb: {
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: '🟡',
    color: '#F3BA2F',
    id: CHAIN_IDS.BNB_CHAIN,
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '🟣',
    color: '#8247E5',
    id: CHAIN_IDS.POLYGON,
  },
  avalanche: {
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: '🔺',
    color: '#E84142',
    id: CHAIN_IDS.AVALANCHE,
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ETH',
    icon: '🔵',
    color: '#28A0F0',
    id: CHAIN_IDS.ARBITRUM,
  },
  optimism: {
    name: 'Optimism',
    symbol: 'ETH',
    icon: '🔴',
    color: '#FF0420',
    id: CHAIN_IDS.OPTIMISM,
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#F7931A',
    id: CHAIN_IDS.BITCOIN,
  },
};

// Program Seeds (for PDA calculations)
export const PROGRAM_SEEDS = {
  PROGRAM_STATE: 'program_state',
  MINT_AUTHORITY: 'mint_authority',
  NFT_ORIGIN: 'nft_origin',
  TRANSFER: 'transfer',
};

// Transaction fees and limits
export const TRANSACTION_CONFIG = {
  MINT_FEE_LAMPORTS: 5000, // 0.000005 SOL
  TRANSFER_FEE_LAMPORTS: 10000, // 0.00001 SOL
  MAX_NAME_LENGTH: 32,
  MAX_SYMBOL_LENGTH: 10,
  MAX_URI_LENGTH: 200,
  MAX_ATTRIBUTES: 10,
};

console.log('🚀 Universal NFT Config Loaded:', DEPLOYMENT_INFO);