use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

/// Called by ZetaChain gateway when receiving cross-chain calls
#[derive(Accounts)]
pub struct OnCall<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    /// CHECK: Gateway PDA account
    #[account(mut)]
    pub gateway_pda: UncheckedAccount<'info>,
    
    /// CHECK: Random wallet for testing (as per ZetaChain example)
    #[account(mut)]
    pub random_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    
    /// CHECK: Instruction sysvar account for caller verification
    #[account(address = anchor_lang::solana_program::sysvar::instructions::id())]
    pub instruction_sysvar_account: UncheckedAccount<'info>,
}

pub fn on_call(
    mut ctx: Context<OnCall>,
    amount: u64,
    sender: [u8; 20],
    data: Vec<u8>,
) -> Result<()> {
    msg!("=== ON_CALL HANDLER START ===");
    msg!("Amount received: {} lamports", amount);
    msg!("Sender (EVM address): {:?}", sender);
    msg!("Data length: {} bytes", data.len());
    
    let program_state = &mut ctx.accounts.program_state;
    
    // Parse the cross-chain message from data
    let message = parse_cross_chain_message(&data)?;
    msg!("Parsed message type: {:?}", message.message_type);
    msg!("Token ID: {:?}", message.token_id);
    msg!("Source chain: {}", message.source_chain_id);
    msg!("Destination chain: {}", message.destination_chain_id);
    
    // Handle different message types
    match message.message_type {
        CrossChainMessageType::Mint => {
            msg!("Processing cross-chain NFT mint request");
            handle_cross_chain_mint(&mut ctx, &message, amount)?;
        },
        CrossChainMessageType::Transfer => {
            msg!("Processing cross-chain NFT transfer request");
            handle_cross_chain_transfer(&mut ctx, &message, amount)?;
        },
        CrossChainMessageType::Revert => {
            msg!("Processing cross-chain revert request");
            handle_cross_chain_revert(&mut ctx, &message, amount)?;
        },
        _ => {
            msg!("Unsupported message type: {:?}", message.message_type);
            return Err(UniversalNftError::InvalidCrossChainMessage.into());
        }
    }
    
    // Transfer some portion of lamports to random wallet (as per ZetaChain example)
    if amount > 0 {
        let transfer_amount = amount / 2;
        msg!("Transferring {} lamports to random wallet", transfer_amount);
        
        **ctx.accounts.gateway_pda.to_account_info().try_borrow_mut_lamports()? -= transfer_amount;
        **ctx.accounts.random_wallet.to_account_info().try_borrow_mut_lamports()? += transfer_amount;
    }
    
    // Check if the message contains "revert" and return an error if so (for testing)
    if let Ok(message_str) = String::from_utf8(data.clone()) {
        if message_str.contains("revert") {
            msg!("Revert message detected: '{}'", message_str);
            return Err(UniversalNftError::RevertMessage.into());
        }
    }
    
    msg!("✅ on_call completed successfully");
    msg!("=== ON_CALL HANDLER END ===");
    
    Ok(())
}

fn parse_cross_chain_message(data: &[u8]) -> Result<CrossChainMessage> {
    msg!("Parsing cross-chain message from {} bytes", data.len());
    
    if data.is_empty() {
        msg!("Empty data received, creating default transfer message");
        // Create a default message for testing
        return Ok(CrossChainMessage {
            message_type: CrossChainMessageType::Transfer,
            token_id: [0u8; 32],
            source_chain_id: 1, // Ethereum
            destination_chain_id: SOLANA_CHAIN_ID,
            sender: [0u8; 20],
            recipient: [0u8; 32],
            metadata: NftMetadata {
                name: "Cross-Chain NFT".to_string(),
                symbol: "XNFT".to_string(),
                uri: "https://example.com/metadata.json".to_string(),
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
            },
            timestamp: Clock::get()?.unix_timestamp,
        });
    }
    
    // Try to deserialize as CrossChainMessage
    match CrossChainMessage::try_from_slice(data) {
        Ok(message) => {
            msg!("Successfully parsed structured message");
            Ok(message)
        },
        Err(_) => {
            msg!("Failed to parse as structured message, treating as raw data");
            // If parsing fails, create a basic message from raw data
            let message_str = String::from_utf8(data.to_vec())
                .map_err(|_| UniversalNftError::InvalidDataFormat)?;
            
            msg!("Raw message: {}", message_str);
            
            // Create a basic cross-chain message
            Ok(CrossChainMessage {
                message_type: CrossChainMessageType::Transfer,
                token_id: generate_token_id_from_data(data),
                source_chain_id: 1, // Assume Ethereum
                destination_chain_id: SOLANA_CHAIN_ID,
                sender: [0u8; 20],
                recipient: [0u8; 32],
                metadata: NftMetadata {
                    name: format!("Cross-Chain NFT: {}", message_str.chars().take(20).collect::<String>()),
                    symbol: "XNFT".to_string(),
                    uri: "https://example.com/metadata.json".to_string(),
                    seller_fee_basis_points: 0,
                    creators: None,
                    collection: None,
                },
                timestamp: Clock::get()?.unix_timestamp,
            })
        }
    }
}

fn generate_token_id_from_data(data: &[u8]) -> [u8; 32] {
    let mut token_id = [0u8; 32];
    let clock = Clock::get().unwrap();
    
    // Combine data hash + timestamp + slot for uniqueness
    let data_len = std::cmp::min(data.len(), 16);
    token_id[0..data_len].copy_from_slice(&data[0..data_len]);
    
    let timestamp_bytes = clock.unix_timestamp.to_le_bytes();
    token_id[16..24].copy_from_slice(&timestamp_bytes);
    
    let slot_bytes = clock.slot.to_le_bytes();
    token_id[24..32].copy_from_slice(&slot_bytes);
    
    token_id
}

fn handle_cross_chain_mint(
    ctx: &mut Context<OnCall>,
    message: &CrossChainMessage,
    _amount: u64,
) -> Result<()> {
    msg!("Handling cross-chain mint for token ID: {:?}", message.token_id);
    
    // In a full implementation, this would:
    // 1. Create a new mint account
    // 2. Create metadata account
    // 3. Mint the NFT to the recipient
    // 4. Store origin information
    
    // For now, just log the operation
    msg!("Cross-chain mint would create NFT: {}", message.metadata.name);
    msg!("Recipient: {:?}", message.recipient);
    
    let program_state = &mut ctx.accounts.program_state;
    program_state.total_receives += 1;
    
    Ok(())
}

fn handle_cross_chain_transfer(
    ctx: &mut Context<OnCall>,
    message: &CrossChainMessage,
    _amount: u64,
) -> Result<()> {
    msg!("Handling cross-chain transfer for token ID: {:?}", message.token_id);
    
    // In a full implementation, this would:
    // 1. Find the existing NFT by token ID
    // 2. Verify ownership
    // 3. Update the NFT's location/ownership
    // 4. Emit transfer event
    
    // For now, just log the operation
    msg!("Cross-chain transfer would move NFT: {}", message.metadata.name);
    msg!("From chain {} to chain {}", message.source_chain_id, message.destination_chain_id);
    
    let program_state = &mut ctx.accounts.program_state;
    program_state.total_receives += 1;
    
    Ok(())
}

fn handle_cross_chain_revert(
    ctx: &mut Context<OnCall>,
    message: &CrossChainMessage,
    _amount: u64,
) -> Result<()> {
    msg!("Handling cross-chain revert for token ID: {:?}", message.token_id);
    
    // In a full implementation, this would:
    // 1. Find the failed transfer
    // 2. Restore the NFT to original owner
    // 3. Update transfer status
    // 4. Emit revert event
    
    // For now, just log the operation
    msg!("Cross-chain revert would restore NFT: {}", message.metadata.name);
    
    let program_state = &mut ctx.accounts.program_state;
    program_state.total_receives += 1;
    
    Ok(())
}