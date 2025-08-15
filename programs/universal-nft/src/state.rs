use anchor_lang::prelude::*;

/// Solana chain ID for cross-chain operations
pub const SOLANA_CHAIN_ID: u64 = 101; // Solana mainnet chain ID

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
    /// Total cross-chain transfers initiated
    pub total_transfers: u64,
    /// Total cross-chain receives processed
    pub total_receives: u64,
    /// Program version for upgrades
    pub version: u8,
    /// Bump seed for PDA
    pub bump: u8,
}

impl ProgramState {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1;
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
    /// Current chain ID (where NFT currently resides)
    pub current_chain_id: u64,
    /// Transfer count (how many times transferred)
    pub transfer_count: u64,
    /// Last transfer timestamp
    pub last_transfer_timestamp: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl NftOrigin {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

/// Cross-chain message data for ZetaChain integration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CrossChainMessage {
    /// Message type (mint, transfer, burn)
    pub message_type: CrossChainMessageType,
    /// Token ID
    pub token_id: [u8; 32],
    /// Source chain ID
    pub source_chain_id: u64,
    /// Destination chain ID
    pub destination_chain_id: u64,
    /// Sender address (20 bytes for EVM compatibility)
    pub sender: [u8; 20],
    /// Recipient address (32 bytes for Solana compatibility)
    pub recipient: [u8; 32],
    /// NFT metadata
    pub metadata: NftMetadata,
    /// Timestamp
    pub timestamp: i64,
}

/// Cross-chain message types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum CrossChainMessageType {
    /// Mint new NFT from cross-chain
    Mint,
    /// Transfer existing NFT cross-chain
    Transfer,
    /// Burn NFT for cross-chain transfer
    Burn,
    /// Revert failed cross-chain operation
    Revert,
}

/// NFT metadata structure compatible with Metaplex
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
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
    /// Collection information
    pub collection: Option<NftCollection>,
}

/// Creator information compatible with Metaplex
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct NftCreator {
    /// Creator address (32 bytes for Solana, can be converted from 20 bytes EVM)
    pub address: [u8; 32],
    /// Whether creator is verified
    pub verified: bool,
    /// Creator's share percentage (0-100)
    pub share: u8,
}

/// Collection information
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct NftCollection {
    /// Collection mint address
    pub address: Pubkey,
    /// Whether this NFT is verified as part of the collection
    pub verified: bool,
}

/// Cross-chain transfer state for tracking pending operations
#[account]
pub struct CrossChainTransfer {
    /// Token ID being transferred
    pub token_id: [u8; 32],
    /// Source chain ID
    pub source_chain_id: u64,
    /// Destination chain ID
    pub destination_chain_id: u64,
    /// Sender address
    pub sender: Pubkey,
    /// Recipient address
    pub recipient: [u8; 32],
    /// Transfer status
    pub status: TransferStatus,
    /// Timestamp when transfer was initiated
    pub initiated_at: i64,
    /// Timestamp when transfer was completed (if applicable)
    pub completed_at: Option<i64>,
    /// Error message (if failed)
    pub error_message: Option<String>,
    /// Bump seed for PDA
    pub bump: u8,
}

impl CrossChainTransfer {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 32 + 32 + 1 + 8 + 9 + 4 + 100 + 1; // Approximate size
}

/// Transfer status enumeration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum TransferStatus {
    /// Transfer initiated but not yet processed by gateway
    Pending,
    /// Transfer processed by gateway and sent to destination chain
    InProgress,
    /// Transfer completed successfully
    Completed,
    /// Transfer failed and reverted
    Failed,
    /// Transfer cancelled
    Cancelled,
}

/// Revert options for cross-chain operations (compatible with ZetaChain)
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RevertOptions {
    /// Solana address to receive tokens back if revert occurs
    pub revert_address: Pubkey,
    /// EVM-style address to receive tokens if abort occurs
    pub abort_address: [u8; 20],
    /// Whether to call on_revert function
    pub call_on_revert: bool,
    /// Message to pass to revert function
    pub revert_message: Vec<u8>,
    /// Gas limit for revert operation
    pub on_revert_gas_limit: u64,
}