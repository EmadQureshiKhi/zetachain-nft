const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

async function initializeProgram() {
  console.log('🚀 Initializing Universal NFT Program...');
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load wallet
  const walletPath = process.env.HOME + '/.config/solana/id.json';
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
  );
  
  // Program ID
  const programId = new PublicKey('6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2');
  
  // Create provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(walletKeypair),
    { commitment: 'confirmed' }
  );
  
  console.log('👤 Authority:', walletKeypair.publicKey.toString());
  console.log('🏛️ Program ID:', programId.toString());
  
  try {
    // Load IDL
    const idl = JSON.parse(fs.readFileSync('./target/idl/universal_nft.json', 'utf8'));
    
    // Create program instance
    const program = new anchor.Program(idl, programId, provider);
    
    // Find program state PDA
    const [programState] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      programId
    );
    
    console.log('📍 Program State PDA:', programState.toString());
    
    // Check if already initialized
    try {
      const stateAccount = await connection.getAccountInfo(programState);
      if (stateAccount && stateAccount.data.length > 0) {
        console.log('✅ Program already initialized!');
        
        // Try to fetch the state
        try {
          const state = await program.account.programState.fetch(programState);
          console.log('🎉 Program State:', {
            authority: state.authority.toString(),
            gateway: state.gateway.toString(),
            nextTokenId: state.nextTokenId.toString(),
            totalMinted: state.totalMinted.toString(),
          });
        } catch (fetchError) {
          console.log('⚠️ Could not parse state data, but account exists');
        }
        return;
      }
    } catch (error) {
      console.log('🔍 Program state not found, initializing...');
    }
    
    // Initialize the program
    console.log('⚡ Sending initialization transaction...');
    
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: walletKeypair.publicKey,
        programState: programState,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log('✅ Program initialized successfully!');
    console.log('📝 Transaction signature:', tx);
    
    // Verify initialization
    const state = await program.account.programState.fetch(programState);
    console.log('🎉 Program State:', {
      authority: state.authority.toString(),
      gateway: state.gateway.toString(),
      nextTokenId: state.nextTokenId.toString(),
      totalMinted: state.totalMinted.toString(),
    });
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    
    // Try a simpler approach if Anchor fails
    console.log('🔄 Trying alternative initialization...');
    
    const [programState] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      programId
    );
    
    // Create a basic initialize instruction
    const initData = Buffer.alloc(8);
    initData.writeUInt8(0, 0); // Initialize discriminator
    
    const instruction = {
      programId: programId,
      keys: [
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: programState, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: initData,
    };
    
    const transaction = new anchor.web3.Transaction().add(instruction);
    
    try {
      const signature = await connection.sendTransaction(transaction, [walletKeypair]);
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Alternative initialization successful!');
      console.log('📝 Transaction signature:', signature);
    } catch (altError) {
      console.error('❌ Alternative initialization also failed:', altError.message);
    }
  }
}

initializeProgram()
  .then(() => {
    console.log('🎯 Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Initialization error:', error);
    process.exit(1);
  });