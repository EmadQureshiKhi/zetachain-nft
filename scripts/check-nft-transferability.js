/**
 * 🔍 NFT Transferability Checker
 * =============================
 * 
 * This script checks which NFTs in your wallet can be transferred cross-chain.
 * Only NFTs minted through our Universal NFT program can be transferred.
 * 
 * Usage:
 *   node check-nft-transferability.js
 */

const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s');

// Test NFTs (add your NFT mint addresses here)
const TEST_NFTS = [
  'EG9TdGCFHENpKTz7DBHiorYpQWwa74eArCzki8xKwhjq', // Your current NFT
  '55jFgvTkeN2Cuj5C5SxhGmz97TZmL89fywdjCuW7EXqH', // Another NFT
  // Add more NFT mint addresses here
];

async function checkNFTTransferability() {
  console.log('🔍 Checking NFT Transferability...');
  console.log('===================================');
  
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Load payer keypair
  const payerKeypair = require('@solana/web3.js').Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
  );
  
  console.log('💰 Wallet:', payerKeypair.publicKey.toString());
  console.log('');
  
  for (const mintAddress of TEST_NFTS) {
    console.log(`🎨 Checking NFT: ${mintAddress}`);
    
    try {
      const mint = new PublicKey(mintAddress);
      
      // Check if we own this NFT
      const tokenAccount = getAssociatedTokenAddressSync(mint, payerKeypair.publicKey);
      
      let ownsNFT = false;
      try {
        const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
        ownsNFT = tokenAccountInfo.value.uiAmount === 1;
      } catch (error) {
        console.log('  ❌ Not owned by this wallet');
        continue;
      }
      
      if (!ownsNFT) {
        console.log('  ❌ Not owned by this wallet');
        continue;
      }
      
      console.log('  ✅ Owned by this wallet');
      
      // Check if NFT origin account exists
      const [nftOriginPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_origin'), mint.toBuffer()],
        PROGRAM_ID
      );
      
      const nftOriginInfo = await connection.getAccountInfo(nftOriginPda);
      
      if (nftOriginInfo) {
        console.log('  ✅ TRANSFERABLE - Has NFT origin account');
        console.log('  📍 Origin PDA:', nftOriginPda.toString());
        console.log('  🌉 Can be transferred cross-chain');
      } else {
        console.log('  ❌ NOT TRANSFERABLE - Missing NFT origin account');
        console.log('  💡 This NFT was not minted through our Universal NFT program');
        console.log('  💡 Only NFTs minted through our program can be transferred');
      }
      
    } catch (error) {
      console.log('  ❌ Error checking NFT:', error.message);
    }
    
    console.log('');
  }
  
  console.log('🎯 Summary:');
  console.log('===========');
  console.log('✅ Transferable NFTs: Minted through Universal NFT program');
  console.log('❌ Non-transferable NFTs: Minted through other programs');
  console.log('');
  console.log('💡 To mint a transferable NFT:');
  console.log('   1. Use our Universal NFT minting interface');
  console.log('   2. Or run: node test-cross-chain-transfer.js --mint');
  console.log('   3. Then update your NFT collection with the new mint address');
}

checkNFTTransferability().catch(console.error);