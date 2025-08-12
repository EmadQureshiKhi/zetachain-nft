use anchor_lang::prelude::*;
use crate::state::*;


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ProgramState::LEN,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Gateway address will be validated
    pub gateway: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    
    program_state.authority = ctx.accounts.authority.key();
    program_state.gateway = ctx.accounts.gateway.key();
    program_state.next_token_id = 1;
    program_state.total_minted = 0;
    program_state.bump = ctx.bumps.program_state;
    
    msg!("Universal NFT program initialized");
    msg!("Authority: {}", program_state.authority);
    msg!("Gateway: {}", program_state.gateway);
    
    Ok(())
}