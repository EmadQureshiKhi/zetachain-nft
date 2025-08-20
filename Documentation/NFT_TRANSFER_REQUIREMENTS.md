# 🎨 NFT Transfer Requirements

## ❌ Current Issue

You're getting this error when trying to transfer an NFT:
```
SolanaJSONRPCError: failed to get token account balance: Invalid param: could not find account
```

## 🔍 Root Cause

The NFT you're trying to transfer (`55jFgvTkeN2Cuj5C5SxhGmz97TZmL89fywdjCuW7EXqH`) was **not minted through our Universal NFT program**.

### **Why This Matters**
- Cross-chain transfers require an **NFT Origin Account**
- This account tracks the NFT's cross-chain history
- Only NFTs minted through our program have this account
- Regular Solana NFTs (minted through other programs) cannot be transferred

## ✅ Solution

### **Option 1: Mint a New NFT (Recommended)**
1. **Use our minting interface** in the frontend
2. **Or run the test script**:
   ```bash
   node test-cross-chain-transfer.js --mint
   ```
3. **Update your collection** with the new NFT mint address

### **Option 2: Check Your Existing NFTs**
Run this script to see which NFTs you can transfer:
```bash
node check-nft-transferability.js
```

## 🎯 How to Identify Transferable NFTs

### **✅ Transferable NFTs Have:**
- NFT Origin Account (PDA: `nft_origin` + mint address)
- Minted through Universal NFT program
- Cross-chain transfer capability

### **❌ Non-Transferable NFTs:**
- No NFT Origin Account
- Minted through other programs (Metaplex, etc.)
- Cannot be transferred cross-chain

## 🧪 Testing Steps

### **1. Check Current NFTs**
```bash
node check-nft-transferability.js
```

### **2. Mint a Test NFT**
```bash
# This will create a transferable NFT
node test-cross-chain-transfer.js --mint
```

### **3. Update Frontend**
Replace the NFT mint address in your collection with the newly minted one.

### **4. Test Transfer**
Try the cross-chain transfer again with the new NFT.

## 🔧 Technical Details

### **Required Accounts for Cross-Chain Transfer**
```rust
#[account(
    mut,
    seeds = [b"nft_origin", mint.key().as_ref()],
    bump = nft_origin.bump
)]
pub nft_origin: Account<'info, NftOrigin>,
```

### **NFT Origin Account Structure**
- **Token ID**: Unique identifier for cross-chain tracking
- **Current Chain ID**: Where the NFT currently exists
- **Transfer Count**: Number of cross-chain transfers
- **Creation Timestamp**: When the NFT was first minted

## 🎉 Expected Behavior After Fix

### **With Transferable NFT:**
1. ✅ Token account exists and shows balance of 1
2. ✅ NFT origin account exists with tracking data
3. ✅ Cross-chain transfer proceeds successfully
4. ✅ NFT is burned on Solana and minted on destination chain

### **Error Messages You'll See:**
- **Before Fix**: `could not find account`
- **After Fix**: Smooth transfer process with status updates

## 🚀 Next Steps

1. **Run the NFT checker** to see your current situation
2. **Mint a new NFT** through our Universal NFT program
3. **Test the transfer** with the new NFT
4. **Enjoy cross-chain NFT transfers!** 🌟

The Universal NFT program is designed to enable true cross-chain NFT ownership, but it requires NFTs to be minted through our system to track their cross-chain journey properly.