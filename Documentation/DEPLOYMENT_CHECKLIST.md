# Universal NFT Program Deployment Checklist

## Current Status
- ✅ Program built successfully with new program ID
- ✅ New program keypair generated: `GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s`
- ✅ Anchor.toml updated with new program ID
- ✅ Frontend config updated with new program ID
- ✅ Test scripts updated with new program ID
- ⏳ **WAITING FOR SOL**: Need ~4.18 SOL for deployment (currently have ~2.13 SOL)

## Next Steps (Once you have enough SOL)

### 1. Deploy the Program
```bash
anchor deploy --provider.cluster devnet
```

### 2. Initialize the Program
```bash
node simple-initialize.js
```

### 3. Test NFT Minting
```bash
node test-mint-simple.js
```

## Program Details
- **New Program ID**: `GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s`
- **Program State PDA**: Will be calculated after deployment
- **Available Instructions**:
  - `initialize` - Initialize the program
  - `mintNft` - Full NFT minting with origin tracking
  - `mintNftSimple` - Simplified NFT minting (for testing)
  - `transferCrossChain` - Cross-chain transfers
  - `receiveCrossChain` - Receive from other chains
  - `onCall` - ZetaChain gateway callback
  - `onRevert` - ZetaChain revert callback
  - `updateGateway` - Update gateway address

## Discriminators (Generated)
- `initialize`: `afaf6d1f0d989bed`
- `mintNft`: `ec737ad5f7d3f325`
- `mintNftSimple`: `45fc84e2cfba603c`

## Files Updated
- ✅ `Anchor.toml` - Program ID updated
- ✅ `frontend/src/lib/config.ts` - Program ID updated
- ✅ `test-mint-simple.js` - Program ID updated
- ✅ `simple-initialize.js` - Program ID updated (needs update)

## Post-Deployment Tasks
1. Update program state PDA in config files
2. Test all instructions
3. Update frontend service discriminators if needed
4. Deploy frontend with new program ID

## Troubleshooting
If you get "InstructionFallbackNotFound" errors after deployment:
1. Verify the program deployed successfully
2. Check that discriminators match the deployed program
3. Ensure all account structures match the IDL