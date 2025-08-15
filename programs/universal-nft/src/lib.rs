use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions::get_instruction_relative;
use mpl_token_metadata::types::Creator;

declare_id!("GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s");

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

// ZetaChain Gateway Program ID (mainnet/testnet/devnet)
pub const ZETACHAIN_GATEWAY_ID: Pubkey = solana_program::pubkey!("ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis");

#[program]
pub mod universal_nft {
    use super::*;

    /// Initialize the Universal NFT program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("=== UNIVERSAL NFT PROGRAM INITIALIZE ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Authority: {}", ctx.accounts.authority.key());
        msg!("Gateway: {}", ctx.accounts.gateway.key());
        
        let result = instructions::initialize(ctx);
        
        match &result {
            Ok(_) => msg!("✅ Initialize completed successfully"),
            Err(e) => msg!("❌ Initialize failed: {:?}", e),
        }
        
        result
    }

    /// Mint a new NFT on Solana
    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: String,
        symbol: String,
        uri: String,
        creators: Option<Vec<Creator>>,
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT MINT ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Payer: {}", ctx.accounts.payer.key());
        msg!("Recipient: {}", ctx.accounts.recipient.key());
        msg!("Name: {}", name);
        msg!("Symbol: {}", symbol);
        msg!("URI: {}", uri);
        
        let result = instructions::mint_nft(ctx, name, symbol, uri, creators);
        
        match &result {
            Ok(_) => msg!("✅ Mint completed successfully"),
            Err(e) => msg!("❌ Mint failed: {:?}", e),
        }
        
        result
    }

    /// Mint a new NFT on Solana (simplified version for testing)
    pub fn mint_nft_simple(
        ctx: Context<MintNftSimple>,
        name: String,
        symbol: String,
        uri: String,
        creators: Option<Vec<Creator>>,
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT MINT SIMPLE ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Payer: {}", ctx.accounts.payer.key());
        msg!("Recipient: {}", ctx.accounts.recipient.key());
        msg!("Name: {}", name);
        msg!("Symbol: {}", symbol);
        msg!("URI: {}", uri);
        
        let result = instructions::mint_nft_simple(ctx, name, symbol, uri, creators);
        
        match &result {
            Ok(_) => msg!("✅ Mint simple completed successfully"),
            Err(e) => msg!("❌ Mint simple failed: {:?}", e),
        }
        
        result
    }

    /// Transfer NFT to another chain via ZetaChain
    pub fn transfer_cross_chain(
        ctx: Context<TransferCrossChain>,
        destination_chain_id: u64,
        recipient: [u8; 32],
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT CROSS-CHAIN TRANSFER ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Mint: {}", ctx.accounts.mint.key());
        msg!("Owner: {}", ctx.accounts.owner.key());
        msg!("Destination Chain ID: {}", destination_chain_id);
        msg!("Recipient: {:?}", recipient);
        
        let result = instructions::transfer_cross_chain(ctx, destination_chain_id, recipient);
        
        match &result {
            Ok(_) => msg!("✅ Cross-chain transfer completed successfully"),
            Err(e) => msg!("❌ Cross-chain transfer failed: {:?}", e),
        }
        
        result
    }

    /// Receive NFT from another chain via ZetaChain (called by gateway)
    pub fn receive_cross_chain(
        ctx: Context<ReceiveCrossChain>,
        token_id: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
        creators: Option<Vec<Creator>>,
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT CROSS-CHAIN RECEIVE ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Token ID: {:?}", token_id);
        msg!("Name: {}", name);
        msg!("Symbol: {}", symbol);
        msg!("URI: {}", uri);
        msg!("Gateway: {}", ctx.accounts.gateway.key());
        
        let result = instructions::receive_cross_chain(ctx, token_id, name, symbol, uri, creators);
        
        match &result {
            Ok(_) => msg!("✅ Cross-chain receive completed successfully"),
            Err(e) => msg!("❌ Cross-chain receive failed: {:?}", e),
        }
        
        result
    }

    /// Called by ZetaChain gateway when receiving cross-chain calls
    pub fn on_call(
        ctx: Context<OnCall>,
        amount: u64,
        sender: [u8; 20],
        data: Vec<u8>,
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT ON_CALL (ZetaChain Gateway) ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Amount: {}", amount);
        msg!("Sender: {:?}", sender);
        msg!("Data length: {}", data.len());
        
        // Verify caller is the ZetaChain gateway
        let current_ix = get_instruction_relative(0, &ctx.accounts.instruction_sysvar_account.to_account_info())?;
        msg!("Caller program: {}", current_ix.program_id);
        msg!("Expected gateway: {}", ZETACHAIN_GATEWAY_ID);
        
        require!(
            current_ix.program_id == ZETACHAIN_GATEWAY_ID,
            crate::errors::UniversalNftError::InvalidGatewayCaller
        );
        
        let result = instructions::on_call(ctx, amount, sender, data);
        
        match &result {
            Ok(_) => msg!("✅ on_call completed successfully"),
            Err(e) => msg!("❌ on_call failed: {:?}", e),
        }
        
        result
    }

    /// Called by ZetaChain gateway when a cross-chain call reverts
    pub fn on_revert(
        ctx: Context<OnRevert>,
        amount: u64,
        sender: Pubkey,
        data: Vec<u8>,
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT ON_REVERT (ZetaChain Gateway) ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Amount: {}", amount);
        msg!("Sender: {}", sender);
        msg!("Data length: {}", data.len());
        
        let result = instructions::on_revert(ctx, amount, sender, data);
        
        match &result {
            Ok(_) => msg!("✅ on_revert completed successfully"),
            Err(e) => msg!("❌ on_revert failed: {:?}", e),
        }
        
        result
    }

    /// Update gateway address (admin only)
    pub fn update_gateway(
        ctx: Context<UpdateGateway>,
        new_gateway: Pubkey,
    ) -> Result<()> {
        msg!("=== UNIVERSAL NFT UPDATE GATEWAY ===");
        msg!("Program ID: {}", ctx.program_id);
        msg!("Authority: {}", ctx.accounts.authority.key());
        msg!("Old Gateway: {}", ctx.accounts.program_state.gateway);
        msg!("New Gateway: {}", new_gateway);
        
        let result = instructions::update_gateway(ctx, new_gateway);
        
        match &result {
            Ok(_) => msg!("✅ Gateway update completed successfully"),
            Err(e) => msg!("❌ Gateway update failed: {:?}", e),
        }
        
        result
    }

    // /// Trigger deposit to ZetaChain (for testing cross-chain functionality)
    // pub fn trigger_deposit(
    //     ctx: Context<TriggerDeposit>,
    //     amount: u64,
    //     receiver: [u8; 20],
    //     revert_options: Option<crate::state::RevertOptions>,
    // ) -> Result<()> {
    //     msg!("=== UNIVERSAL NFT TRIGGER DEPOSIT ===");
    //     msg!("Program ID: {}", ctx.program_id);
    //     msg!("Amount: {}", amount);
    //     msg!("Receiver: {:?}", receiver);
        
    //     let result = instructions::trigger_deposit(ctx, amount, receiver, revert_options);
        
    //     match &result {
    //         Ok(_) => msg!("✅ Trigger deposit completed successfully"),
    //         Err(e) => msg!("❌ Trigger deposit failed: {:?}", e),
    //     }
        
    //     result
    // }
}