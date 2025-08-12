use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Burn};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(destination_chain_id: u64, recipient: [u8; 32])]
pub struct TransferCrossChain<'info> {
    #[account(
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
        seeds = [b"nft_origin", mint.key().as_ref()],
        bump = nft_origin.bump
    )]
    pub nft_origin: Account<'info, NftOrigin>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: ZetaChain gateway program
    #[account(address = program_state.gateway)]
    pub gateway: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
}

pub fn transfer_cross_chain(
    ctx: Context<TransferCrossChain>,
    destination_chain_id: u64,
    recipient: [u8; 32],
) -> Result<()> {
    let token_account = &ctx.accounts.token_account;
    let nft_origin = &ctx.accounts.nft_origin;
    
    // Verify token account has the NFT
    require!(token_account.amount == 1, UniversalNftError::NftNotFound);
    
    // Verify valid destination chain
    require!(destination_chain_id > 0, UniversalNftError::InvalidChainId);
    
    // Burn the NFT
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    );
    
    token::burn(burn_ctx, 1)?;
    
    // Create cross-chain message
    let _cross_chain_message = CrossChainMessage {
        token_id: nft_origin.token_id,
        destination_chain_id,
        recipient,
        metadata: NftMetadata {
            name: "Universal NFT".to_string(), // This should come from metadata account
            symbol: "UNFT".to_string(),
            uri: "".to_string(), // This should come from metadata account
            seller_fee_basis_points: 0,
            creators: None,
        },
    };
    
    // Call ZetaChain gateway to initiate cross-chain transfer
    // This is a placeholder - actual implementation would depend on ZetaChain's gateway interface
    msg!("Initiating cross-chain transfer");
    msg!("Token ID: {:?}", nft_origin.token_id);
    msg!("Destination Chain: {}", destination_chain_id);
    msg!("Recipient: {:?}", recipient);
    
    // Emit event for off-chain indexing
    emit!(CrossChainTransferEvent {
        token_id: nft_origin.token_id,
        from_chain: 0, // Solana chain ID
        to_chain: destination_chain_id,
        sender: ctx.accounts.owner.key(),
        recipient,
    });
    
    Ok(())
}

#[event]
pub struct CrossChainTransferEvent {
    pub token_id: [u8; 32],
    pub from_chain: u64,
    pub to_chain: u64,
    pub sender: Pubkey,
    pub recipient: [u8; 32],
}