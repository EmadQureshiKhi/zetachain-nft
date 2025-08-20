import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { NFT } from '@/lib/types';

// Solana RPC endpoints with fallbacks
const SOLANA_RPC_ENDPOINTS = {
    devnet: [
        'https://api.devnet.solana.com',
        'https://devnet.helius-rpc.com/?api-key=demo',
        'https://solana-devnet.g.alchemy.com/v2/demo',
    ],
    mainnet: [
        'https://api.mainnet-beta.solana.com',
        'https://mainnet.helius-rpc.com/?api-key=demo',
        'https://solana-mainnet.g.alchemy.com/v2/demo',
    ],
};

export class SolanaNFTService {
    private connection: Connection;
    private metaplex: Metaplex;

    constructor(network: 'devnet' | 'mainnet' = 'devnet') {
        // Use the first RPC endpoint for the network
        const rpcUrl = SOLANA_RPC_ENDPOINTS[network][0];
        this.connection = new Connection(rpcUrl, 'confirmed');
        this.metaplex = Metaplex.make(this.connection);
    }

    /**
     * Fetch all NFTs owned by a wallet address
     */
    async fetchNFTsByOwner(ownerAddress: string): Promise<NFT[]> {
        try {
            const owner = new PublicKey(ownerAddress);

            // Get all NFTs owned by the address
            const nfts = await this.metaplex.nfts().findAllByOwner({ owner });

            // Convert to our NFT format
            const formattedNFTs: NFT[] = [];

            for (const nft of nfts) {
                // Accept both 'nft' and 'metadata' models
                if (nft.model === 'nft' || nft.model === 'metadata') {
                    try {
                        console.log(`Processing NFT: ${nft.name} (${nft.address.toString()})`);

                        // Try to load full metadata if it's a metadata model
                        let fullNft = nft;
                        try {
                            if (nft.model === 'metadata') {
                                fullNft = await this.metaplex.nfts().load({ metadata: nft });
                            }
                        } catch (loadError) {
                            console.warn(`Could not load full metadata for ${nft.address.toString()}, using basic info`);
                        }

                        const formattedNFT: NFT = {
                            id: nft.address.toString(),
                            name: nft.name || 'Unnamed NFT',
                            description: fullNft.json?.description || nft.json?.description || 'No description available',
                            image: fullNft.json?.image || nft.json?.image || '/placeholder-nft.png',
                            chain: 'solana',
                            tokenId: nft.address.toString(),
                            owner: ownerAddress,
                            metadata: {
                                attributes: (fullNft.json?.attributes || nft.json?.attributes || []).map((attr: any) => ({
                                    trait_type: attr.trait_type || 'Property',
                                    value: attr.value?.toString() || 'Unknown',
                                })),
                                creator: nft.creators?.[0]?.address.toString(),
                                royalty: nft.sellerFeeBasisPoints ? nft.sellerFeeBasisPoints / 100 : 0,
                            },
                            originChain: 'solana',
                            transferHistory: [], // TODO: Implement transfer history tracking
                        };

                        formattedNFTs.push(formattedNFT);
                        console.log(`✅ Successfully processed: ${formattedNFT.name}`);
                    } catch (error) {
                        console.warn(`Failed to load NFT ${nft.address.toString()}:`, error);
                        // Add basic NFT info even if metadata loading fails
                        formattedNFTs.push({
                            id: nft.address.toString(),
                            name: nft.name || 'Unknown NFT',
                            description: 'Metadata unavailable',
                            image: '/placeholder-nft.png',
                            chain: 'solana',
                            tokenId: nft.address.toString(),
                            owner: ownerAddress,
                            metadata: {
                                attributes: [],
                                creator: nft.creators?.[0]?.address.toString(),
                                royalty: 0,
                            },
                            originChain: 'solana',
                        });
                    }
                } else {
                    console.log(`Skipping non-NFT item: ${nft.model} - ${nft.address.toString()}`);
                }
            }

            return formattedNFTs;
        } catch (error) {
            console.error('Error fetching NFTs:', error);
            
            // Convert error to string for checking
            const errorString = error instanceof Error ? error.message : String(error);
            
            // Check if it's a rate limit error
            if (errorString.includes('403') || errorString.includes('Access forbidden') || errorString.includes('Forbidden')) {
                throw new Error('Rate limit exceeded. Please try again in a moment or switch to Devnet for testing.');
            }
            
            throw new Error('Failed to fetch NFTs from Solana');
        }
    }

    /**
     * Fetch a specific NFT by mint address
     */
    async fetchNFTByMint(mintAddress: string): Promise<NFT | null> {
        try {
            const mint = new PublicKey(mintAddress);
            const nft = await this.metaplex.nfts().findByMint({ mintAddress: mint });

            if (nft.model !== 'nft' && nft.model !== 'metadata') return null;

            const fullNft = await this.metaplex.nfts().load({ metadata: nft });

            return {
                id: nft.address.toString(),
                name: nft.name || 'Unnamed NFT',
                description: nft.json?.description || 'No description available',
                image: nft.json?.image || '/placeholder-nft.png',
                chain: 'solana',
                tokenId: nft.address.toString(),
                owner: nft.updateAuthorityAddress.toString(),
                metadata: {
                    attributes: nft.json?.attributes?.map((attr: any) => ({
                        trait_type: attr.trait_type || 'Property',
                        value: attr.value?.toString() || 'Unknown',
                    })) || [],
                    creator: nft.creators?.[0]?.address.toString(),
                    royalty: nft.sellerFeeBasisPoints ? nft.sellerFeeBasisPoints / 100 : 0,
                },
                originChain: 'solana',
            };
        } catch (error) {
            console.error('Error fetching NFT by mint:', error);
            return null;
        }
    }

    /**
     * Get wallet's SOL balance
     */
    async getWalletBalance(walletAddress: string): Promise<number> {
        try {
            const publicKey = new PublicKey(walletAddress);
            const balance = await this.connection.getBalance(publicKey);
            return balance / 1e9; // Convert lamports to SOL
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            return 0;
        }
    }
}