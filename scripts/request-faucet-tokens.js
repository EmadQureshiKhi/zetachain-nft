const { ethers } = require('ethers');
require('dotenv').config();

async function requestTokensFromFaucet() {
    console.log('🚰 Requesting ZetaChain Testnet Tokens');
    console.log('=====================================');
    
    const walletAddress = process.env.ZETACHAIN_WALLET_ADDRESS;
    console.log('📍 Wallet Address:', walletAddress);
    
    // Try to use a simple HTTP request to the faucet
    const https = require('https');
    const querystring = require('querystring');
    
    const postData = querystring.stringify({
        'address': walletAddress
    });
    
    const options = {
        hostname: 'faucet.zetachain.com',
        port: 443,
        path: '/api/faucet',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📋 Faucet Response Status:', res.statusCode);
                console.log('📋 Faucet Response:', data);
                
                if (res.statusCode === 200) {
                    console.log('✅ Faucet request successful!');
                    resolve(true);
                } else {
                    console.log('⚠️ Faucet request may have failed');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (e) => {
            console.error('❌ Faucet request error:', e.message);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

async function checkBalance() {
    const walletAddress = process.env.ZETACHAIN_WALLET_ADDRESS;
    const provider = new ethers.JsonRpcProvider('https://zetachain-athens-evm.blockpi.network/v1/rpc/public');
    
    try {
        const balance = await provider.getBalance(walletAddress);
        const balanceInZeta = ethers.formatEther(balance);
        
        console.log('\n💰 Current Balance:', balanceInZeta, 'ZETA');
        return parseFloat(balanceInZeta);
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        return 0;
    }
}

async function waitForTokens(maxMinutes = 3) {
    console.log('\n⏳ Waiting for tokens to arrive...');
    
    for (let i = 0; i < maxMinutes * 2; i++) { // Check every 30 seconds
        const balance = await checkBalance();
        
        if (balance >= 0.1) {
            console.log('✅ Tokens received! Balance:', balance, 'ZETA');
            return true;
        }
        
        if (i < (maxMinutes * 2) - 1) {
            console.log(`⏳ Waiting... (${i + 1}/${maxMinutes * 2})`);
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    console.log('⏰ Timeout reached. Please check manually.');
    return false;
}

async function main() {
    // Check current balance first
    const initialBalance = await checkBalance();
    
    if (initialBalance >= 0.1) {
        console.log('✅ Already have sufficient tokens!');
        return true;
    }
    
    // Try to request tokens
    console.log('\n🔄 Requesting tokens from faucet...');
    const requested = await requestTokensFromFaucet();
    
    if (requested) {
        // Wait for tokens to arrive
        const received = await waitForTokens();
        return received;
    } else {
        console.log('\n📋 Please manually request tokens:');
        console.log('1. Visit: https://labs.zetachain.com/get-zeta');
        console.log('2. Enter address:', process.env.ZETACHAIN_WALLET_ADDRESS);
        console.log('3. Request tokens');
        console.log('4. Run: node request-faucet-tokens.js');
        return false;
    }
}

if (require.main === module) {
    main().then(success => {
        if (success) {
            console.log('\n🎉 Ready to deploy to ZetaChain!');
            console.log('Run: node scripts/deploy-universal-app.js');
        } else {
            console.log('\n⚠️ Need tokens before deployment');
        }
    }).catch(console.error);
}

module.exports = { requestTokensFromFaucet, checkBalance, waitForTokens };