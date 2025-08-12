use anchor_lang::prelude::*;
use mpl_token_metadata::types::Creator;

declare_id!("BtLDSZV972yDM3rPttojPTioCY9fndP4wtuAFLHrzBWu");

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

#[program]
pub mod universal_nft {
    use super::*;

    /// Initialize the Universal NFT program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    /// Mint a new NFT on Solana
    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: String,
        symbol: String,
        uri: String,
        creators: Option<Vec<Creator>>,
    ) -> Result<()> {
        instructions::mint_nft(ctx, name, symbol, uri, creators)
    }

    /// Transfer NFT to another chain via ZetaChain
    pub fn transfer_cross_chain(
        ctx: Context<TransferCrossChain>,
        destination_chain_id: u64,
        recipient: [u8; 32],
    ) -> Result<()> {
        instructions::transfer_cross_chain(ctx, destination_chain_id, recipient)
    }

    /// Receive NFT from another chain via ZetaChain
    pub fn receive_cross_chain(
        ctx: Context<ReceiveCrossChain>,
        token_id: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
        creators: Option<Vec<Creator>>,
    ) -> Result<()> {
        instructions::receive_cross_chain(ctx, token_id, name, symbol, uri, creators)
    }

    /// Update gateway address (admin only)
    pub fn update_gateway(
        ctx: Context<UpdateGateway>,
        new_gateway: Pubkey,
    ) -> Result<()> {
        instructions::update_gateway(ctx, new_gateway)
    }
}