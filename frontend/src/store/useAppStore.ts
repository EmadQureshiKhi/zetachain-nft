import { create } from 'zustand';
import { NFT, TransferRecord, WalletState, ChainId } from '@/lib/types';

interface AppState {
  // Wallet state
  wallets: WalletState;
  setWalletState: (chain: keyof WalletState, state: Partial<WalletState[keyof WalletState]>) => void;
  
  // NFT state
  nfts: NFT[];
  setNfts: (nfts: NFT[]) => void;
  addNft: (nft: NFT) => void;
  addNFTs: (nfts: NFT[]) => void;
  updateNft: (id: string, updates: Partial<NFT>) => void;
  
  // Transfer state
  transfers: TransferRecord[];
  addTransfer: (transfer: TransferRecord) => void;
  updateTransfer: (id: string, updates: Partial<TransferRecord>) => void;
  
  // UI state
  isTestnet: boolean;
  setIsTestnet: (isTestnet: boolean) => void;
  selectedChain: ChainId;
  setSelectedChain: (chain: ChainId) => void;
  
  // Loading states
  loading: {
    nfts: boolean;
    minting: boolean;
    transferring: boolean;
  };
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial wallet state
  wallets: {
    solana: { connected: false, address: null, balance: 0 },
    ethereum: { connected: false, address: null, balance: 0 },
    bnb: { connected: false, address: null, balance: 0 },
  },
  
  setWalletState: (chain, state) =>
    set((prev) => ({
      wallets: {
        ...prev.wallets,
        [chain]: { ...prev.wallets[chain], ...state },
      },
    })),
  
  // NFT state
  nfts: [],
  setNfts: (nfts) => set({ nfts }),
  addNft: (nft) => set((state) => ({ nfts: [...state.nfts, nft] })),
  addNFTs: (nfts) => set((state) => ({ nfts: [...state.nfts, ...nfts] })),
  updateNft: (id, updates) =>
    set((state) => ({
      nfts: state.nfts.map((nft) => (nft.id === id ? { ...nft, ...updates } : nft)),
    })),
  
  // Transfer state
  transfers: [],
  addTransfer: (transfer) => set((state) => ({ transfers: [...state.transfers, transfer] })),
  updateTransfer: (id, updates) =>
    set((state) => ({
      transfers: state.transfers.map((transfer) =>
        transfer.id === id ? { ...transfer, ...updates } : transfer
      ),
    })),
  
  // UI state
  isTestnet: true,
  setIsTestnet: (isTestnet) => set({ isTestnet }),
  selectedChain: 'solana',
  setSelectedChain: (selectedChain) => set({ selectedChain }),
  
  // Loading states
  loading: {
    nfts: false,
    minting: false,
    transferring: false,
  },
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),
}));