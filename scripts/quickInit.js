require('dotenv').config();
const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;

(async () => {
  try {
    console.log('⚡ Quick Universal NFT Program Initialization');
    console.log('============================================\n');

    // Load environment provider (ANCHOR_PROVIDER_URL + wallet keypair)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // Load program from IDL + Program ID
    const idl = require("./target/idl/universal_nft.json");
    const programId = new anchor.web3.PublicKey(
      "6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2"
    );
    const program = new anchor.Program(idl, programId, provider);

    // Derive PDA for program state
    const [programState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );

    console.log("👤 Authority:", provider.wallet.publicKey.toBase58());
    console.log("🏛️ Program ID:", program.programId.toBase58());
    console.log("📍 Program State PDA:", programState.toBase58());

    // Check if already initialized
    try {
      const stateAccount = await provider.connection.getAccountInfo(programState);
      if (stateAccount && stateAccount.data.length > 0) {
        console.log("✅ Program already initialized!");
        console.log("📊 State account data length:", stateAccount.data.length);
        
        // Try to fetch the state
        try {
          const state = await program.account.programState.fetch(programState);
          console.log("🎉 Program State:", {
            authority: state.authority.toString(),
            gateway: state.gateway.toString(),
            nextTokenId: state.nextTokenId.toString(),
            totalMinted: state.totalMinted.toString(),
          });
        } catch (fetchError) {
          console.log("⚠️ Could not parse state data, but account exists");
        }
        return;
      }
    } catch (error) {
      console.log("🔍 Program state not found, proceeding with initialization...");
    }

    console.log("🚀 Initializing Universal NFT Program...");

    // Use a placeholder gateway address (can be updated later)
    const gateway = new anchor.web3.PublicKey("11111111111111111111111111111112"); // System program as placeholder

    console.log("🌉 Gateway:", gateway.toString());

    // Call initialize instruction
    const txSig = await program.methods
      .initialize()
      .accounts({
        authority: provider.wallet.publicKey,
        programState,
        gateway: gateway,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Program initialized successfully!");
    console.log("📝 Transaction signature:", txSig);
    console.log("🔗 View on Explorer:", `https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

    // Verify initialization
    const state = await program.account.programState.fetch(programState);
    console.log("🎉 Program State:", {
      authority: state.authority.toString(),
      gateway: state.gateway.toString(),
      nextTokenId: state.nextTokenId.toString(),
      totalMinted: state.totalMinted.toString(),
    });

    console.log("\n🎯 Success! Your Universal NFT program is now initialized!");
    console.log("✅ Frontend will now use the actual program instead of demo mode");
    console.log("✅ Ready for full Universal NFT minting!");

  } catch (err) {
    console.error("❌ Initialization failed:", err);
    console.log("\n💡 Troubleshooting:");
    console.log("- Make sure you have SOL in your devnet wallet");
    console.log("- Check that the .env file has correct paths");
    console.log("- Verify the program is deployed: solana program show 6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2 --url devnet");
    console.log("\n🎭 Don't worry - demo mode still works perfectly for your hackathon!");
  }
})();