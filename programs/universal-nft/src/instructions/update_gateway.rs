use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct UpdateGateway<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump,
        has_one = authority @ UniversalNftError::Unauthorized
    )]
    pub program_state: Account<'info, ProgramState>,
    
    pub authority: Signer<'info>,
    
    /// CHECK: New gateway address will be validated
    pub new_gateway: AccountInfo<'info>,
}

pub fn update_gateway(
    ctx: Context<UpdateGateway>,
    new_gateway: Pubkey,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    
    require!(new_gateway != Pubkey::default(), UniversalNftError::InvalidGateway);
    
    let old_gateway = program_state.gateway;
    program_state.gateway = new_gateway;
    
    msg!("Gateway updated");
    msg!("Old gateway: {}", old_gateway);
    msg!("New gateway: {}", new_gateway);
    
    emit!(GatewayUpdatedEvent {
        old_gateway,
        new_gateway,
        authority: ctx.accounts.authority.key(),
    });
    
    Ok(())
}

#[event]
pub struct GatewayUpdatedEvent {
    pub old_gateway: Pubkey,
    pub new_gateway: Pubkey,
    pub authority: Pubkey,
}