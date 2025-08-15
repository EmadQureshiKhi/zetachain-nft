use anchor_lang::prelude::*;

#[error_code]
pub enum UniversalNftError {
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Invalid gateway address")]
    InvalidGateway,
    
    #[msg("Invalid gateway caller - only ZetaChain gateway can call this function")]
    InvalidGatewayCaller,
    
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
    
    #[msg("Invalid cross-chain message format")]
    InvalidCrossChainMessage,
    
    #[msg("Cross-chain operation not supported")]
    CrossChainNotSupported,
    
    #[msg("Invalid data format - could not parse UTF-8")]
    InvalidDataFormat,
    
    #[msg("Revert message detected - transaction execution halted")]
    RevertMessage,
    
    #[msg("Gateway deposit failed")]
    GatewayDepositFailed,
    
    #[msg("Invalid instruction data")]
    InvalidInstructionData,
    
    #[msg("Account validation failed")]
    AccountValidationFailed,
    
    #[msg("Program state not initialized")]
    ProgramNotInitialized,
}