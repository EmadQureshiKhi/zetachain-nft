use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use mpl_token_metadata::types::{DataV2, Creator};
use mpl_token_metadata::instructions::CreateMetadataAccountV3;
use crate::state::*;


#[derive(Accounts)]
pub struct ReceiveCrossChain<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = payer,
        space = NftOrigin::LEN,
        seeds = [b"nft_origin", mint.key().as_ref()],
        bump
    )]
    pub nft_origin: Account<'info, NftOrigin>,
    
    /// CHECK: Metadata account will be created by Metaplex
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    
    /// CHECK: Mint authority PDA
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: NFT recipient
    pub recipient: AccountInfo<'info>,
    
    /// CHECK: ZetaChain gateway program - only gateway can call this
    #[account(
        address = program_state.gateway,
        signer
    )]
    pub gateway: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Metaplex token metadata program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
}

pub fn receive_cross_chain(
    ctx: Context<ReceiveCrossChain>,
    token_id: [u8; 32],
    name: String,
    symbol: String,
    uri: String,
    creators: Option<Vec<Creator>>,
) -> Result<()> {
    msg!("=== CROSS-CHAIN RECEIVE START ===");
    msg!("Token ID: {:?}", token_id);
    msg!("Name: {}", name);
    msg!("Symbol: {}", symbol);
    msg!("URI: {}", uri);
    msg!("New Mint: {}", ctx.accounts.mint.key());
    msg!("Recipient: {}", ctx.accounts.recipient.key());
    msg!("Gateway: {}", ctx.accounts.gateway.key());
    msg!("Payer: {}", ctx.accounts.payer.key());

    // Validate inputs
    require!(!name.is_empty(), crate::errors::UniversalNftError::InvalidInstructionData);
    require!(!symbol.is_empty(), crate::errors::UniversalNftError::InvalidInstructionData);
    require!(token_id != [0u8; 32], crate::errors::UniversalNftError::InvalidTokenId);

    let program_state = &mut ctx.accounts.program_state;
    let mint = &ctx.accounts.mint;
    let token_account = &ctx.accounts.token_account;
    let nft_origin = &mut ctx.accounts.nft_origin;
    
    // Check if this NFT has been on Solana before by looking at the origin account
    let is_returning_nft = nft_origin.original_mint != Pubkey::default();
    
    if is_returning_nft {
        msg!("✅ NFT returning to Solana");
        msg!("  Original mint: {}", nft_origin.original_mint);
        msg!("  Origin chain: {}", nft_origin.origin_chain_id);
        msg!("  Previous transfer count: {}", nft_origin.transfer_count);
        msg!("  Last transfer: {}", nft_origin.last_transfer_timestamp);
        
        // Update the existing origin record
        nft_origin.current_chain_id = SOLANA_CHAIN_ID;
        nft_origin.transfer_count += 1;
        nft_origin.last_transfer_timestamp = Clock::get()?.unix_timestamp;
    } else {
        msg!("✅ NFT first time on Solana from external chain");
        
        // Initialize new origin information
        nft_origin.token_id = token_id;
        nft_origin.origin_chain_id = 1; // External chain ID (would come from cross-chain message)
        nft_origin.current_chain_id = SOLANA_CHAIN_ID;
        nft_origin.block_number = Clock::get()?.slot;
        nft_origin.transfer_count = 1;
        nft_origin.last_transfer_timestamp = Clock::get()?.unix_timestamp;
        nft_origin.bump = ctx.bumps.nft_origin;
    }
    
    // Always update the current mint reference
    nft_origin.original_mint = mint.key();
    
    msg!("NFT origin updated:");
    msg!("  Token ID: {:?}", nft_origin.token_id);
    msg!("  Origin chain: {}", nft_origin.origin_chain_id);
    msg!("  Current chain: {}", nft_origin.current_chain_id);
    msg!("  Transfer count: {}", nft_origin.transfer_count);

    // Validate creators if provided
    if let Some(ref creators_vec) = creators {
        msg!("Validating {} creators", creators_vec.len());
        let mut total_share = 0u8;
        for (i, creator) in creators_vec.iter().enumerate() {
            msg!("Creator {}: address={}, verified={}, share={}%", 
                i, creator.address, creator.verified, creator.share);
            total_share += creator.share;
        }
        require!(total_share <= 100, crate::errors::UniversalNftError::InvalidInstructionData);
    }
    
    // Create metadata for the new mint
    let metadata_data = DataV2 {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        seller_fee_basis_points: 0,
        creators,
        collection: None,
        uses: None,
    };
    
    // Create metadata account
    let create_metadata_ix = CreateMetadataAccountV3 {
        metadata: ctx.accounts.metadata.key(),
        mint: mint.key(),
        mint_authority: ctx.accounts.mint_authority.key(),
        payer: ctx.accounts.payer.key(),
        update_authority: (ctx.accounts.mint_authority.key(), true),
        system_program: ctx.accounts.system_program.key(),
        rent: Some(ctx.accounts.rent.key()),
    };
    
    // Prepare signer seeds
    let mint_authority_bump = ctx.bumps.mint_authority;
    let mint_authority_seeds: &[&[u8]] = &[b"mint_authority", &[mint_authority_bump]];
    let signer_seeds = &[mint_authority_seeds];
    
    msg!("Creating metadata account...");
    match anchor_lang::solana_program::program::invoke_signed(
        &create_metadata_ix.instruction(mpl_token_metadata::instructions::CreateMetadataAccountV3InstructionArgs {
            data: metadata_data,
            is_mutable: true,
            collection_details: None,
        }),
        &[
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signer_seeds,
    ) {
        Ok(_) => msg!("✅ Metadata account created successfully"),
        Err(e) => {
            msg!("❌ Metadata creation failed: {:?}", e);
            return Err(crate::errors::UniversalNftError::MetadataCreationFailed.into());
        }
    }
    
    // Mint token to recipient
    msg!("Minting token to recipient...");
    let mint_to_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        },
        signer_seeds,
    );
    
    match token::mint_to(mint_to_ctx, 1) {
        Ok(_) => msg!("✅ Token minted successfully"),
        Err(e) => {
            msg!("❌ Token mint failed: {:?}", e);
            return Err(crate::errors::UniversalNftError::TokenMintFailed.into());
        }
    }
    
    // Update program state
    program_state.total_minted += 1;
    program_state.total_receives += 1;
    
    msg!("✅ NFT received from cross-chain successfully:");
    msg!("  Token ID: {:?}", token_id);
    msg!("  New Mint: {}", mint.key());
    msg!("  Recipient: {}", ctx.accounts.recipient.key());
    msg!("  Is returning NFT: {}", is_returning_nft);
    msg!("  Total minted: {}", program_state.total_minted);
    msg!("  Total receives: {}", program_state.total_receives);
    
    // Emit event for off-chain indexing
    emit!(CrossChainReceiveEvent {
        token_id,
        mint: mint.key(),
        recipient: ctx.accounts.recipient.key(),
        is_returning: is_returning_nft,
        source_chain_id: nft_origin.origin_chain_id,
        transfer_count: nft_origin.transfer_count,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    msg!("=== CROSS-CHAIN RECEIVE END ===");
    
    Ok(())
}

#[event]
pub struct CrossChainReceiveEvent {
    pub token_id: [u8; 32],
    pub mint: Pubkey,
    pub recipient: Pubkey,
    pub is_returning: bool,
    pub source_chain_id: u64,
    pub transfer_count: u64,
    pub timestamp: i64,
}