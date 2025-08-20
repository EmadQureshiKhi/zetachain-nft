const { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  ComputeBudgetProgram,
  SYSVAR_RENT_PUBKEY
} = require('@solana/web3.js');
const { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress 
} = require('@solana/spl-token');
const fs = require('fs');
const crypto = require('crypto');

async function testMintSimulation() {
  console.log('🧪 Testing Mint NFT Simulation');
  console.log('==============================');

  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load wallet
    const walletPath = "~/.config/solana/id.json".replace('~', require('os').homedir());
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const payer = Keypair.fromSecretKey(new Uint8Array(walletData));
    
    console.log('💳 Payer:', payer.publicKey.toString());
    
    // Program setup
    const programId = new PublicKey('H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC');
    const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    
    // Generate mint
    const mint = Keypair.generate();
    const recipient = payer.publicKey;
    
    console.log('🔑 Mint:', mint.publicKey.toString());
    console.log('👤 Recipient:', recipient.toString());
    
    // Calculate PDAs
    const [programStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      programId
    );
    
    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_authority')],
      programId
    );
    
    const [nftOrigin] = PublicKey.findProgramAddressSync(
      [Buffer.from('nft_origin'), mint.publicKey.toBuffer()],
      programId
    );
    
    const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, recipient);
    
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgramId.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      metadataProgramId
    );
    
    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgramId.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from('edition'),
      ],
      metadataProgramId
    );
    
    console.log('\n📍 Calculated Accounts:');
    console.log('Program State:', programStatePDA.toString());
    console.log('Mint Authority:', mintAuthority.toString());
    console.log('NFT Origin:', nftOrigin.toString());
    console.log('Token Account:', tokenAccount.toString());
    console.log('Metadata:', metadataAccount.toString());
    console.log('Master Edition:', masterEditionAccount.toString());
    
    // Create instruction data
    function getInstructionDiscriminator(instruction) {
      const preimage = `global:${instruction}`;
      return crypto.createHash('sha256').update(preimage).digest().slice(0, 8);
    }
    
    const discriminator = getInstructionDiscriminator('mint_nft');
    console.log('\n🔧 Discriminator:', discriminator.toString('hex'));
    
    // Create instruction data (simplified)
    const name = 'Test NFT';
    const symbol = 'TEST';
    const uri = 'https://example.com/test.json';
    
    const nameBuffer = Buffer.from(name, 'utf8');
    const symbolBuffer = Buffer.from(symbol, 'utf8');
    const uriBuffer = Buffer.from(uri, 'utf8');
    
    const totalSize = 8 + 4 + nameBuffer.length + 4 + symbolBuffer.length + 4 + uriBuffer.length + 1;
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Write discriminator
    discriminator.copy(data, offset);
    offset += 8;
    
    // Write name
    data.writeUInt32LE(nameBuffer.length, offset);
    offset += 4;
    nameBuffer.copy(data, offset);
    offset += nameBuffer.length;
    
    // Write symbol
    data.writeUInt32LE(symbolBuffer.length, offset);
    offset += 4;
    symbolBuffer.copy(data, offset);
    offset += symbolBuffer.length;
    
    // Write URI
    data.writeUInt32LE(uriBuffer.length, offset);
    offset += 4;
    uriBuffer.copy(data, offset);
    offset += uriBuffer.length;
    
    // Write creators (None = 0)
    data.writeUInt8(0, offset);
    
    console.log('📦 Instruction data size:', data.length);
    
    // Create instruction
    const mintNFTIx = new TransactionInstruction({
      keys: [
        { pubkey: programStatePDA, isSigner: false, isWritable: true },
        { pubkey: mint.publicKey, isSigner: true, isWritable: true },
        { pubkey: tokenAccount, isSigner: false, isWritable: true },
        { pubkey: nftOrigin, isSigner: false, isWritable: true },
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: masterEditionAccount, isSigner: false, isWritable: true },
        { pubkey: mintAuthority, isSigner: false, isWritable: false },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: metadataProgramId, isSigner: false, isWritable: false },
      ],
      programId: programId,
      data: data,
    });
    
    // Add compute budget
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });
    
    // Create transaction
    const transaction = new Transaction()
      .add(computeBudgetIx)
      .add(mintNFTIx);
    
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mint);
    
    console.log('\n🔍 Simulating transaction...');
    const simResult = await connection.simulateTransaction(transaction);
    
    console.log('Simulation result:', simResult.value.err ? '❌ FAILED' : '✅ SUCCESS');
    
    if (simResult.value.logs) {
      console.log('\n📋 Program Logs:');
      simResult.value.logs.forEach((log, i) => {
        console.log(`${i + 1}. ${log}`);
      });
    }
    
    if (simResult.value.err) {
      console.log('\n❌ Error:', simResult.value.err);
    } else {
      console.log('\n✅ Simulation successful! The mint instruction should work.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('🔍 Full error:', error);
  }
}

testMintSimulation();