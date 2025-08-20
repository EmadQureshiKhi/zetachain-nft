const { 
  Connection, 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  TransactionInstruction, 
  Transaction,
  sendAndConfirmTransaction
} = require("@solana/web3.js");
const fs = require('fs');

async function rawInitialize() {
  console.log("🚀 Raw Initialize Universal NFT Program");
  console.log("=======================================");

  try {
    // Set up connection
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load wallet
    const walletPath = "~/.config/solana/id.json".replace('~', require('os').homedir());
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletData));
    
    console.log("💳 Wallet:", walletKeypair.publicKey.toString());
    
    // Program ID
    const programId = new PublicKey("H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC");
    const gatewayId = new PublicKey("ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis");
    
    console.log("📋 Program ID:", programId.toString());
    console.log("🌉 Gateway ID:", gatewayId.toString());
    
    // Calculate program state PDA
    const [programStatePda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      programId
    );
    
    console.log("📍 Program State PDA:", programStatePda.toString());
    console.log("📍 Bump:", bump);
    
    // Check if already initialized
    const existingAccount = await connection.getAccountInfo(programStatePda);
    if (existingAccount) {
      console.log("ℹ️  Program already initialized!");
      return;
    }
    
    // Create initialize instruction
    // The discriminator for "initialize" is the first 8 bytes of sha256("global:initialize")
    const crypto = require('crypto');
    const discriminator = crypto.createHash('sha256')
      .update('global:initialize')
      .digest()
      .slice(0, 8);
    
    console.log("🔧 Instruction discriminator:", discriminator.toString('hex'));
    
    const initializeIx = new TransactionInstruction({
      keys: [
        { pubkey: programStatePda, isSigner: false, isWritable: true },
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: gatewayId, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: programId,
      data: discriminator, // Just the discriminator, no additional data needed
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(initializeIx);
    
    console.log("📝 Sending initialize transaction...");
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log("✅ Transaction confirmed!");
    console.log("📝 Signature:", signature);
    
    // Verify initialization
    const programStateAccount = await connection.getAccountInfo(programStatePda);
    if (programStateAccount) {
      console.log("✅ Program state account created!");
      console.log("   Data length:", programStateAccount.data.length);
      console.log("   Owner:", programStateAccount.owner.toString());
      
      // Try to parse the basic data
      if (programStateAccount.data.length >= 72) {
        const data = programStateAccount.data;
        try {
          const authority = new PublicKey(data.slice(8, 40));
          const gateway = new PublicKey(data.slice(40, 72));
          console.log("📊 Parsed Program State:");
          console.log("   Authority:", authority.toString());
          console.log("   Gateway:", gateway.toString());
        } catch (e) {
          console.log("⚠️  Could not parse program state data");
        }
      }
    }
    
    console.log("\n🎉 Program initialized successfully!");
    console.log("🔗 View transaction:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("🔗 View program:", `https://explorer.solana.com/address/${programId.toString()}?cluster=devnet`);
    
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Add more SOL to your wallet");
    } else if (error.message.includes("already in use")) {
      console.log("\n💡 Program may already be initialized");
    } else {
      console.log("\n🔍 Full error:", error);
      
      // If it's a program error, try to decode it
      if (error.logs) {
        console.log("📋 Program logs:");
        error.logs.forEach(log => console.log("   ", log));
      }
    }
  }
}

rawInitialize();