use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

/// Called by ZetaChain gateway when a cross-chain call reverts
#[derive(Accounts)]
pub struct OnRevert<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    /// CHECK: Gateway PDA account
    #[account(mut)]
    pub gateway_pda: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn on_revert(
    mut ctx: Context<OnRevert>,
    amount: u64,
    sender: Pubkey,
    data: Vec<u8>,
) -> Result<()> {
    msg!("=== ON_REVERT HANDLER START ===");
    msg!("Amount: {} lamports", amount);
    msg!("Sender: {}", sender);
    msg!("Data length: {} bytes", data.len());
    
    let program_state = &mut ctx.accounts.program_state;
    
    // Parse revert data
    let revert_info = parse_revert_data(&data)?;
    msg!("Revert reason: {}", revert_info.reason);
    msg!("Original token ID: {:?}", revert_info.token_id);
    msg!("Failed operation: {:?}", revert_info.operation_type);
    
    // Handle the revert based on operation type
    match revert_info.operation_type {
        CrossChainMessageType::Transfer => {
            msg!("Reverting cross-chain transfer");
            handle_transfer_revert(&mut ctx, &revert_info, amount)?;
        },
        CrossChainMessageType::Mint => {
            msg!("Reverting cross-chain mint");
            handle_mint_revert(&mut ctx, &revert_info, amount)?;
        },
        _ => {
            msg!("Unsupported revert operation: {:?}", revert_info.operation_type);
            return Err(UniversalNftError::InvalidCrossChainMessage.into());
        }
    }
    
    // Check if the revert message contains "revert" and return an error if so (for testing)
    if revert_info.reason.contains("revert") {
        msg!("Revert message detected in revert handler: '{}'", revert_info.reason);
        return Err(UniversalNftError::RevertMessage.into());
    }
    
    msg!("✅ on_revert completed successfully");
    msg!("=== ON_REVERT HANDLER END ===");
    
    Ok(())
}

#[derive(Debug)]
struct RevertInfo {
    pub reason: String,
    pub token_id: [u8; 32],
    pub operation_type: CrossChainMessageType,
    pub original_sender: Pubkey,
    pub timestamp: i64,
}

fn parse_revert_data(data: &[u8]) -> Result<RevertInfo> {
    msg!("Parsing revert data from {} bytes", data.len());
    
    if data.is_empty() {
        msg!("Empty revert data, creating default revert info");
        return Ok(RevertInfo {
            reason: "Unknown revert reason".to_string(),
            token_id: [0u8; 32],
            operation_type: CrossChainMessageType::Transfer,
            original_sender: Pubkey::default(),
            timestamp: Clock::get()?.unix_timestamp,
        });
    }
    
    // Try to parse as structured data first
    if let Ok(message) = CrossChainMessage::try_from_slice(data) {
        msg!("Parsed structured revert message");
        return Ok(RevertInfo {
            reason: "Structured revert".to_string(),
            token_id: message.token_id,
            operation_type: message.message_type,
            original_sender: Pubkey::default(), // Would need to be included in message
            timestamp: message.timestamp,
        });
    }
    
    // Parse as string data
    let reason = String::from_utf8(data.to_vec())
        .map_err(|_| UniversalNftError::InvalidDataFormat)?;
    
    msg!("Parsed revert reason: {}", reason);
    
    Ok(RevertInfo {
        reason,
        token_id: generate_token_id_from_revert_data(data),
        operation_type: CrossChainMessageType::Transfer,
        original_sender: Pubkey::default(),
        timestamp: Clock::get()?.unix_timestamp,
    })
}

fn generate_token_id_from_revert_data(data: &[u8]) -> [u8; 32] {
    let mut token_id = [0u8; 32];
    let clock = Clock::get().unwrap();
    
    // Create a unique token ID from revert data
    let data_len = std::cmp::min(data.len(), 16);
    if data_len > 0 {
        token_id[0..data_len].copy_from_slice(&data[0..data_len]);
    }
    
    let timestamp_bytes = clock.unix_timestamp.to_le_bytes();
    token_id[16..24].copy_from_slice(&timestamp_bytes);
    
    let slot_bytes = clock.slot.to_le_bytes();
    token_id[24..32].copy_from_slice(&slot_bytes);
    
    token_id
}

fn handle_transfer_revert(
    ctx: &mut Context<OnRevert>,
    revert_info: &RevertInfo,
    amount: u64,
) -> Result<()> {
    msg!("Handling transfer revert for token ID: {:?}", revert_info.token_id);
    msg!("Revert reason: {}", revert_info.reason);
    
    // In a full implementation, this would:
    // 1. Find the failed transfer record
    // 2. Restore the NFT to the original owner on Solana
    // 3. Update the transfer status to "Failed"
    // 4. Refund any fees if applicable
    // 5. Emit a revert event
    
    let program_state = &mut ctx.accounts.program_state;
    
    // For now, just log and update counters
    msg!("Would restore NFT ownership to original sender");
    msg!("Would refund {} lamports if applicable", amount);
    
    // Update program statistics
    program_state.total_receives += 1; // Count reverts as receives for tracking
    
    // Emit revert event for off-chain tracking
    emit!(CrossChainRevertEvent {
        token_id: revert_info.token_id,
        operation_type: revert_info.operation_type.clone(),
        reason: revert_info.reason.clone(),
        original_sender: revert_info.original_sender,
        amount,
        timestamp: revert_info.timestamp,
    });
    
    Ok(())
}

fn handle_mint_revert(
    ctx: &mut Context<OnRevert>,
    revert_info: &RevertInfo,
    amount: u64,
) -> Result<()> {
    msg!("Handling mint revert for token ID: {:?}", revert_info.token_id);
    msg!("Revert reason: {}", revert_info.reason);
    
    // In a full implementation, this would:
    // 1. Find the failed mint operation
    // 2. Clean up any partially created accounts
    // 3. Refund the mint fees
    // 4. Update operation status
    
    let program_state = &mut ctx.accounts.program_state;
    
    // For now, just log and update counters
    msg!("Would clean up failed mint operation");
    msg!("Would refund {} lamports", amount);
    
    // Update program statistics
    program_state.total_receives += 1;
    
    // Emit revert event
    emit!(CrossChainRevertEvent {
        token_id: revert_info.token_id,
        operation_type: revert_info.operation_type.clone(),
        reason: revert_info.reason.clone(),
        original_sender: revert_info.original_sender,
        amount,
        timestamp: revert_info.timestamp,
    });
    
    Ok(())
}

#[event]
pub struct CrossChainRevertEvent {
    pub token_id: [u8; 32],
    pub operation_type: CrossChainMessageType,
    pub reason: String,
    pub original_sender: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}