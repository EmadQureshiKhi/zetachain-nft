const { Connection, PublicKey, Keypair, SystemProgram, TransactionInstruction, Transaction } = require("@solana/web3.js");
const fs = require('fs');

async function testProgram() {
  console.log("🧪 Simple Program Test");
  console.log("=====================");

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
    console.log("📋 Program ID:", programId.toString());
    
    // Check if program exists
    const programAccount = await connection.getAccountInfo(programId);
    if (programAccount) {
      console.log("✅ Program account found");
      console.log("   Owner:", programAccount.owner.toString());
      console.log("   Data length:", programAccount.data.length);
      console.log("   Executable:", programAccount.executable);
    } else {
      console.log("❌ Program account not found");
      return;
    }
    
    // Calculate program state PDA
    const [programStatePda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      programId
    );
    
    console.log("📍 Program State PDA:", programStatePda.toString());
    console.log("📍 Bump:", bump);
    
    // Check if program state exists
    const programStateAccount = await connection.getAccountInfo(programStatePda);
    if (programStateAccount) {
      console.log("✅ Program state account exists");
      console.log("   Data length:", programStateAccount.data.length);
      console.log("   Owner:", programStateAccount.owner.toString());
      
      // Try to parse the data (basic parsing)
      if (programStateAccount.data.length >= 89) {
        const data = programStateAccount.data;
        console.log("📊 Program State Data (raw):");
        console.log("   First 8 bytes (discriminator):", Array.from(data.slice(0, 8)));
        console.log("   Authority bytes:", Array.from(data.slice(8, 40)));
        console.log("   Gateway bytes:", Array.from(data.slice(40, 72)));
        
        // Try to parse as PublicKeys
        try {
          const authority = new PublicKey(data.slice(8, 40));
          const gateway = new PublicKey(data.slice(40, 72));
          console.log("   Authority:", authority.toString());
          console.log("   Gateway:", gateway.toString());
        } catch (e) {
          console.log("   Could not parse authority/gateway as PublicKeys");
        }
      }
    } else {
      console.log("ℹ️  Program state account does not exist - program not initialized");
    }
    
    // Check wallet balance
    const balance = await connection.getBalance(walletKeypair.publicKey);
    console.log("💰 Wallet balance:", (balance / 1e9).toFixed(4), "SOL");
    
    console.log("\n✅ Basic program test completed");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("🔍 Full error:", error);
  }
}

testProgram();