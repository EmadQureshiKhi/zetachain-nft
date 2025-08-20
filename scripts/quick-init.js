const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

(async () => {
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

  // Call initialize instruction
  try {
    const txSig = await program.methods
      .initialize()
      .accounts({
        authority: provider.wallet.publicKey,
        programState,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Program initialized!");
    console.log("📝 Transaction signature:", txSig);
  } catch (err) {
    console.error("❌ Initialization failed:", err);
  }
})();
