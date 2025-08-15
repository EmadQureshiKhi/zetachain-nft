use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

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
    msg!("=== INITIALIZE START ===");
    msg!("Program State PDA: {}", ctx.accounts.program_state.key());
    msg!("Authority: {}", ctx.accounts.authority.key());
    msg!("Gateway: {}", ctx.accounts.gateway.key());
    msg!("Program State Space: {} bytes", ProgramState::LEN);
    msg!("Bump: {}", ctx.bumps.program_state);
    
    // Validate gateway address is not default
    require!(
        ctx.accounts.gateway.key() != Pubkey::default(),
        UniversalNftError::InvalidGateway
    );
    
    let program_state = &mut ctx.accounts.program_state;
    
    // Initialize program state
    program_state.authority = ctx.accounts.authority.key();
    program_state.gateway = ctx.accounts.gateway.key();
    program_state.next_token_id = 1;
    program_state.total_minted = 0;
    program_state.total_transfers = 0;
    program_state.total_receives = 0;
    program_state.version = 1;
    program_state.bump = ctx.bumps.program_state;
    
    msg!("✅ Program state initialized successfully:");
    msg!("  Authority: {}", program_state.authority);
    msg!("  Gateway: {}", program_state.gateway);
    msg!("  Next Token ID: {}", program_state.next_token_id);
    msg!("  Version: {}", program_state.version);
    
    // Emit initialization event
    emit!(ProgramInitializedEvent {
        authority: program_state.authority,
        gateway: program_state.gateway,
        version: program_state.version,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    msg!("=== INITIALIZE END ===");
    
    Ok(())
}

#[event]
pub struct ProgramInitializedEvent {
    pub authority: Pubkey,
    pub gateway: Pubkey,
    pub version: u8,
    pub timestamp: i64,
}