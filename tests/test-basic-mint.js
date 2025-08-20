const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const RPC_URL = 'http://127.0.0.1:8899';
const PROGRAM_ID = new PublicKey('GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s');

async function testBasicMint() {
  console.log('🧪 Testing basic token mint (without Metaplex)...');
  
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Load payer keypair
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
  );
  
  console.log('💰 Payer:', payerKeypair.publicKey.toString());
  
  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  console.log('🎨 Mint:', mintKeypair.publicKey.toString());
  
  // Calculate PDAs
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    PROGRAM_ID
  );
  
  const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('mint_authority')],
    PROGRAM_ID
  );
  
  const recipientTokenAccount = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    payerKeypair.publicKey
  );
  
  console.log('📍 Account addresses:');
  console.log('  Program State:', programStatePda.toString());
  console.log('  Mint Authority:', mintAuthorityPda.toString());
  console.log('  Token Account:', recipientTokenAccount.toString());
  
  // Create a very basic instruction that just mints a token (no metadata)
  // Let's try to create a custom instruction that bypasses Metaplex
  
  const name = 'Basic Token';
  const symbol = 'BASIC';
  const uri = '';
  
  const nameBuffer = Buffer.from(name, 'utf8');
  const symbolBuffer = Buffer.from(symbol, 'utf8');
  const uriBuffer = Buffer.from(uri, 'utf8');
  
  // Use the mint_nft_simple discriminator but with minimal accounts
  const discriminator = Buffer.from('dd6bfa63a7d3dcb4', 'hex');
  
  const instructionData = Buffer.concat([
    discriminator,
    Buffer.from([nameBuffer.length, 0, 0, 0]),
    nameBuffer,
    Buffer.from([symbolBuffer.length, 0, 0, 0]),
    symbolBuffer,
    Buffer.from([uriBuffer.length, 0, 0, 0]),
    uriBuffer,
    Buffer.from([0]), // creators option (None = 0)
  ]);
  
  console.log('📦 Instruction data:');
  console.log('  Length:', instructionData.length);
  console.log('  Discriminator:', discriminator.toString('hex'));
  console.log('  Name:', name);
  console.log('  Symbol:', symbol);
  
  // Create instruction with only the essential accounts (no metadata accounts)
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: programStatePda, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: PublicKey.default, isSigner: false, isWritable: true }, // dummy metadata
      { pubkey: PublicKey.default, isSigner: false, isWritable: true }, // dummy master edition
      { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: payerKeypair.publicKey, isSigner: false, isWritable: false }, // recipient
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: PublicKey.default, isSigner: false, isWritable: false }, // dummy token metadata program
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });
  
  console.log('🔧 Created instruction with', instruction.keys.length, 'accounts');
  
  // Create transaction
  const transaction = new Transaction().add(instruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payerKeypair.publicKey;
  
  // Sign with both keypairs
  transaction.sign(payerKeypair, mintKeypair);
  
  console.log('🔐 Transaction signed');
  
  // Simulate transaction
  console.log('🧪 Simulating transaction...');
  try {
    const simulation = await connection.simulateTransaction(transaction);
    console.log('Simulation result:', simulation.value.err ? 'FAILED' : 'SUCCESS');
    
    if (simulation.value.err) {
      console.error('❌ Simulation error:', simulation.value.err);
      console.error('Logs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
      
      // Check if it's still the Metaplex issue
      const hasMetaplexError = simulation.value.logs?.some(log => 
        log.includes('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s') || 
        log.includes('Program is not deployed')
      );
      
      if (hasMetaplexError) {
        console.log('\n💡 Still hitting Metaplex issues. The program is trying to call Metaplex even with dummy accounts.');
        console.log('   We need to modify the program to make Metaplex calls optional or create a version without them.');
      }
      
      return;
    } else {
      console.log('✅ Simulation successful!');
      console.log('Logs:');
      simulation.value.logs?.forEach(log => console.log('  ', log));
    }
  } catch (simError) {
    console.error('❌ Simulation failed:', simError);
    return;
  }
  
  console.log('🎉 Basic token mint test completed!');
}

testBasicMint().catch(console.error);