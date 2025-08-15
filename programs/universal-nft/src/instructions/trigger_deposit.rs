use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

/// Trigger deposit to ZetaChain (for testing cross-chain functionality)
#[derive(Accounts)]
pub struct TriggerDeposit<'info> {
    #[account(
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    /// CHECK: Gateway PDA - validated by the gateway program via seeds
    #[account(mut)]
    pub gateway_pda: UncheckedAccount<'info>,
    
    /// CHECK: Gateway program - only used for CPI
    #[account(address = crate::ZETACHAIN_GATEWAY_ID)]
    pub gateway_program: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn trigger_deposit(
    ctx: Context<TriggerDeposit>,
    amount: u64,
    receiver: [u8; 20],
    revert_options: Option<RevertOptions>,
) -> Result<()> {
    msg!("=== TRIGGER DEPOSIT START ===");
    msg!("Amount: {} lamports", amount);
    msg!("Receiver (EVM address): {:?}", receiver);
    msg!("Signer: {}", ctx.accounts.signer.key());
    msg!("Gateway PDA: {}", ctx.accounts.gateway_pda.key());
    
    let program_state = &ctx.accounts.program_state;
    
    // Validate amount
    require!(amount > 0, UniversalNftError::InvalidInstructionData);
    
    // Validate receiver address (not all zeros)
    require!(
        receiver != [0u8; 20],
        UniversalNftError::InvalidRecipient
    );
    
    // Log revert options if provided
    if let Some(ref options) = revert_options {
        msg!("Revert options provided:");
        msg!("  Revert address: {}", options.revert_address);
        msg!("  Abort address: {:?}", options.abort_address);
        msg!("  Call on revert: {}", options.call_on_revert);
        msg!("  Revert message length: {}", options.revert_message.len());
        msg!("  Gas limit: {}", options.on_revert_gas_limit);
    }
    
    // For now, simulate the deposit operation
    msg!("Simulating ZetaChain gateway deposit...");
    
    // Create a cross-chain message for this deposit
    let cross_chain_message = CrossChainMessage {
        message_type: CrossChainMessageType::Transfer,
        token_id: generate_deposit_token_id(&ctx.accounts.signer.key(), amount),
        source_chain_id: SOLANA_CHAIN_ID,
        destination_chain_id: 1, // Ethereum (example)
        sender: solana_to_evm_address(&ctx.accounts.signer.key()),
        recipient: pad_evm_to_solana_address(&receiver),
        metadata: create_deposit_metadata(amount),
        timestamp: Clock::get()?.unix_timestamp,
    };
    
    msg!("Created cross-chain message:");
    msg!("  Token ID: {:?}", cross_chain_message.token_id);
    msg!("  Source chain: {}", cross_chain_message.source_chain_id);
    msg!("  Destination chain: {}", cross_chain_message.destination_chain_id);
    msg!("  Metadata name: {}", cross_chain_message.metadata.name);
    
    // Emit deposit event for off-chain tracking
    emit!(DepositTriggeredEvent {
        signer: ctx.accounts.signer.key(),
        amount,
        receiver,
        token_id: cross_chain_message.token_id,
        destination_chain_id: cross_chain_message.destination_chain_id,
        timestamp: cross_chain_message.timestamp,
        has_revert_options: revert_options.is_some(),
    });
    
    msg!("✅ Deposit trigger completed successfully");
    msg!("=== TRIGGER DEPOSIT END ===");
    
    Ok(())
}

fn generate_deposit_token_id(signer: &Pubkey, amount: u64) -> [u8; 32] {
    let mut token_id = [0u8; 32];
    let clock = Clock::get().unwrap();
    
    // Combine signer + amount + timestamp + slot for uniqueness
    let signer_bytes = signer.to_bytes();
    token_id[0..16].copy_from_slice(&signer_bytes[0..16]);
    
    let amount_bytes = amount.to_le_bytes();
    token_id[16..24].copy_from_slice(&amount_bytes);
    
    let slot_bytes = clock.slot.to_le_bytes();
    token_id[24..32].copy_from_slice(&slot_bytes);
    
    token_id
}

fn solana_to_evm_address(pubkey: &Pubkey) -> [u8; 20] {
    let mut evm_address = [0u8; 20];
    let pubkey_bytes = pubkey.to_bytes();
    // Take the last 20 bytes of the Solana pubkey to create an EVM-style address
    evm_address.copy_from_slice(&pubkey_bytes[12..32]);
    evm_address
}

fn pad_evm_to_solana_address(evm_address: &[u8; 20]) -> [u8; 32] {
    let mut solana_address = [0u8; 32];
    // Pad the 20-byte EVM address to 32 bytes for Solana compatibility
    solana_address[12..32].copy_from_slice(evm_address);
    solana_address
}

fn create_deposit_metadata(amount: u64) -> NftMetadata {
    NftMetadata {
        name: format!("Deposit Receipt #{}", amount),
        symbol: "DEPOSIT".to_string(),
        uri: "https://universal-nft.example.com/deposit-metadata.json".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
    }
}

#[event]
pub struct DepositTriggeredEvent {
    pub signer: Pubkey,
    pub amount: u64,
    pub receiver: [u8; 20],
    pub token_id: [u8; 32],
    pub destination_chain_id: u64,
    pub timestamp: i64,
    pub has_revert_options: bool,
}