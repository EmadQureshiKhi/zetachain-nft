# Universal NFT - Deployment Guide

This guide walks you through deploying and testing the Universal NFT program with ZetaChain integration.

## 🚀 Quick Start

### Prerequisites

1. **Solana CLI** (v1.18+)
   ```bash
   sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
   ```

2. **Anchor Framework** (v0.30+)
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --force
   avm install 0.31.0
   avm use 0.31.0
   ```

3. **Node.js** (v18+)
   ```bash
   # Install Node.js from https://nodejs.org/
   ```

4. **Rust** (latest stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

### Setup Wallet

1. **Generate a new wallet** (or use existing):
   ```bash
   solana-keygen new --outfile ~/.config/solana/id.json
   ```

2. **Set cluster to devnet**:
   ```bash
   solana config set --url devnet
   ```

3. **Get devnet SOL**:
   ```bash
   solana airdrop 2
   # Or visit: https://faucet.solana.com/
   ```

4. **Check balance**:
   ```bash
   solana balance
   ```

## 📦 Deployment Steps

### Step 1: Build and Deploy

Run the comprehensive deployment script:

```bash
./scripts/deploy-and-test.sh devnet
```

This script will:
- ✅ Check prerequisites
- ✅ Build the program
- ✅ Deploy to devnet
- ✅ Verify deployment
- ✅ Run basic tests
- ✅ Generate configuration files
- ✅ Create deployment summary

### Step 2: Initialize Program

Initialize the program with ZetaChain gateway:

```bash
node initialize-program.js
```

Expected output:
```
🚀 Initializing Universal NFT Program...
✅ Program loaded successfully
✅ Program initialized successfully!
📊 Program State:
   Authority: [your-wallet-address]
   Gateway: ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis
   Next Token ID: 1
   Total Minted: 0
```

### Step 3: Test NFT Minting

Test the core NFT minting functionality:

```bash
node test-minting.js
```

Expected output:
```
🎨 Testing Universal NFT Minting...
✅ Program loaded successfully
🎯 Minting 2 test NFTs...
✅ NFT minted successfully!
🔗 View on Solana Explorer: [transaction-link]
```

### Step 4: Test Cross-Chain Features

Test ZetaChain integration features:

```bash
node test-cross-chain.js
```

Expected output:
```
🌉 Testing Universal NFT Cross-Chain Functionality...
✅ Program loaded successfully
🧪 Test 1: Trigger Deposit to ZetaChain
✅ Trigger deposit successful!
🧪 Test 2: Simulate on_call Handler
🧪 Test 3: Simulate on_revert Handler
```

## 🔧 Configuration

### Program IDs

- **Universal NFT Program**: `6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2`
- **ZetaChain Gateway**: `ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis`

### Important PDAs

- **Program State**: `[program_state]` seed
- **Mint Authority**: `[mint_authority]` seed
- **NFT Origin**: `[nft_origin, mint_pubkey]` seeds
- **Transfer Record**: `[transfer, token_id]` seeds

### Supported Chains

| Chain | Chain ID | Symbol |
|-------|----------|--------|
| Solana | 101 | SOL |
| Ethereum | 1 | ETH |
| BNB Chain | 56 | BNB |
| Polygon | 137 | MATIC |
| Avalanche | 43114 | AVAX |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |

## 🧪 Testing

### Unit Tests

Run Anchor tests:
```bash
anchor test
```

### Integration Tests

Test specific functionality:
```bash
# Test program initialization
node initialize-program.js

# Test NFT minting
node test-minting.js

# Test cross-chain features
node test-cross-chain.js
```

### Frontend Testing

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Connect wallet** and test in browser:
   - Connect Phantom wallet (set to devnet)
   - Try minting NFTs
   - View NFT gallery
   - Test cross-chain transfers

## 🔍 Monitoring

### View Program Logs

```bash
# Monitor program logs in real-time
solana logs 6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2

# View specific transaction
solana confirm [transaction-signature] -v
```

### Check Program State

```bash
# Check program account
solana account 6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2

# Check program state PDA
solana account [program-state-pda]
```

### Solana Explorer

- **Program**: https://explorer.solana.com/address/6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2?cluster=devnet
- **Your Wallet**: https://explorer.solana.com/address/[your-wallet]?cluster=devnet

## 🌐 Cross-Chain Integration

### ZetaChain Gateway Integration

The program integrates with ZetaChain's universal interoperability protocol:

1. **on_call**: Handles incoming cross-chain calls
2. **on_revert**: Handles failed cross-chain operations
3. **trigger_deposit**: Initiates cross-chain transfers

### Cross-Chain Flow

```
Solana → ZetaChain → Destination Chain
   ↓         ↓            ↓
 Burn    Route         Mint
```

### Message Format

Cross-chain messages include:
- Token ID (32 bytes)
- Source/destination chain IDs
- Sender/recipient addresses
- NFT metadata
- Operation type (mint/transfer/burn/revert)

## 🚨 Troubleshooting

### Common Issues

1. **"Program not initialized"**
   ```bash
   # Solution: Run initialization
   node initialize-program.js
   ```

2. **"Insufficient funds"**
   ```bash
   # Solution: Get more devnet SOL
   solana airdrop 2
   ```

3. **"Account already exists"**
   ```bash
   # Solution: This is usually fine, indicates retry
   # Check if operation completed successfully
   ```

4. **"Invalid gateway caller"**
   ```bash
   # Solution: This is expected in test environment
   # Only ZetaChain gateway can call certain functions
   ```

### Debug Commands

```bash
# Check Solana version
solana --version

# Check Anchor version
anchor --version

# Check wallet configuration
solana config get

# Check program deployment
anchor show 6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2
```

### Log Analysis

Look for these log patterns:

- ✅ `=== INITIALIZE START ===` - Program initialization
- ✅ `=== MINT NFT START ===` - NFT minting
- ✅ `=== CROSS-CHAIN TRANSFER START ===` - Cross-chain operations
- ❌ Error messages with specific error codes

## 📚 Next Steps

1. **Deploy to Testnet/Mainnet**:
   ```bash
   ./scripts/deploy-and-test.sh testnet
   ./scripts/deploy-and-test.sh mainnet-beta
   ```

2. **Integrate with Real ZetaChain Gateway**:
   - Update gateway program ID
   - Implement actual cross-chain message handling
   - Add proper authentication

3. **Frontend Enhancements**:
   - Add cross-chain transfer UI
   - Implement NFT gallery
   - Add transaction history

4. **Production Considerations**:
   - Add proper error handling
   - Implement fee mechanisms
   - Add admin controls
   - Monitor cross-chain operations

## 🤝 Support

- **Documentation**: Check README.md
- **Issues**: Create GitHub issues
- **Logs**: Use `solana logs` for debugging
- **Community**: Join Solana Discord

---

**Happy cross-chain NFT building! 🚀**