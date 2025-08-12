# Universal NFT - Solana Cross-Chain Program

A Solana program that enables seamless cross-chain NFT transfers between Solana and other blockchains via ZetaChain's universal interoperability protocol.

## 🌟 Features

- **Cross-Chain NFT Transfers**: Send NFTs from Solana to Ethereum, BNB Chain, and other ZetaChain-connected networks
- **Universal Token IDs**: Unique token identification across all supported chains
- **Metadata Preservation**: NFT metadata and ownership history maintained across chains
- **Burn & Mint Mechanism**: Secure transfer protocol using burn-and-mint pattern
- **Origin Tracking**: Track NFT origins and cross-chain history
- **ZetaChain Integration**: Built for ZetaChain's universal blockchain ecosystem

## 🏗️ Architecture

### Core Components

1. **Universal NFT Program**: Main Solana program handling NFT operations
2. **NFT Origin Tracking**: PDA-based system to track NFT origins and cross-chain history
3. **ZetaChain Gateway Integration**: Interface with ZetaChain's protocol-contracts-solana
4. **Metadata Management**: Metaplex-compatible NFT metadata handling

### Cross-Chain Flow

```
Solana → ZetaChain → Ethereum/BNB → ZetaChain → Solana
   ↓         ↓           ↓            ↓         ↓
 Burn    Route      Mint         Route      Mint
```

## 🚀 Quick Start

### Prerequisites

- Rust 1.70+
- Solana CLI 1.18+
- Anchor Framework 0.30+
- Node.js 18+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd universal-nft-solana

# Install dependencies
npm install

# Build the program
anchor build

# Run tests
anchor test
```

### Local Development

```bash
# Start local test validator with Universal NFT program
./scripts/localnet.sh
```

This will:
- Start a Solana test validator
- Deploy the Universal NFT program
- Set up required token metadata programs
- Display the program ID for testing

## 📋 Program Instructions

### Initialize
Initialize the Universal NFT program with gateway configuration.

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
```

### Mint NFT
Mint a new NFT on Solana with cross-chain capabilities.

```rust
pub fn mint_nft(
    ctx: Context<MintNft>,
    name: String,
    symbol: String,
    uri: String,
    creators: Option<Vec<CreatorV2>>,
) -> Result<()>
```

### Transfer Cross-Chain
Transfer an NFT from Solana to another chain via ZetaChain.

```rust
pub fn transfer_cross_chain(
    ctx: Context<TransferCrossChain>,
    destination_chain_id: u64,
    recipient: [u8; 32],
) -> Result<()>
```

### Receive Cross-Chain
Receive an NFT from another chain via ZetaChain.

```rust
pub fn receive_cross_chain(
    ctx: Context<ReceiveCrossChain>,
    token_id: [u8; 32],
    name: String,
    symbol: String,
    uri: String,
    creators: Option<Vec<CreatorV2>>,
) -> Result<()>
```

## 🔧 Configuration

### Program State
The program maintains global state including:
- Authority (admin) address
- ZetaChain gateway address
- Next token ID counter
- Total minted NFTs

### NFT Origin Tracking
Each NFT has an associated origin account storing:
- Original mint key
- Unique token ID
- Origin chain ID
- Block number when minted

## 🧪 Testing

### Unit Tests
```bash
anchor test
```

### Integration Tests
```bash
# Test cross-chain functionality with ZetaChain testnet
npm run test:integration
```

## 🔐 Security Features

- **Compute Budget Management**: Optimized for Solana's compute limits
- **Rent Exemption**: All accounts properly funded for rent exemption
- **Signer Verification**: Proper authority and ownership checks
- **Replay Protection**: Token ID uniqueness prevents replay attacks
- **Gateway Authentication**: Only authorized gateway can trigger cross-chain operations

## 🌐 Cross-Chain Compatibility

### Supported Chains
- ✅ Solana (native)
- ✅ Ethereum (via ZetaChain)
- ✅ BNB Chain (via ZetaChain)
- ✅ Bitcoin (via ZetaChain)
- 🔄 Additional EVM chains (via ZetaChain)

### Token ID Generation
```rust
token_id = hash(mint_pubkey + block_number + next_token_id)
```

## 📚 Documentation

### Key Concepts

1. **Universal Token IDs**: Each NFT gets a unique 32-byte identifier used across all chains
2. **Burn & Mint**: NFTs are burned on source chain and minted on destination
3. **Origin Tracking**: PDAs store original mint information for returning NFTs
4. **Metadata Linking**: New mints reference original metadata when possible

### Account Structure

```
Program State PDA
├── Authority: Pubkey
├── Gateway: Pubkey  
├── Next Token ID: u64
└── Total Minted: u64

NFT Origin PDA (per NFT)
├── Original Mint: Pubkey
├── Token ID: [u8; 32]
├── Origin Chain ID: u64
└── Block Number: u64
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [ZetaChain Documentation](https://www.zetachain.com/docs/)
- [Protocol Contracts Solana](https://github.com/zeta-chain/protocol-contracts-solana)
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)

## 🏆 Hackathon Submission

This project was developed for the ZetaChain Universal Interoperability Hackathon, focusing on robust cross-chain NFT transfers between Solana and ZetaChain-connected networks.

### Submission Highlights
- ✅ Complete Solana NFT program with cross-chain capabilities
- ✅ ZetaChain gateway integration
- ✅ Comprehensive documentation and examples
- ✅ Security best practices implementation
- ✅ Open-source codebase with clear setup instructions