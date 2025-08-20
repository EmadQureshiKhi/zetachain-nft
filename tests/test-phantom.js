// Simple test to check if Phantom is available
console.log('🧪 Testing Phantom Wallet Detection');
console.log('==================================\n');

// Check if running in browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Check for Phantom
  if (window.solana && window.solana.isPhantom) {
    console.log('✅ Phantom wallet detected!');
    console.log('📊 Phantom version:', window.solana._version || 'unknown');
    console.log('🔗 Is connected:', window.solana.isConnected);
  } else {
    console.log('❌ Phantom wallet not detected');
    console.log('💡 Make sure Phantom extension is installed and enabled');
  }
  
  // Check for Solflare
  if (window.solflare) {
    console.log('✅ Solflare wallet detected!');
  } else {
    console.log('❌ Solflare wallet not detected');
  }
  
  // List all available Solana wallets
  console.log('\n🔍 Checking for Solana wallets in window object:');
  const solanaWallets = [];
  
  if (window.solana) solanaWallets.push('solana (Phantom)');
  if (window.solflare) solanaWallets.push('solflare');
  if (window.torus) solanaWallets.push('torus');
  
  console.log('Found wallets:', solanaWallets.length > 0 ? solanaWallets : 'None');
  
} else {
  console.log('❌ Not running in browser environment');
}

console.log('\n💡 If no wallets are detected:');
console.log('1. Install Phantom: https://phantom.app/');
console.log('2. Refresh the page after installation');
console.log('3. Make sure the extension is enabled');
console.log('4. Try opening the extension first');

console.log('\n🎯 For demo purposes:');
console.log('- Demo mode works without wallet connection');
console.log('- You can show the wallet installation process');
console.log('- Focus on the deployed Solana program and Universal NFT features');