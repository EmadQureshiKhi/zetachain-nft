# Universal NFT Architecture

## Overview

The Universal NFT Solana program implements a cross-chain NFT protocol that enables seamless transfers between Solana and other blockchains via ZetaChain's universal interoperability layer.

## Core Design Principles

### 1. Burn & Mint Pattern
- NFTs are burned on the source chain and minted on the destination chain
- Ensures no double-spending across chains
- Maintains total supply consistency

### 2. Universal Token IDs
- Each NFT has a unique 32-byte identifier across all chains
- Generated from: `mint_pubkey + block_number + sequence_id`
- Enables tracking and verification across chains

### 3. Origin Tracking
- Program Data Accounts (PDAs) store NFT origin information
- Links new mints to original metadata when NFTs return to Solana
- Preserves provenance and history

## Program Structure

```
universal-nft/
├── src/
│   ├── lib.rs              # Main program entry point
│   ├── state.rs            # Account structures and data types
│   ├── errors.rs           # Custom error definitions
│   └── instructions/       # Instruction handlers
│       ├── initialize.rs   # Program initialization
│       ├── mint_nft.rs     # NFT minting logic
│       ├── transfer_cross_chain.rs  # Cross-chain transfers
│       ├── receive_cross_chain.rs   # Receiving from other chains
│       └── update_gateway.rs        # Gateway management
```

## Account Architecture

### Program State Account
```rust
pub struct ProgramState {
    pub authority: Pubkey,      // Program admin
    pub gateway: Pubkey,        // ZetaChain gateway
    pub next_token_id: u64,     // Token ID counter
    pub total_minted: u64,      // Total NFTs minted
    pub bump: u8,               // PDA bump seed
}
```

### NFT Origin Account
```rust
pub struct NftOrigin {
    pub original_mint: Pubkey,   // Original mint key
    pub token_id: [u8; 32],      // Universal token ID
    pub origin_chain_id: u64,    // Chain where first minted
    pub block_number: u64,       // Block when minted
    pub bump: u8,                // PDA bump seed
}
```

## Cross-Chain Flow

### Outbound Transfer (Solana → Other Chain)

1. **Validation**
   - Verify NFT ownership
   - Check destination chain validity
   - Validate recipient address

2. **Burn Process**
   - Burn NFT token on Solana
   - Retrieve token ID from origin PDA
   - Prepare cross-chain message

3. **Gateway Call**
   - Call ZetaChain gateway with transfer data
   - Include token ID, destination, recipient
   - Emit transfer event

### Inbound Transfer (Other Chain → Solana)

1. **Gateway Verification**
   - Only authorized gateway can call
   - Verify cross-chain message authenticity
   - Extract NFT metadata

2. **Origin Check**
   - Check if NFT has been on Solana before
   - If yes: reference original metadata
   - If no: create new origin record

3. **Mint Process**
   - Create new mint account
   - Create metadata account (Metaplex standard)
   - Mint token to recipient
   - Update origin tracking

## Security Considerations

### Compute Budget Management
- Instructions optimized for Solana's compute limits
- Efficient PDA derivations
- Minimal cross-program invocations

### Rent Exemption
- All accounts properly funded
- Automatic rent calculation
- Payer responsibility clearly defined

### Access Control
- Gateway-only access for cross-chain operations
- Authority-based admin functions
- Proper signer verification

### Replay Protection
- Unique token IDs prevent replay attacks
- Nonce-based transaction ordering
- State validation on each operation

## Integration Points

### ZetaChain Gateway
```rust
// Placeholder for actual gateway interface
pub fn call_gateway(
    gateway: &AccountInfo,
    message: CrossChainMessage,
) -> Result<()> {
    // Implementation depends on ZetaChain's gateway contract
}
```

### Metaplex Integration
- Standard NFT metadata format
- Compatible with existing Solana NFT tools
- Proper master edition handling

## Error Handling

### Custom Errors
- `Unauthorized`: Access control violations
- `InvalidGateway`: Gateway validation failures
- `NftNotFound`: Missing NFT or origin data
- `CrossChainTransferFailed`: Transfer operation failures

### Recovery Mechanisms
- Failed transfers can be retried
- Origin data preserved for debugging
- Event emission for off-chain monitoring

## Performance Optimizations

### PDA Efficiency
- Minimal seed data for PDA derivation
- Cached bump seeds
- Efficient account lookups

### Instruction Batching
- Multiple operations in single transaction where possible
- Reduced network round trips
- Lower transaction costs

### Memory Management
- Fixed-size account structures
- Efficient serialization
- Minimal heap allocations

## Future Enhancements

### Planned Features
1. **Batch Transfers**: Multiple NFTs in single transaction
2. **Royalty Support**: Cross-chain royalty enforcement
3. **Collection Support**: NFT collection management
4. **Governance**: Decentralized program upgrades

### Scalability Improvements
1. **State Compression**: Reduce account storage costs
2. **Indexing**: Off-chain data indexing for faster queries
3. **Caching**: Metadata caching for improved performance

## Testing Strategy

### Unit Tests
- Individual instruction testing
- Account validation testing
- Error condition testing

### Integration Tests
- End-to-end cross-chain flows
- Gateway interaction testing
- Multi-chain scenario testing

### Security Audits
- Code review by security experts
- Formal verification where applicable
- Bug bounty programs