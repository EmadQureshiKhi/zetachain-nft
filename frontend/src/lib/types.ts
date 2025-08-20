export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  chain: ChainId;
  tokenId: string;
  owner: string;
  metadata: {
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
    creator?: string;
    royalty?: number;
  };
  originChain?: string;
  transferHistory?: TransferRecord[];
}

export interface TransferRecord {
  id: string;
  fromChain: string;
  toChain: string;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface WalletState {
  solana: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  ethereum: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  bnb: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  polygon: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  avalanche: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  arbitrum: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  optimism: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
  bitcoin: {
    connected: boolean;
    address: string | null;
    balance: number;
  };
}

export interface TransferRequest {
  nftId: string;
  fromChain: string;
  toChain: string;
  recipientAddress: string;
}

export type ChainId = 'solana' | 'ethereum' | 'bnb' | 'polygon' | 'avalanche' | 'arbitrum' | 'optimism' | 'bitcoin';