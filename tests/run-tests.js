const { Connection, PublicKey } = require('@solana/web3.js');

async function testUniversalNFTPlatform() {
  console.log('🧪 Testing Universal NFT Platform...');
  console.log('=====================================\n');

  // Test 1: Connection to Devnet
  console.log('1️⃣  Testing Devnet Connection...');
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const version = await connection.getVersion();
    console.log('✅ Connected to Solana Devnet');
    console.log(`   Version: ${version['solana-core']}`);
    console.log(`   Feature Set: ${version['feature-set']}\n`);
  } catch (error) {
    console.log('❌ Devnet connection failed:', error.message);
    return;
  }

  // Test 2: Program Deployment Verification
  console.log('2️⃣  Verifying Program Deployment...');
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new PublicKey('6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2');
    const accountInfo = await connection.getAccountInfo(programId);
    
    if (accountInfo) {
      console.log('✅ Universal NFT Program Found');
      console.log(`   Program ID: ${programId.toString()}`);
      console.log(`   Owner: ${accountInfo.owner.toString()}`);
      console.log(`   Executable: ${accountInfo.executable}`);
      console.log(`   Data Length: ${accountInfo.data.length} bytes`);
      console.log(`   Lamports: ${accountInfo.lamports / 1e9} SOL\n`);
    } else {
      console.log('❌ Program not found on devnet');
      return;
    }
  } catch (error) {
    console.log('❌ Program verification failed:', error.message);
    return;
  }

  // Test 3: Program State PDA
  console.log('3️⃣  Checking Program State PDA...');
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new PublicKey('6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2');
    
    const [programState] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      programId
    );
    
    console.log('✅ Program State PDA Generated');
    console.log(`   PDA: ${programState.toString()}`);
    
    const stateAccount = await connection.getAccountInfo(programState);
    if (stateAccount) {
      console.log('✅ Program State Account Exists');
      console.log(`   Data Length: ${stateAccount.data.length} bytes`);
    } else {
      console.log('⚠️  Program State Not Initialized (normal for fresh deployment)');
    }
    console.log('');
  } catch (error) {
    console.log('❌ PDA check failed:', error.message);
  }

  // Test 4: RPC Endpoints
  console.log('4️⃣  Testing RPC Endpoints...');
  const endpoints = [
    'https://api.devnet.solana.com',
    'https://devnet.helius-rpc.com/?api-key=demo',
  ];

  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const slot = await connection.getSlot();
      console.log(`✅ ${endpoint} - Slot: ${slot}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed: ${error.message}`);
    }
  }

  console.log('\n🎉 Testing Complete!');
  console.log('===================');
  console.log('✅ Program deployed and accessible');
  console.log('✅ Ready for frontend testing');
  console.log('✅ Ready for hackathon demo');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. cd frontend && npm run dev');
  console.log('2. Open http://localhost:3000');
  console.log('3. Connect your Solana wallet');
  console.log('4. Test the Universal NFT features!');
}

testUniversalNFTPlatform().catch(console.error);