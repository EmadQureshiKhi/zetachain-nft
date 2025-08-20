const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s');

async function initializeProgram() {
  console.log('🚀 Initializing Universal NFT Program (Simple)...');
  
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Load payer keypair
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
  );
  
  console.log('💰 Payer:', payerKeypair.publicKey.toString());
  
  // Calculate program state PDA
  const [programStatePda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    PROGRAM_ID
  );
  
  console.log('📍 Program State PDA:', programStatePda.toString());
  console.log('📍 Bump:', bump);
  
  // Check if already initialized
  try {
    const accountInfo = await connection.getAccountInfo(programStatePda);
    if (accountInfo) {
      console.log('ℹ️  Program already initialized!');
      console.log('   Account data length:', accountInfo.data.length);
      return;
    }
  } catch (error) {
    console.log('ℹ️  Program not yet initialized, proceeding...');
  }
  
  // ZetaChain Gateway Program ID
  const gatewayId = new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis');
  
  console.log('🔧 Initializing with:');
  console.log('   Authority:', payerKeypair.publicKey.toString());
  console.log('   Gateway:', gatewayId.toString());
  
  // Create initialize instruction discriminator
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]); // initialize discriminator
  
  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: programStatePda, isSigner: false, isWritable: true },
      { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: gatewayId, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: discriminator,
  });
  
  // Create transaction
  const transaction = new Transaction().add(instruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payerKeypair.publicKey;
  
  // Sign transaction
  transaction.sign(payerKeypair);
  
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
      console.log('✅ Program initialized successfully!');
      console.log('  Signature:', signature);
      console.log('  Program State PDA:', programStatePda.toString());
      
      // Verify initialization
      const accountInfo = await connection.getAccountInfo(programStatePda);
      if (accountInfo) {
        console.log('📊 Program state account created:');
        console.log('   Data length:', accountInfo.data.length);
        console.log('   Owner:', accountInfo.owner.toString());
      }
    }
  } catch (sendError) {
    console.error('❌ Failed to send transaction:', sendError);
  }
}

initializeProgram().catch(console.error);