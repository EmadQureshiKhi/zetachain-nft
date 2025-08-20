const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY, ComputeBudgetProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function testMintNFTSimple() {
  console.log('🧪 Testing NFT mint with mintNftSimple...');
  
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
  
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  
  const [masterEditionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  
  console.log('📍 Account addresses:');
  console.log('  Program State:', programStatePda.toString());
  console.log('  Mint Authority:', mintAuthorityPda.toString());
  console.log('  Token Account:', recipientTokenAccount.toString());
  console.log('  Metadata:', metadataPda.toString());
  console.log('  Master Edition:', masterEditionPda.toString());
  
  // Create instruction data with correct discriminator for mint_nft_simple (snake_case)
  const discriminator = Buffer.from('dd6bfa63a7d3dcb4', 'hex');
  const name = 'Simple NFT';
  const symbol = 'SNFT';
  const uri = 'https://example.com/simple-nft.json';
  
  const nameBuffer = Buffer.from(name, 'utf8');
  const symbolBuffer = Buffer.from(symbol, 'utf8');
  const uriBuffer = Buffer.from(uri, 'utf8');
  
  const instructionData = Buffer.concat([
    discriminator,
    Buffer.from([nameBuffer.length, 0, 0, 0]), // name length (u32 little endian)
    nameBuffer,
    Buffer.from([symbolBuffer.length, 0, 0, 0]), // symbol length (u32 little endian)
    symbolBuffer,
    Buffer.from([uriBuffer.length, 0, 0, 0]), // uri length (u32 little endian)
    uriBuffer,
    Buffer.from([0]), // creators option (None = 0)
  ]);
  
  console.log('📦 Instruction data:');
  console.log('  Length:', instructionData.length);
  console.log('  Discriminator:', discriminator.toString('hex'));
  console.log('  Name:', name, '(length:', nameBuffer.length, ')');
  console.log('  Symbol:', symbol, '(length:', symbolBuffer.length, ')');
  console.log('  URI:', uri, '(length:', uriBuffer.length, ')');
  
  // Create the instruction - using mint_nft_simple (simplified version without nft_origin)
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: programStatePda, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: metadataPda, isSigner: false, isWritable: true },
      { pubkey: masterEditionPda, isSigner: false, isWritable: true },
      { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: payerKeypair.publicKey, isSigner: false, isWritable: false }, // recipient
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });
  
  console.log('🔧 Created instruction with', instruction.keys.length, 'accounts');
  
  // Add compute budget instruction for NFT minting (Metaplex operations need more compute)
  const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 400_000, // Increase compute limit for NFT minting with Metaplex
  });

  // Create transaction
  const transaction = new Transaction()
    .add(computeBudgetIx)
    .add(instruction);
  
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
  
  // Send transaction
  console.log('📤 Sending transaction...');
  try {
    const signature = await connection.sendRawTransaction(transaction.serialize());
    console.log('Transaction signature:', signature);
    
    // Confirm transaction
    console.log('⏳ Confirming transaction...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
    } else {
      console.log('✅ NFT minted successfully!');
      console.log('  Signature:', signature);
      console.log('  Mint:', mintKeypair.publicKey.toString());
      console.log('🔗 View on Solana Explorer:');
      console.log('  Transaction:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      console.log('  NFT Mint:', `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`);
    }
  } catch (sendError) {
    console.error('❌ Failed to send transaction:', sendError);
  }
}

testMintNFTSimple().catch(console.error);