use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use mpl_token_metadata::types::{DataV2, Creator};
use mpl_token_metadata::instructions::{CreateMetadataAccountV3, CreateMasterEditionV3};
use crate::state::*;

#[derive(Accounts)]
pub struct MintNftSimple<'info> {
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
    
    /// CHECK: Metadata account will be created by Metaplex
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    
    /// CHECK: Master edition account will be created by Metaplex
    #[account(mut)]
    pub master_edition: AccountInfo<'info>,
    
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
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Metaplex token metadata program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
}

pub fn mint_nft_simple(
    ctx: Context<MintNftSimple>,
    name: String,
    symbol: String,
    uri: String,
    creators: Option<Vec<Creator>>,
) -> Result<()> {
    msg!("=== MINT NFT SIMPLE START ===");
    msg!("Function entry successful");
    msg!("Name: {}", name);
    msg!("Symbol: {}", symbol);
    msg!("URI: {}", uri);
    msg!("Mint: {}", ctx.accounts.mint.key());
    msg!("Payer: {}", ctx.accounts.payer.key());
    msg!("Recipient: {}", ctx.accounts.recipient.key());
    msg!("Token Account: {}", ctx.accounts.token_account.key());
    msg!("Metadata Account: {}", ctx.accounts.metadata.key());
    msg!("Master Edition Account: {}", ctx.accounts.master_edition.key());
    msg!("About to validate inputs...");

    // Validate inputs
    msg!("Validating inputs...");
    require!(!name.is_empty(), crate::errors::UniversalNftError::InvalidInstructionData);
    msg!("Name validation passed");
    require!(!symbol.is_empty(), crate::errors::UniversalNftError::InvalidInstructionData);
    msg!("Symbol validation passed");
    require!(name.len() <= 32, crate::errors::UniversalNftError::InvalidInstructionData);
    msg!("Name length validation passed");
    require!(symbol.len() <= 10, crate::errors::UniversalNftError::InvalidInstructionData);
    msg!("Symbol length validation passed");

    msg!("Getting account references...");
    let program_state = &mut ctx.accounts.program_state;
    msg!("Got program_state reference");
    let mint = &ctx.accounts.mint;
    msg!("Got mint reference");
    let token_account = &ctx.accounts.token_account;
    msg!("Got token_account reference");

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
        msg!("Total creator share: {}%", total_share);
    }

    // Create metadata
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

    let mint_authority_bump = ctx.bumps.mint_authority;
    let mint_authority_seeds: &[&[u8]] = &[b"mint_authority", &[mint_authority_bump]];
    let signer_seeds = &[mint_authority_seeds];

    msg!("Creating metadata account...");
    let meta_ix = create_metadata_ix.instruction(mpl_token_metadata::instructions::CreateMetadataAccountV3InstructionArgs {
        data: metadata_data,
        is_mutable: true,
        collection_details: None,
    });
    
    match anchor_lang::solana_program::program::invoke_signed(
        &meta_ix,
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

    // Mint token to recipient FIRST (required before creating master edition)
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

    // Create master edition AFTER minting the token
    let create_master_edition_ix = CreateMasterEditionV3 {
        edition: ctx.accounts.master_edition.key(),
        mint: mint.key(),
        update_authority: ctx.accounts.mint_authority.key(),
        mint_authority: ctx.accounts.mint_authority.key(),
        payer: ctx.accounts.payer.key(),
        metadata: ctx.accounts.metadata.key(),
        token_program: ctx.accounts.token_program.key(),
        system_program: ctx.accounts.system_program.key(),
        rent: Some(ctx.accounts.rent.key()),
    };

    msg!("Creating master edition account...");
    let master_ix = create_master_edition_ix.instruction(mpl_token_metadata::instructions::CreateMasterEditionV3InstructionArgs {
        max_supply: Some(0),
    });
    
    match anchor_lang::solana_program::program::invoke_signed(
        &master_ix,
        &[
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signer_seeds,
    ) {
        Ok(_) => msg!("✅ Master edition account created successfully"),
        Err(e) => {
            msg!("❌ Master edition creation failed: {:?}", e);
            return Err(crate::errors::UniversalNftError::MasterEditionCreationFailed.into());
        }
    }

    // Update program state
    program_state.next_token_id += 1;
    program_state.total_minted += 1;

    msg!("✅ NFT minted successfully:");
    msg!("  Mint: {}", mint.key());
    msg!("  Recipient: {}", ctx.accounts.recipient.key());
    msg!("  Total Minted: {}", program_state.total_minted);
    msg!("  Next Token ID: {}", program_state.next_token_id);

    msg!("=== MINT NFT SIMPLE END ===");

    Ok(())
}