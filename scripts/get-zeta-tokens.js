const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

async function requestZetaTokens() {
    console.log('🚰 Requesting ZetaChain Testnet Tokens');
    console.log('=====================================');
    
    const walletAddress = process.env.ZETACHAIN_WALLET_ADDRESS;
    if (!walletAddress) {
        console.error('❌ No wallet address found in .env file');
        return false;
    }
    
    console.log('📍 Wallet Address:', walletAddress);
    
    try {
        // Try multiple faucet endpoints
        const faucetEndpoints = [
            'https://zetachain-athens-3.g.alchemy.com/faucet',
            'https://labs.zetachain.com/get-zeta',
            'https://faucet.zetachain.com/api/faucet'
        ];
        
        console.log('🔄 Attempting to request tokens from faucet...');
        
        // Method 1: Try direct API call
        try {
            const response = await axios.post('https://faucet.zetachain.com/api/faucet', {
                address: walletAddress,
                network: 'athens'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Universal-NFT-App/1.0'
                },
                timeout: 30000
            });
            
            if (response.status === 200) {
                console.log('✅ Faucet request successful!');
                console.log('📋 Response:', response.data);
                return true;
            }
        } catch (apiError) {
            console.log('⚠️ Direct API call failed, trying alternative method...');
        }
        
        // Method 2: Manual instructions
        console.log('\n📋 Manual Token Request Instructions:');
        console.log('====================================');
        console.log('1. Visit: https://labs.zetachain.com/get-zeta');
        console.log('2. Connect your wallet or enter address:', walletAddress);
        console.log('3. Request testnet ZETA tokens');
        console.log('4. Wait 1-2 minutes for tokens to arrive');
        console.log('5. Run: node setup-zetachain-wallet.js --check-balance');
        
        console.log('\n🔗 Alternative Faucets:');
        console.log('- https://faucet.zetachain.com/');
        console.log('- https://zetachain-athens.blockscout.com/faucet');
        
        return false;
        
    } catch (error) {
        console.error('❌ Error requesting tokens:', error.message);
        return false;
    }
}

async function waitForTokens(maxWaitMinutes = 5) {
    console.log('\n⏳ Waiting for tokens to arrive...');
    console.log(`⏰ Will check every 30 seconds for ${maxWaitMinutes} minutes`);
    
    const walletAddress = process.env.ZETACHAIN_WALLET_ADDRESS;
    const provider = new ethers.JsonRpcProvider('https://zetachain-athens-evm.blockpi.network/v1/rpc/public');
    
    const maxAttempts = maxWaitMinutes * 2; // 30-second intervals
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const balance = await provider.getBalance(walletAddress);
            const balanceInZeta = ethers.formatEther(balance);
            
            console.log(`🔍 Attempt ${attempt}/${maxAttempts}: Balance = ${balanceInZeta} ZETA`);
            
            if (parseFloat(balanceInZeta) >= 0.1) {
                console.log('✅ Sufficient tokens received!');
                console.log('💰 Final balance:', balanceInZeta, 'ZETA');
                return true;
            }
            
            if (attempt < maxAttempts) {
                console.log('⏳ Waiting 30 seconds before next check...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
            
        } catch (error) {
            console.error(`❌ Error checking balance (attempt ${attempt}):`, error.message);
        }
    }
    
    console.log('⏰ Timeout reached. Tokens may still be pending.');
    return false;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--wait-only')) {
        await waitForTokens();
    } else {
        const requested = await requestZetaTokens();
        
        if (requested) {
            await waitForTokens();
        } else {
            console.log('\n🔄 Run this script with --wait-only after manually requesting tokens');
            console.log('Example: node get-zeta-tokens.js --wait-only');
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { requestZetaTokens, waitForTokens };