# Deployment Guide

## Prerequisites

Before deploying the Universal NFT program, ensure you have:

- Solana CLI 1.18+ installed
- Anchor Framework 0.30+ installed
- Sufficient SOL for deployment (~5-10 SOL recommended)
- Access to target network (devnet/testnet/mainnet)

## Local Development Setup

### 1. Start Local Validator

```bash
# Use the provided script
./scripts/localnet.sh

# Or manually start validator
solana-test-validator --reset --quiet
```

### 2. Configure Solana CLI

```bash
# Set to localhost for local development
solana config set --url localhost

# Or set to devnet for testing
solana config set --url devnet

# Verify configuration
solana config get
```

### 3. Create/Fund Wallet

```bash
# Create new keypair (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Fund wallet (localnet)
solana airdrop 10

# Fund wallet (devnet)
solana airdrop 2 --url devnet
```

## Build and Deploy

### 1. Build Program

```bash
# Clean previous builds
anchor clean

# Build the program
anchor build

# Verify build
ls -la target/deploy/
```

### 2. Deploy Program

```bash
# Deploy to current cluster
anchor deploy

# Deploy to specific cluster
anchor deploy --provider.cluster devnet
```

### 3. Verify Deployment

```bash
# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/universal_nft-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Check program account
solana account $PROGRAM_ID

# Verify program is executable
solana program show $PROGRAM_ID
```

## Program Initialization

### 1. Initialize Program State

```typescript
// Example TypeScript initialization
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UniversalNft } from "../target/types/universal_nft";

const program = anchor.workspace.UniversalNft as Program<UniversalNft>;

// Initialize program
const [programStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("program_state")],
  program.programId
);

await program.methods
  .initialize()
  .accounts({
    programState: programStatePda,
    authority: provider.wallet.publicKey,
    gateway: gatewayAddress, // ZetaChain gateway address
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
```

### 2. Set Gateway Address

The gateway address should be the deployed ZetaChain gateway contract address for your target network:

- **Localnet**: Use test gateway address
- **Devnet**: Use ZetaChain devnet gateway
- **Mainnet**: Use ZetaChain mainnet gateway

## Network-Specific Deployment

### Devnet Deployment

```bash
# Set cluster to devnet
solana config set --url devnet

# Deploy program
anchor deploy --provider.cluster devnet

# Initialize with devnet gateway
# (Use appropriate gateway address for devnet)
```

### Testnet Deployment

```bash
# Set cluster to testnet
solana config set --url testnet

# Deploy program
anchor deploy --provider.cluster testnet

# Initialize with testnet gateway
```

### Mainnet Deployment

```bash
# Set cluster to mainnet-beta
solana config set --url mainnet-beta

# Deploy program (requires significant SOL)
anchor deploy --provider.cluster mainnet-beta

# Initialize with mainnet gateway
# IMPORTANT: Use verified mainnet gateway address
```

## Post-Deployment Verification

### 1. Test Basic Functionality

```bash
# Run test suite
anchor test

# Test specific functionality
anchor test --grep "mint_nft"
```

### 2. Verify Cross-Chain Integration

```typescript
// Test cross-chain transfer
await program.methods
  .transferCrossChain(
    new anchor.BN(1), // destination chain ID
    recipientBytes    // recipient address
  )
  .accounts({
    // ... required accounts
  })
  .rpc();
```

### 3. Monitor Events

```typescript
// Listen for cross-chain events
program.addEventListener("CrossChainTransferEvent", (event) => {
  console.log("Cross-chain transfer:", event);
});
```

## Configuration Management

### 1. Update Gateway (Admin Only)

```typescript
await program.methods
  .updateGateway(newGatewayAddress)
  .accounts({
    programState: programStatePda,
    authority: authorityKeypair.publicKey,
    newGateway: newGatewayAddress,
  })
  .signers([authorityKeypair])
  .rpc();
```

### 2. Program Upgrades

```bash
# Build new version
anchor build

# Upgrade program (requires upgrade authority)
solana program deploy target/deploy/universal_nft.so --program-id $PROGRAM_ID
```

## Security Checklist

### Pre-Deployment
- [ ] Code reviewed 
- [ ] All tests passing
- [ ] Security audit completed (for mainnet)
- [ ] Gateway address verified
- [ ] Compute budget optimized

### Post-Deployment
- [ ] Program functionality verified
- [ ] Cross-chain integration tested
- [ ] Event emission working
- [ ] Access controls functioning
- [ ] Error handling tested

## Troubleshooting

### Common Issues

1. **Insufficient SOL for deployment**
   ```bash
   # Check balance
   solana balance
   
   # Request airdrop (devnet only)
   solana airdrop 5
   ```

2. **Program deployment failed**
   ```bash
   # Check program size
   ls -lh target/deploy/universal_nft.so
   
   # Increase compute budget if needed
   solana program deploy --max-len 200000 target/deploy/universal_nft.so
   ```

3. **Gateway integration issues**
   - Verify gateway address is correct for network
   - Check gateway program is deployed
   - Ensure proper account permissions

### Debug Commands

```bash
# Check program logs
solana logs $PROGRAM_ID

# Inspect account data
solana account $PROGRAM_STATE_PDA --output json

# Monitor transactions
solana transaction-history $SIGNATURE
```

## Monitoring and Maintenance

### 1. Set Up Monitoring

```typescript
// Monitor program events
const connection = new Connection(clusterUrl);
connection.onLogs(programId, (logs) => {
  console.log("Program logs:", logs);
});
```

### 2. Regular Maintenance

- Monitor program account rent
- Check for failed transactions
- Update gateway address if needed
- Monitor cross-chain message flow

### 3. Backup and Recovery

- Keep secure backup of program keypair
- Document all deployment parameters
- Maintain upgrade authority securely
- Regular state backups for critical data