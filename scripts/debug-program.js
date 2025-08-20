const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function debugProgram() {
  console.log('🔍 Debugging deployed program...');
  
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const programId = new PublicKey("GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s");
  
  console.log('📋 Program ID:', programId.toString());
  
  // Check if program exists
  const programAccount = await connection.getAccountInfo(programId);
  if (!programAccount) {
    console.log('❌ Program account not found');
    return;
  }
  
  console.log('✅ Program account found:');
  console.log('  Executable:', programAccount.executable);
  console.log('  Owner:', programAccount.owner.toString());
  console.log('  Data length:', programAccount.data.length);
  
  // Load and display IDL
  const idl = JSON.parse(fs.readFileSync("./target/idl/universal_nft.json", 'utf8'));
  console.log('\n📋 Available instructions in IDL:');
  idl.instructions.forEach((instruction, index) => {
    console.log(`  ${index + 1}. ${instruction.name} - ${instruction.docs?.[0] || 'No description'}`);
  });
  
  // Check program state
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    programId
  );
  
  console.log('\n📍 Program State PDA:', programStatePda.toString());
  
  const programStateAccount = await connection.getAccountInfo(programStatePda);
  if (programStateAccount) {
    console.log('✅ Program state exists:');
    console.log('  Data length:', programStateAccount.data.length);
    console.log('  Owner:', programStateAccount.owner.toString());
  } else {
    console.log('❌ Program state not found');
  }
  
  // Test discriminator calculation
  console.log('\n🔧 Testing discriminator calculation:');
  const crypto = require('crypto');
  
  const instructions = ['initialize', 'mintNft', 'mintNftSimple', 'transferCrossChain'];
  instructions.forEach(instruction => {
    const hash = crypto.createHash('sha256').update(`global:${instruction}`).digest('hex');
    const discriminator = hash.substring(0, 16);
    console.log(`  ${instruction}: ${discriminator}`);
  });
}

debugProgram().catch(console.error);