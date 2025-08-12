use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use mpl_token_metadata::types::{DataV2, Creator};
use mpl_token_metadata::instructions::{CreateMetadataAccountV3, CreateMasterEditionV3};
use crate::state::*;


#[derive(Accounts)]
pub struct MintNft<'info> {
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

pub fn mint_nft(
    ctx: Context<MintNft>,
    name: String,
    symbol: String,
    uri: String,
    creators: Option<Vec<Creator>>,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let mint = &ctx.accounts.mint;
    let token_account = &ctx.accounts.token_account;
    let nft_origin = &mut ctx.accounts.nft_origin;
    
    // Generate unique token ID
    let token_id = generate_token_id(&mint.key(), program_state);
    
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
    
    // Prepare signer seeds
    let mint_authority_bump = ctx.bumps.mint_authority;
    let mint_authority_seeds: &[&[u8]] = &[b"mint_authority", &[mint_authority_bump]];
    let signer_seeds = &[mint_authority_seeds];
    
    anchor_lang::solana_program::program::invoke_signed(
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
    )?;
    
    // Create master edition
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
    
    anchor_lang::solana_program::program::invoke_signed(
        &create_master_edition_ix.instruction(mpl_token_metadata::instructions::CreateMasterEditionV3InstructionArgs {
            max_supply: Some(0),
        }),
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
    )?;
    
    // Mint token to recipient
    
    let mint_to_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        },
        signer_seeds,
    );
    
    token::mint_to(mint_to_ctx, 1)?;
    
    // Store origin information
    nft_origin.original_mint = mint.key();
    nft_origin.token_id = token_id;
    nft_origin.origin_chain_id = 0; // Solana chain ID (to be defined)
    nft_origin.block_number = Clock::get()?.slot;
    nft_origin.bump = ctx.bumps.nft_origin;
    
    // Update program state
    program_state.next_token_id += 1;
    program_state.total_minted += 1;
    
    msg!("NFT minted successfully");
    msg!("Mint: {}", mint.key());
    msg!("Token ID: {:?}", token_id);
    msg!("Recipient: {}", ctx.accounts.recipient.key());
    
    Ok(())
}

fn generate_token_id(mint: &Pubkey, program_state: &ProgramState) -> [u8; 32] {
    let mut token_id = [0u8; 32];
    let mint_bytes = mint.to_bytes();
    let block_number = Clock::get().unwrap().slot.to_le_bytes();
    let next_id = program_state.next_token_id.to_le_bytes();
    
    // Combine mint pubkey + block number + next token ID
    token_id[0..16].copy_from_slice(&mint_bytes[0..16]);
    token_id[16..24].copy_from_slice(&block_number);
    token_id[24..32].copy_from_slice(&next_id);
    
    token_id
}