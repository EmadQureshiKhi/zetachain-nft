# 🌉 ZetaChain Integration Guide

## Overview

This guide explains how to integrate your Universal NFT Solana program with ZetaChain's universal interoperability protocol for seamless cross-chain NFT transfers.

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────┐
│   Solana    │    │  ZetaChain   │    │  Universal App  │    │ EVM Chains  │
│   Program   │◄──►│   Gateway    │◄──►│   (ZetaChain)   │◄──►│ (ETH, BSC)  │
└─────────────┘    └──────────────┘    └─────────────────┘    └─────────────┘
```

## Key Components

### 1. Solana Universal NFT Program
- **Location**: `programs/universal-nft/`
- **Purpose**: Handle NFT minting, burning, and cross-chain messaging on Solana
- **Key Features**:
  - Universal token ID generation
  - Cross-chain transfer initiation
  - ZetaChain gateway integration
  - Revert handling for failed transfers

### 2. ZetaChain Universal App Contract
- **Location**: `contracts/UniversalNFTContract.sol`
- **Purpose**: Handle NFT operations on ZetaChain and route to other EVM chains
- **Key Features**:
  - ERC721 NFT minting and burning
  - Cross-chain message processing
  - Universal token ID mapping
  - Revert handling and recovery

### 3. Frontend Integration
- **Location**: `frontend/src/`
- **Purpose**: User interface for cross-chain NFT operations
- **Key Features**:
  - NFT minting interface
  - Cross-chain transfer UI
  - Transaction status tracking
  - Multi-chain wallet support

## Integration Steps

### Step 1: Deploy ZetaChain Universal App

1. **Install Dependencies**
```bash
npm install @zetachain/protocol-contracts
npm install @openzeppelin/contracts
```

2. **Deploy to ZetaChain Testnet**
```bash
# Using Hardhat
npx hardhat deploy --network zeta_testnet --tags UniversalNFT

# Or using Foundry
forge create contracts/UniversalNFTContract.sol:UniversalNFTContract \
  --rpc-url https://zetachain-athens-evm.blockpi.network/v1/rpc/public \
  --private-key $PRIVATE_KEY \
  --constructor-args $GATEWAY_ADDRESS "Universal NFT" "UNFT"
```

3. **Verify Contract**
```bash
npx hardhat verify --network zeta_testnet $CONTRACT_ADDRESS $GATEWAY_ADDRESS "Universal NFT" "UNFT"
```

### Step 2: Configure Solana Program

1. **Update Gateway Address**
```rust
// In programs/universal-nft/src/lib.rs
pub const ZETACHAIN_GATEWAY_ID: Pubkey = solana_program::pubkey!("ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis");
```

2. **Test Gateway Integration**
```bash
node test-cross-chain-integration.js
```

### Step 3: Frontend Configuration

1. **Update Configuration**
```typescript
// In frontend/src/lib/config.ts
export const ZETACHAIN_CONFIG = {
  testnet: {
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    universalAppAddress: '0x...' // Your deployed contract address
  }
};
```

2. **Add ZetaChain Wallet Support**
```typescript
// Add MetaMask support for ZetaChain
const addZetaChainNetwork = async () => {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0x1B59', // 7001 in hex
      chainName: 'ZetaChain Athens Testnet',
      rpcUrls: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'],
      nativeCurrency: {
        name: 'ZETA',
        symbol: 'ZETA',
        decimals: 18
      },
      blockExplorerUrls: ['https://zetachain-athens.blockscout.com/']
    }]
  });
};
```

## Cross-Chain Flow

### Solana → Other Chains

1. **User initiates transfer on Solana**
   ```typescript
   await service.transferCrossChain(
     wallet,
     nftMint,
     1, // Ethereum
     recipientAddress
   );
   ```

2. **Solana program burns NFT and calls ZetaChain gateway**
   ```rust
   // Burn NFT on Solana
   token::burn(burn_ctx, 1)?;
   
   // Call ZetaChain gateway
   invoke(&gateway_instruction, accounts)?;
   ```

3. **ZetaChain gateway processes message**
   - Validates cross-chain message
   - Routes to Universal App contract
   - Calls `onCall` function

4. **Universal App mints NFT on ZetaChain**
   ```solidity
   function onCall(
       MessageContext calldata context,
       address zrc20,
       uint256 amount,
       bytes calldata message
   ) external override onlyGateway {
       // Decode NFT message
       CrossChainNFTMessage memory nftMessage = abi.decode(message, (CrossChainNFTMessage));
       
       // Mint NFT on ZetaChain
       _safeMint(nftMessage.recipient, newTokenId);
   }
   ```

5. **User transfers to final destination**
   ```solidity
   function transferToChain(
       uint256 tokenId,
       address zrc20,
       uint64 destinationChainId,
       address recipient,
       uint256 gasLimit
   ) external payable {
       // Burn on ZetaChain
       _burn(tokenId);
       
       // Call gateway to destination chain
       gateway.withdrawAndCall(...);
   }
   ```

### Other Chains → Solana

1. **NFT burned on source EVM chain**
2. **ZetaChain Universal App receives message**
3. **Universal App calls Solana gateway**
4. **Solana program receives via `on_call`**
5. **NFT minted on Solana**

## Message Formats

### Cross-Chain NFT Message
```rust
pub struct CrossChainMessage {
    pub message_type: CrossChainMessageType,
    pub token_id: [u8; 32],
    pub source_chain_id: u64,
    pub destination_chain_id: u64,
    pub sender: [u8; 20],
    pub recipient: [u8; 32],
    pub metadata: NftMetadata,
    pub timestamp: i64,
}
```

### Solidity Message Format
```solidity
struct CrossChainNFTMessage {
    bytes32 universalTokenId;
    uint64 sourceChainId;
    uint64 destinationChainId;
    address recipient;
    string name;
    string symbol;
    string metadataURI;
    uint256 timestamp;
}
```

## Error Handling & Reverts

### Revert Scenarios
1. **Destination chain unavailable**
2. **Insufficient gas for execution**
3. **Invalid recipient address**
4. **Contract execution failure**

### Revert Handling
```rust
pub fn on_revert(
    ctx: Context<OnRevert>,
    amount: u64,
    sender: Pubkey,
    data: Vec<u8>,
) -> Result<()> {
    // Parse revert data
    let revert_message = parse_revert_message(&data)?;
    
    // Re-mint NFT if transfer failed
    if revert_message.contains("NFT_TRANSFER_REVERT") {
        // Extract token ID and re-mint
        let token_id = extract_token_id(&revert_message)?;
        remint_nft(ctx, token_id, sender)?;
    }
    
    Ok(())
}
```

## Testing

### Unit Tests
```bash
# Test Solana program
anchor test

# Test ZetaChain contract
npx hardhat test

# Test cross-chain integration
node test-cross-chain-integration.js
```

### Integration Tests
```bash
# Test on testnets
npm run test:integration

# Test specific chains
npm run test:ethereum
npm run test:bnb
npm run test:polygon
```

## Monitoring & Analytics

### Event Tracking
```solidity
event NFTReceivedFromChain(
    bytes32 indexed universalTokenId,
    uint64 indexed sourceChainId,
    address indexed recipient,
    uint256 localTokenId,
    string metadataURI
);

event NFTSentToChain(
    bytes32 indexed universalTokenId,
    uint64 indexed destinationChainId,
    address indexed sender,
    uint256 localTokenId
);
```

### Metrics to Track
- Cross-chain transfer success rate
- Average transfer time
- Gas costs per chain
- Revert frequency
- User adoption by chain

## Security Considerations

### Access Control
- Only authorized gateways can call cross-chain functions
- Proper signature verification for all operations
- Rate limiting for high-value transfers

### Validation
- Universal token ID uniqueness
- Metadata integrity across chains
- Recipient address validation
- Chain ID verification

### Recovery Mechanisms
- Revert handling for failed transfers
- Emergency pause functionality
- Admin recovery for stuck assets

## Production Deployment

### Mainnet Deployment Checklist
- [ ] Security audit completed
- [ ] All tests passing
- [ ] Gas optimization verified
- [ ] Monitoring systems in place
- [ ] Emergency procedures documented
- [ ] User documentation complete

### Deployment Commands
```bash
# Deploy to mainnet
anchor deploy --provider.cluster mainnet

# Deploy ZetaChain contract
forge create --rpc-url https://zetachain-evm.blockpi.network/v1/rpc/public \
  --private-key $MAINNET_PRIVATE_KEY \
  contracts/UniversalNFTContract.sol:UniversalNFTContract

# Update frontend config
npm run build:mainnet
```

## Support & Resources

### Documentation
- [ZetaChain Docs](https://www.zetachain.com/docs/)
- [Solana Docs](https://docs.solana.com/)
- [Universal Apps Guide](https://www.zetachain.com/docs/developers/apps/universal/)

### Community
- [ZetaChain Discord](https://discord.gg/zetachain)
- [Solana Discord](https://discord.gg/solana)
- [GitHub Issues](https://github.com/your-repo/issues)

### Support Channels
- Technical support: support@universalnft.io
- Community forum: https://forum.universalnft.io
- Bug reports: https://github.com/your-repo/issues

---

**🚀 Your Universal NFT system is now ready for cross-chain operations with ZetaChain!**