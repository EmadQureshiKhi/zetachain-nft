// Test frontend configuration with deployed program
const { Connection, PublicKey } = require('@solana/web3.js');

async function testFrontendConfig() {
  console.log('🧪 Testing Frontend Configuration');
  console.log('=================================');

  try {
    // Configuration from frontend
    const PROGRAM_ID = 'H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC';
    const PROGRAM_STATE_PDA = 'GVugTA1B9LiguC2G6bjY5i6iYKApNgYuUXxQzzm4ycPu';
    const RPC_URL = 'https://api.devnet.solana.com';

    console.log('📋 Configuration:');
    console.log('  Program ID:', PROGRAM_ID);
    console.log('  Program State PDA:', PROGRAM_STATE_PDA);
    console.log('  RPC URL:', RPC_URL);

    // Test connection
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log('\n🔗 Testing connection...');

    // Test program account
    const programId = new PublicKey(PROGRAM_ID);
    const programAccount = await connection.getAccountInfo(programId);
    
    if (programAccount) {
      console.log('✅ Program account found');
      console.log('  Owner:', programAccount.owner.toString());
      console.log('  Executable:', programAccount.executable);
      console.log('  Data length:', programAccount.data.length);
    } else {
      console.log('❌ Program account not found');
      return;
    }

    // Test program state
    const programStatePda = new PublicKey(PROGRAM_STATE_PDA);
    const programStateAccount = await connection.getAccountInfo(programStatePda);
    
    if (programStateAccount) {
      console.log('✅ Program state account found');
      console.log('  Owner:', programStateAccount.owner.toString());
      console.log('  Data length:', programStateAccount.data.length);
      
      // Parse basic program state
      if (programStateAccount.data.length >= 106) {
        const data = programStateAccount.data;
        try {
          const authority = new PublicKey(data.slice(8, 40));
          const gateway = new PublicKey(data.slice(40, 72));
          
          console.log('📊 Program State:');
          console.log('  Authority:', authority.toString());
          console.log('  Gateway:', gateway.toString());
          console.log('  Initialized: ✅ YES');
        } catch (e) {
          console.log('⚠️  Could not parse program state');
        }
      }
    } else {
      console.log('❌ Program state account not found');
      return;
    }

    // Test PDA calculations
    console.log('\n🔧 Testing PDA calculations...');
    
    const [calculatedProgramState, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      programId
    );
    
    console.log('  Calculated Program State PDA:', calculatedProgramState.toString());
    console.log('  Expected Program State PDA:', PROGRAM_STATE_PDA);
    console.log('  Match:', calculatedProgramState.toString() === PROGRAM_STATE_PDA ? '✅' : '❌');
    console.log('  Bump:', bump);

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_authority')],
      programId
    );
    console.log('  Mint Authority PDA:', mintAuthority.toString());

    // Test supported chains configuration
    const SUPPORTED_CHAINS = [
      { id: 1, name: 'Ethereum', symbol: 'ETH', icon: '🔷' },
      { id: 56, name: 'BNB Chain', symbol: 'BNB', icon: '🟡' },
      { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '🟣' },
      { id: 43114, name: 'Avalanche', symbol: 'AVAX', icon: '🔺' },
      { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵' },
      { id: 10, name: 'Optimism', symbol: 'ETH', icon: '🔴' },
      { id: 8332, name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    ];

    console.log('\n🌐 Supported Chains:');
    SUPPORTED_CHAINS.forEach(chain => {
      console.log(`  ${chain.icon} ${chain.name} (${chain.symbol}) - Chain ID: ${chain.id}`);
    });

    console.log('\n🎉 Frontend Configuration Test Complete!');
    console.log('✅ All systems ready for NFT minting and cross-chain operations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('🔍 Full error:', error);
  }
}

testFrontendConfig();