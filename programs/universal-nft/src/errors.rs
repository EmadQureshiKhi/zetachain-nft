use anchor_lang::prelude::*;

#[error_code]
pub enum UniversalNftError {
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Invalid gateway address")]
    InvalidGateway,
    
    #[msg("NFT not found")]
    NftNotFound,
    
    #[msg("Invalid token ID")]
    InvalidTokenId,
    
    #[msg("Invalid chain ID")]
    InvalidChainId,
    
    #[msg("Metadata creation failed")]
    MetadataCreationFailed,
    
    #[msg("Master edition creation failed")]
    MasterEditionCreationFailed,
    
    #[msg("Token mint failed")]
    TokenMintFailed,
    
    #[msg("Token burn failed")]
    TokenBurnFailed,
    
    #[msg("Cross-chain transfer failed")]
    CrossChainTransferFailed,
    
    #[msg("Invalid recipient address")]
    InvalidRecipient,
    
    #[msg("Insufficient compute budget")]
    InsufficientComputeBudget,
    
    #[msg("Rent exemption not met")]
    RentExemptionNotMet,
}