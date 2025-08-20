use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Burn};
use anchor_lang::solana_program::program::invoke;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(destination_chain_id: u64, recipient: [u8; 32])]
pub struct TransferCrossChain<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"nft_origin", mint.key().as_ref()],
        bump = nft_origin.bump
    )]
    pub nft_origin: Account<'info, NftOrigin>,
    
    #[account(
        init,
        payer = owner,
        space = CrossChainTransfer::LEN,
        seeds = [b"transfer", nft_origin.token_id.as_ref()],
        bump
    )]
    pub transfer_record: Account<'info, CrossChainTransfer>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: ZetaChain gateway program
    #[account(address = program_state.gateway)]
    pub gateway: AccountInfo<'info>,
    
    /// CHECK: Gateway PDA for cross-chain operations
    #[account(mut)]
    pub gateway_pda: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn transfer_cross_chain(
    ctx: Context<TransferCrossChain>,
    destination_chain_id: u64,
    recipient: [u8; 32],
) -> Result<()> {
    msg!("=== CROSS-CHAIN TRANSFER START ===");
    msg!("Mint: {}", ctx.accounts.mint.key());
    msg!("Owner: {}", ctx.accounts.owner.key());
    msg!("Destination Chain ID: {}", destination_chain_id);
    msg!("Recipient: {:?}", recipient);
    msg!("Token Account: {}", ctx.accounts.token_account.key());
    msg!("Gateway: {}", ctx.accounts.gateway.key());

    let program_state = &mut ctx.accounts.program_state;
    let token_account = &ctx.accounts.token_account;
    let nft_origin = &mut ctx.accounts.nft_origin;
    let transfer_record = &mut ctx.accounts.transfer_record;
    
    // Validate inputs
    require!(token_account.amount == 1, UniversalNftError::NftNotFound);
    require!(destination_chain_id > 0, UniversalNftError::InvalidChainId);
    require!(destination_chain_id != SOLANA_CHAIN_ID, UniversalNftError::InvalidChainId);
    require!(recipient != [0u8; 32], UniversalNftError::InvalidRecipient);
    
    msg!("✅ Input validation passed");
    msg!("Current NFT location - Chain: {}, Transfer count: {}", 
        nft_origin.current_chain_id, nft_origin.transfer_count);

    // Create comprehensive cross-chain message with enhanced metadata
    let cross_chain_message = CrossChainMessage {
        message_type: CrossChainMessageType::Transfer,
        token_id: nft_origin.token_id,
        source_chain_id: SOLANA_CHAIN_ID,
        destination_chain_id,
        sender: solana_to_evm_address(&ctx.accounts.owner.key()),
        recipient,
        metadata: create_enhanced_transfer_metadata(&nft_origin.token_id, &ctx.accounts.mint.key()),
        timestamp: Clock::get()?.unix_timestamp,
    };

    msg!("Created cross-chain message:");
    msg!("  Message type: {:?}", cross_chain_message.message_type);
    msg!("  Token ID: {:?}", cross_chain_message.token_id);
    msg!("  Source chain: {}", cross_chain_message.source_chain_id);
    msg!("  Destination chain: {}", cross_chain_message.destination_chain_id);

    // Initialize transfer record
    transfer_record.token_id = nft_origin.token_id;
    transfer_record.source_chain_id = SOLANA_CHAIN_ID;
    transfer_record.destination_chain_id = destination_chain_id;
    transfer_record.sender = ctx.accounts.owner.key();
    transfer_record.recipient = recipient;
    transfer_record.status = TransferStatus::Pending;
    transfer_record.initiated_at = Clock::get()?.unix_timestamp;
    transfer_record.completed_at = None;
    transfer_record.error_message = None;
    transfer_record.bump = ctx.bumps.transfer_record;

    msg!("Transfer record initialized with status: {:?}", transfer_record.status);

    // Burn the NFT (this removes it from Solana)
    msg!("Burning NFT on Solana...");
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    );
    
    match token::burn(burn_ctx, 1) {
        Ok(_) => {
            msg!("✅ NFT burned successfully on Solana");
            transfer_record.status = TransferStatus::InProgress;
        },
        Err(e) => {
            msg!("❌ NFT burn failed: {:?}", e);
            transfer_record.status = TransferStatus::Failed;
            transfer_record.error_message = Some("Burn failed".to_string());
            return Err(UniversalNftError::TokenBurnFailed.into());
        }
    }

    // Update NFT origin tracking
    nft_origin.current_chain_id = destination_chain_id;
    nft_origin.transfer_count += 1;
    nft_origin.last_transfer_timestamp = Clock::get()?.unix_timestamp;

    // Update program state
    program_state.total_transfers += 1;

    // Create message data for ZetaChain Gateway
    let message_data = cross_chain_message.try_to_vec()?;
    msg!("Prepared message data of {} bytes for ZetaChain Gateway", message_data.len());

    // Create comprehensive revert options for failed transfers
    let revert_options = RevertOptions {
        revert_address: ctx.accounts.owner.key(),
        abort_address: solana_to_evm_address(&ctx.accounts.owner.key()),
        call_on_revert: true,
        revert_message: create_revert_message(&nft_origin.token_id, &ctx.accounts.owner.key()),
        on_revert_gas_limit: 200_000, // Increased gas for NFT re-minting operations
    };

    msg!("🛡️ Revert protection configured:");
    msg!("  - Revert address: {}", revert_options.revert_address);
    msg!("  - Abort address: {:?}", revert_options.abort_address);
    msg!("  - Call on revert: {}", revert_options.call_on_revert);
    msg!("  - Gas limit: {}", revert_options.on_revert_gas_limit);

    // Log the gateway call details
    msg!("Calling ZetaChain Gateway with:");
    msg!("  Destination chain: {}", destination_chain_id);
    msg!("  Recipient: {:?}", recipient);
    msg!("  Message size: {} bytes", message_data.len());
    msg!("  Revert address: {}", revert_options.revert_address);

    // Integrate with ZetaChain Solana Gateway using proper instruction format
    let gateway_instruction = create_gateway_deposit_and_call_instruction(
        &ctx.accounts.gateway.key(),
        &ctx.accounts.gateway_pda.key(),
        &ctx.accounts.owner.key(),
        0, // No SOL amount for NFT transfer
        recipient,
        message_data,
        Some(revert_options),
    )?;

    // Call ZetaChain gateway to initiate cross-chain transfer
    invoke(
        &gateway_instruction,
        &[
            ctx.accounts.gateway.to_account_info(),
            ctx.accounts.gateway_pda.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // For now, log the intended gateway interaction
    msg!("✅ Gateway call prepared (integration pending)");
    msg!("Cross-chain message prepared for ZetaChain processing");

    // Emit event for off-chain indexing and ZetaChain monitoring
    emit!(CrossChainTransferEvent {
        token_id: nft_origin.token_id,
        from_chain: SOLANA_CHAIN_ID,
        to_chain: destination_chain_id,
        sender: ctx.accounts.owner.key(),
        recipient,
        transfer_count: nft_origin.transfer_count,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("✅ Cross-chain transfer initiated successfully:");
    msg!("  Token ID: {:?}", nft_origin.token_id);
    msg!("  From chain: {} to chain: {}", SOLANA_CHAIN_ID, destination_chain_id);
    msg!("  Transfer count: {}", nft_origin.transfer_count);
    msg!("  Total program transfers: {}", program_state.total_transfers);
    msg!("=== CROSS-CHAIN TRANSFER END ===");
    
    Ok(())
}

fn solana_to_evm_address(pubkey: &Pubkey) -> [u8; 20] {
    let mut evm_address = [0u8; 20];
    let pubkey_bytes = pubkey.to_bytes();
    // Take the last 20 bytes of the Solana pubkey to create an EVM-style address
    evm_address.copy_from_slice(&pubkey_bytes[12..32]);
    evm_address
}

fn create_enhanced_transfer_metadata(token_id: &[u8; 32], mint: &Pubkey) -> NftMetadata {
    let token_id_hex = hex::encode(token_id);
    let short_id = &token_id_hex[0..8];
    
    NftMetadata {
        name: format!("Universal NFT #{}", short_id),
        symbol: "UNFT".to_string(),
        uri: format!("https://api.universalnft.io/metadata/{}.json", token_id_hex),
        seller_fee_basis_points: 250, // 2.5% royalty
        creators: Some(vec![
            NftCreator {
                address: mint.to_bytes(), // Use mint as creator identifier
                verified: true,
                share: 100,
            }
        ]),
        collection: Some(NftCollection {
            address: *mint, // Collection reference
            verified: true,
        }),
    }
}

fn create_revert_message(token_id: &[u8; 32], owner: &Pubkey) -> Vec<u8> {
    let message = format!(
        "REVERT_NFT_TRANSFER|token_id:{}|original_owner:{}|timestamp:{}",
        hex::encode(token_id),
        owner.to_string(),
        Clock::get().unwrap().unix_timestamp
    );
    message.into_bytes()
}

fn create_gateway_deposit_and_call_instruction(
    gateway_program: &Pubkey,
    gateway_pda: &Pubkey,
    payer: &Pubkey,
    amount: u64,
    receiver: [u8; 32],
    message: Vec<u8>,
    revert_options: Option<RevertOptions>,
) -> Result<anchor_lang::solana_program::instruction::Instruction> {
    use anchor_lang::solana_program::instruction::{AccountMeta, Instruction};
    
    // ZetaChain gateway instruction discriminator for deposit_and_call
    let mut instruction_data = vec![0x66, 0x87, 0x6a, 0x4d, 0x1c, 0x9a, 0x8b, 0x13]; // deposit_and_call discriminator
    
    // Serialize parameters according to ZetaChain gateway format
    instruction_data.extend_from_slice(&amount.to_le_bytes());
    instruction_data.extend_from_slice(&receiver);
    
    // Message length and data
    instruction_data.extend_from_slice(&(message.len() as u32).to_le_bytes());
    instruction_data.extend(message);
    
    // Revert options (simplified for now)
    if let Some(revert_opts) = revert_options {
        instruction_data.push(1); // Some
        instruction_data.extend_from_slice(&revert_opts.revert_address.to_bytes());
        instruction_data.extend_from_slice(&revert_opts.abort_address);
        instruction_data.push(if revert_opts.call_on_revert { 1 } else { 0 });
        instruction_data.extend_from_slice(&(revert_opts.revert_message.len() as u32).to_le_bytes());
        instruction_data.extend(revert_opts.revert_message);
        instruction_data.extend_from_slice(&revert_opts.on_revert_gas_limit.to_le_bytes());
    } else {
        instruction_data.push(0); // None
    }
    
    Ok(Instruction {
        program_id: *gateway_program,
        accounts: vec![
            AccountMeta::new(*gateway_pda, false),
            AccountMeta::new(*payer, true),
            AccountMeta::new_readonly(anchor_lang::solana_program::system_program::id(), false),
        ],
        data: instruction_data,
    })
}

#[event]
pub struct CrossChainTransferEvent {
    pub token_id: [u8; 32],
    pub from_chain: u64,
    pub to_chain: u64,
    pub sender: Pubkey,
    pub recipient: [u8; 32],
    pub transfer_count: u64,
    pub timestamp: i64,
}