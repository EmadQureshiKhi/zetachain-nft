use anchor_lang::prelude::*;

/// Program state account
#[account]
pub struct ProgramState {
    /// Authority that can update the program
    pub authority: Pubkey,
    /// ZetaChain gateway address
    pub gateway: Pubkey,
    /// Next token ID counter
    pub next_token_id: u64,
    /// Total NFTs minted
    pub total_minted: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl ProgramState {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

/// NFT origin information for cross-chain tracking
#[account]
pub struct NftOrigin {
    /// Original mint key (for NFTs first minted on Solana)
    pub original_mint: Pubkey,
    /// Token ID used across chains
    pub token_id: [u8; 32],
    /// Chain ID where NFT was originally minted
    pub origin_chain_id: u64,
    /// Block number when minted
    pub block_number: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl NftOrigin {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

/// Cross-chain message data
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CrossChainMessage {
    /// Token ID
    pub token_id: [u8; 32],
    /// Destination chain ID
    pub destination_chain_id: u64,
    /// Recipient address
    pub recipient: [u8; 32],
    /// NFT metadata
    pub metadata: NftMetadata,
}

/// NFT metadata structure
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct NftMetadata {
    /// NFT name
    pub name: String,
    /// NFT symbol
    pub symbol: String,
    /// Metadata URI
    pub uri: String,
    /// Seller fee basis points
    pub seller_fee_basis_points: u16,
    /// Creators
    pub creators: Option<Vec<NftCreator>>,
}

/// Creator information
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct NftCreator {
    /// Creator address
    pub address: Pubkey,
    /// Whether creator is verified
    pub verified: bool,
    /// Creator's share percentage
    pub share: u8,
}