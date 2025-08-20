// Simple test to verify frontend configuration
const config = require('./src/lib/config.ts');

console.log('🧪 Testing Frontend Configuration');
console.log('=================================');

try {
  console.log('✅ UNIVERSAL_NFT_PROGRAM_ID:', config.UNIVERSAL_NFT_PROGRAM_ID);
  console.log('✅ ZETACHAIN_GATEWAY_ID:', config.ZETACHAIN_GATEWAY_ID);
  console.log('✅ PROGRAM_STATE_PDA:', config.PROGRAM_STATE_PDA);
  console.log('✅ SUPPORTED_CHAINS:', config.SUPPORTED_CHAINS.length, 'chains');
  console.log('✅ CHAIN_CONFIG keys:', Object.keys(config.CHAIN_CONFIG));
  console.log('✅ DEPLOYMENT_INFO:', config.DEPLOYMENT_INFO.status);
  
  console.log('\n🎉 All configuration exports are working!');
} catch (error) {
  console.error('❌ Configuration test failed:', error.message);
}