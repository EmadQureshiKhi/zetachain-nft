const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function main() {
  // Connect to local validator
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Load wallet
  const walletPath = process.env.HOME + '/.config/solana/id.json';
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
  );
  
  // Create provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(walletKeypair),
    { commitment: 'confirmed' }
  );
  
  // Load IDL
  const idl = JSON.parse(fs.readFileSync('./target/idl/universal_nft.json', 'utf8'));
  
  // Create program
  const programId = new PublicKey('6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2');
  const program = new anchor.Program(idl, programId, provider);
  
  console.log('Program ID:', program.programId.toString());
  
  // Find program state PDA
  const [programState] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    program.programId
  );
  
  console.log('Program State PDA:', programState.toString());
  
  try {
    // Try to initialize
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: walletKeypair.publicKey,
        programState: programState,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log('✅ Initialized! Transaction:', tx);
    
    // Fetch state
    const state = await program.account.programState.fetch(programState);
    console.log('Program State:', state);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);