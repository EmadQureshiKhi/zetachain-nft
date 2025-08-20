const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram, Keypair } = require("@solana/web3.js");
const { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  MINT_SIZE
} = require("@solana/spl-token");

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function testMinting() {
  console.log("🎨 Testing Universal NFT Minting...");
  console.log("===================================");

  try {
    // Set up provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    
    // Load the program
    const programId = new PublicKey("H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC");
    const idl = require("./target/idl/universal_nft.json");
    const program = new anchor.Program(idl, programId, provider);
    
    console.log("✅ Program loaded successfully");
    console.log("📋 Program ID:", programId.toString());
    console.log("💳 Wallet:", provider.wallet.publicKey.toString());
    
    // Check wallet balance
    const balance = await provider.connection.getBalance(provider.wallet.publicKey);
    const solBalance = balance / 1e9;
    console.log("💰 Wallet Balance:", solBalance.toFixed(4), "SOL");
    
    if (solBalance < 0.05) {
      console.log("⚠️  Low balance! You might need more SOL for minting.");
      console.log("💡 Get devnet SOL from: https://faucet.solana.com/");
    }
    
    // Check if program is initialized
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      programId
    );
    
    try {
      const programState = await program.account.programState.fetch(programStatePda);
      console.log("✅ Program is initialized");
      console.log("   Next Token ID:", programState.nextTokenId.toString());
      console.log("   Total Minted:", programState.totalMinted.toString());
    } catch (error) {
      console.log("❌ Program not initialized! Run: node initialize-program.js");
      process.exit(1);
    }
    
    // Test NFT data
    const testNFTs = [
      {
        name: "Universal Test NFT #1",
        symbol: "UNFT",
        uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        description: "A test NFT for Universal cross-chain functionality"
      },
      {
        name: "Cross-Chain Demo #2",
        symbol: "XCHAIN",
        uri: "https://arweave.net/example-metadata.json",
        description: "Demonstrating cross-chain NFT capabilities"
      }
    ];
    
    console.log(`\n🎯 Minting ${testNFTs.length} test NFTs...\n`);
    
    for (let i = 0; i < testNFTs.length; i++) {
      const nftData = testNFTs[i];
      console.log(`\n--- Minting NFT ${i + 1}/${testNFTs.length} ---`);
      console.log("Name:", nftData.name);
      console.log("Symbol:", nftData.symbol);
      console.log("URI:", nftData.uri);
      
      try {
        // Generate new mint keypair
        const mint = Keypair.generate();
        const recipient = provider.wallet.publicKey;
        
        console.log("🔑 Mint address:", mint.publicKey.toString());
        console.log("👤 Recipient:", recipient.toString());
        
        // Calculate PDAs
        const [programStatePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("program_state")],
          programId
        );
        
        const [mintAuthority] = PublicKey.findProgramAddressSync(
          [Buffer.from("mint_authority")],
          programId
        );
        
        const [nftOrigin] = PublicKey.findProgramAddressSync(
          [Buffer.from("nft_origin"), mint.publicKey.toBuffer()],
          programId
        );
        
        const tokenAccount = await getAssociatedTokenAddress(
          mint.publicKey,
          recipient
        );
        
        const [metadataAccount] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
          ],
          METADATA_PROGRAM_ID
        );
        
        const [masterEditionAccount] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
            Buffer.from('edition'),
          ],
          METADATA_PROGRAM_ID
        );
        
        console.log("📍 Calculated accounts:");
        console.log("   Program State:", programStatePda.toString());
        console.log("   Mint Authority:", mintAuthority.toString());
        console.log("   NFT Origin:", nftOrigin.toString());
        console.log("   Token Account:", tokenAccount.toString());
        console.log("   Metadata:", metadataAccount.toString());
        console.log("   Master Edition:", masterEditionAccount.toString());
        
        // Create the mint NFT transaction
        console.log("🔨 Creating mint transaction...");
        
        const tx = await program.methods
          .mintNft(nftData.name, nftData.symbol, nftData.uri, null)
          .accounts({
            programState: programStatePda,
            mint: mint.publicKey,
            tokenAccount: tokenAccount,
            nftOrigin: nftOrigin,
            metadata: metadataAccount,
            masterEdition: masterEditionAccount,
            mintAuthority: mintAuthority,
            payer: provider.wallet.publicKey,
            recipient: recipient,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenMetadataProgram: METADATA_PROGRAM_ID,
          })
          .signers([mint])
          .rpc();
        
        console.log("📝 Transaction signature:", tx);
        
        // Wait for confirmation
        console.log("⏳ Waiting for confirmation...");
        await provider.connection.confirmTransaction(tx, "confirmed");
        
        console.log("✅ NFT minted successfully!");
        console.log("🔗 View on Solana Explorer:");
        console.log(`   Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        console.log(`   Mint: https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`);
        console.log(`   Token Account: https://explorer.solana.com/address/${tokenAccount.toString()}?cluster=devnet`);
        
        // Verify the NFT was created
        try {
          const tokenAccountInfo = await provider.connection.getTokenAccountBalance(tokenAccount);
          console.log("🎯 Token balance:", tokenAccountInfo.value.amount);
          
          const nftOriginInfo = await program.account.nftOrigin.fetch(nftOrigin);
          console.log("📊 NFT Origin Info:");
          console.log("   Token ID:", Array.from(nftOriginInfo.tokenId));
          console.log("   Origin Chain:", nftOriginInfo.originChainId.toString());
          console.log("   Current Chain:", nftOriginInfo.currentChainId.toString());
          console.log("   Transfer Count:", nftOriginInfo.transferCount.toString());
          
        } catch (verifyError) {
          console.log("⚠️  Could not verify NFT details:", verifyError.message);
        }
        
        // Add delay between mints
        if (i < testNFTs.length - 1) {
          console.log("⏳ Waiting 2 seconds before next mint...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (mintError) {
        console.error(`❌ Failed to mint NFT ${i + 1}:`, mintError.message);
        
        if (mintError.message.includes("insufficient funds")) {
          console.log("💡 Solution: Add more SOL to your wallet");
        } else if (mintError.message.includes("already in use")) {
          console.log("💡 Account already exists, this might be a retry");
        }
        
        console.log("🔍 Full error:", mintError);
      }
    }
    
    // Check final program state
    console.log("\n📊 Final Program State:");
    try {
      const finalState = await program.account.programState.fetch(programStatePda);
      console.log("   Next Token ID:", finalState.nextTokenId.toString());
      console.log("   Total Minted:", finalState.totalMinted.toString());
      console.log("   Total Transfers:", finalState.totalTransfers.toString());
      console.log("   Total Receives:", finalState.totalReceives.toString());
    } catch (error) {
      console.log("⚠️  Could not fetch final state:", error.message);
    }
    
    console.log("\n🎉 Minting test completed!");
    console.log("🔗 View your wallet on Solana Explorer:");
    console.log(`   https://explorer.solana.com/address/${provider.wallet.publicKey.toString()}?cluster=devnet`);
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("🔍 Full error:", error);
    process.exit(1);
  }
}

// Run the test
testMinting();