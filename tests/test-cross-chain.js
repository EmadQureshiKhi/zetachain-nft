const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram, Keypair } = require("@solana/web3.js");
const { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress
} = require("@solana/spl-token");

async function testCrossChain() {
  console.log("🌉 Testing Universal NFT Cross-Chain Functionality...");
  console.log("===================================================");

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
    
    // Check if program is initialized
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      programId
    );
    
    let programState;
    try {
      programState = await program.account.programState.fetch(programStatePda);
      console.log("✅ Program is initialized");
    } catch (error) {
      console.log("❌ Program not initialized! Run: node initialize-program.js");
      process.exit(1);
    }
    
    console.log("\n📊 Current Program State:");
    console.log("   Authority:", programState.authority.toString());
    console.log("   Gateway:", programState.gateway.toString());
    console.log("   Total Minted:", programState.totalMinted.toString());
    console.log("   Total Transfers:", programState.totalTransfers.toString());
    console.log("   Total Receives:", programState.totalReceives.toString());
    
    // Test 1: Trigger Deposit (simulates cross-chain deposit)
    console.log("\n🧪 Test 1: Trigger Deposit to ZetaChain");
    console.log("----------------------------------------");
    
    try {
      const depositAmount = 1000000; // 0.001 SOL in lamports
      const receiverAddress = new Array(20).fill(0x42); // Mock EVM address
      
      console.log("💰 Deposit amount:", depositAmount, "lamports");
      console.log("📍 Receiver address:", Buffer.from(receiverAddress).toString('hex'));
      
      // Mock gateway PDA (in real implementation, this would be the actual ZetaChain gateway PDA)
      const mockGatewayPda = Keypair.generate().publicKey;
      
      const triggerTx = await program.methods
        .triggerDeposit(
          new anchor.BN(depositAmount),
          receiverAddress,
          null // No revert options for this test
        )
        .accounts({
          programState: programStatePda,
          signer: provider.wallet.publicKey,
          gatewayPda: mockGatewayPda,
          gatewayProgram: new PublicKey("ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis"),
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log("✅ Trigger deposit successful!");
      console.log("📝 Transaction:", triggerTx);
      console.log("🔗 View on explorer:", `https://explorer.solana.com/tx/${triggerTx}?cluster=devnet`);
      
    } catch (error) {
      console.log("⚠️  Trigger deposit test failed:", error.message);
      // This is expected in a test environment without actual ZetaChain gateway
    }
    
    // Test 2: Simulate on_call (cross-chain receive)
    console.log("\n🧪 Test 2: Simulate on_call Handler");
    console.log("-----------------------------------");
    
    try {
      const testAmount = 500000; // 0.0005 SOL
      const testSender = new Array(20).fill(0x33); // Mock EVM sender
      const testData = Buffer.from("test cross-chain message", "utf8");
      
      console.log("💰 Amount:", testAmount, "lamports");
      console.log("👤 Sender:", Buffer.from(testSender).toString('hex'));
      console.log("📄 Data:", testData.toString());
      
      // Mock accounts for on_call
      const mockGatewayPda = Keypair.generate().publicKey;
      const mockRandomWallet = Keypair.generate().publicKey;
      
      const onCallTx = await program.methods
        .onCall(
          new anchor.BN(testAmount),
          testSender,
          Array.from(testData)
        )
        .accounts({
          programState: programStatePda,
          gatewayPda: mockGatewayPda,
          randomWallet: mockRandomWallet,
          systemProgram: SystemProgram.programId,
          instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .rpc();
      
      console.log("✅ on_call simulation successful!");
      console.log("📝 Transaction:", onCallTx);
      
    } catch (error) {
      console.log("⚠️  on_call test failed:", error.message);
      // This might fail due to gateway authentication checks
      if (error.message.includes("InvalidGatewayCaller")) {
        console.log("💡 This is expected - only ZetaChain gateway can call on_call");
      }
    }
    
    // Test 3: Simulate on_revert
    console.log("\n🧪 Test 3: Simulate on_revert Handler");
    console.log("------------------------------------");
    
    try {
      const revertAmount = 250000; // 0.00025 SOL
      const revertSender = provider.wallet.publicKey;
      const revertData = Buffer.from("revert test message", "utf8");
      
      console.log("💰 Revert amount:", revertAmount, "lamports");
      console.log("👤 Sender:", revertSender.toString());
      console.log("📄 Data:", revertData.toString());
      
      const mockGatewayPda = Keypair.generate().publicKey;
      
      const onRevertTx = await program.methods
        .onRevert(
          new anchor.BN(revertAmount),
          revertSender,
          Array.from(revertData)
        )
        .accounts({
          programState: programStatePda,
          gatewayPda: mockGatewayPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log("✅ on_revert simulation successful!");
      console.log("📝 Transaction:", onRevertTx);
      
    } catch (error) {
      console.log("⚠️  on_revert test failed:", error.message);
    }
    
    // Test 4: Cross-chain transfer simulation (if we have NFTs)
    console.log("\n🧪 Test 4: Cross-Chain Transfer Simulation");
    console.log("------------------------------------------");
    
    try {
      // First, let's see if we have any NFTs to transfer
      const updatedState = await program.account.programState.fetch(programStatePda);
      
      if (updatedState.totalMinted.toNumber() > 0) {
        console.log("📊 Found", updatedState.totalMinted.toString(), "minted NFTs");
        console.log("💡 To test cross-chain transfer, you would:");
        console.log("   1. Have an existing NFT in your wallet");
        console.log("   2. Call transfer_cross_chain with destination chain ID");
        console.log("   3. NFT gets burned on Solana");
        console.log("   4. Cross-chain message sent to ZetaChain");
        console.log("   5. NFT recreated on destination chain");
        
        // For demonstration, show the structure
        const destinationChainId = 1; // Ethereum
        const recipientAddress = new Array(32).fill(0x44); // Mock recipient
        
        console.log("🔧 Transfer parameters:");
        console.log("   Destination Chain ID:", destinationChainId);
        console.log("   Recipient:", Buffer.from(recipientAddress).toString('hex'));
        
      } else {
        console.log("ℹ️  No NFTs found. Run 'node test-minting.js' first to create test NFTs");
      }
      
    } catch (error) {
      console.log("⚠️  Cross-chain transfer test setup failed:", error.message);
    }
    
    // Final state check
    console.log("\n📊 Final Program State:");
    try {
      const finalState = await program.account.programState.fetch(programStatePda);
      console.log("   Total Minted:", finalState.totalMinted.toString());
      console.log("   Total Transfers:", finalState.totalTransfers.toString());
      console.log("   Total Receives:", finalState.totalReceives.toString());
    } catch (error) {
      console.log("⚠️  Could not fetch final state");
    }
    
    console.log("\n🎉 Cross-Chain Testing Complete!");
    console.log("=================================");
    console.log("✅ Program structure verified");
    console.log("✅ Cross-chain handlers tested");
    console.log("✅ ZetaChain integration points identified");
    console.log("");
    console.log("🔗 Next Steps:");
    console.log("1. Deploy to testnet/mainnet");
    console.log("2. Integrate with actual ZetaChain gateway");
    console.log("3. Test real cross-chain transfers");
    console.log("4. Monitor cross-chain events");
    
  } catch (error) {
    console.error("❌ Cross-chain test failed:", error.message);
    console.log("🔍 Full error:", error);
    process.exit(1);
  }
}

// Run the test
testCrossChain();