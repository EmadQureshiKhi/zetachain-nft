const { ethers } = require('ethers');
const fs = require('fs');

async function setupZetaChainWallet() {
    console.log('🔑 Setting up ZetaChain Wallet');
    console.log('==============================');
    
    // Generate a new wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log('📋 New Wallet Generated:');
    console.log('Address:', wallet.address);
    console.log('Private Key:', wallet.privateKey);
    console.log('Mnemonic:', wallet.mnemonic.phrase);
    
    // Update .env file
    let envContent = '';
    if (fs.existsSync('.env')) {
        envContent = fs.readFileSync('.env', 'utf8');
    }
    
    // Add or update private key
    const privateKeyLine = `PRIVATE_KEY=${wallet.privateKey}`;
    const zetaAddressLine = `ZETACHAIN_WALLET_ADDRESS=${wallet.address}`;
    
    if (envContent.includes('PRIVATE_KEY=')) {
        envContent = envContent.replace(/PRIVATE_KEY=.*/, privateKeyLine);
    } else {
        envContent += `\n${privateKeyLine}`;
    }
    
    if (envContent.includes('ZETACHAIN_WALLET_ADDRESS=')) {
        envContent = envContent.replace(/ZETACHAIN_WALLET_ADDRESS=.*/, zetaAddressLine);
    } else {
        envContent += `\n${zetaAddressLine}`;
    }
    
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Environment updated with new wallet');
    console.log('💾 Private key saved to .env file');
    
    console.log('\n🚨 IMPORTANT SECURITY NOTES:');
    console.log('1. Keep your private key secure and never share it');
    console.log('2. Add .env to .gitignore to prevent committing secrets');
    console.log('3. For production, use hardware wallets or secure key management');
    
    console.log('\n💰 Next Steps:');
    console.log('1. Get testnet ZETA tokens from faucet:');
    console.log('   https://labs.zetachain.com/get-zeta');
    console.log('2. Add your address to the faucet:', wallet.address);
    console.log('3. Wait for tokens to arrive');
    console.log('4. Run deployment script');
    
    // Save wallet info for reference
    const walletInfo = {
        address: wallet.address,
        network: 'zetachain-testnet',
        createdAt: new Date().toISOString(),
        faucetUrl: 'https://labs.zetachain.com/get-zeta',
        explorerUrl: `https://zetachain-athens.blockscout.com/address/${wallet.address}`
    };
    
    fs.writeFileSync('zetachain-wallet-info.json', JSON.stringify(walletInfo, null, 2));
    console.log('\n💾 Wallet info saved to zetachain-wallet-info.json');
    
    return wallet;
}

async function checkBalance(address) {
    console.log('\n💰 Checking ZetaChain Balance');
    console.log('=============================');
    
    try {
        const provider = new ethers.JsonRpcProvider('https://zetachain-athens-evm.blockpi.network/v1/rpc/public');
        const balance = await provider.getBalance(address);
        const balanceInZeta = ethers.formatEther(balance);
        
        console.log('Address:', address);
        console.log('Balance:', balanceInZeta, 'ZETA');
        
        if (parseFloat(balanceInZeta) < 0.1) {
            console.log('⚠️ Low balance! You need testnet ZETA tokens.');
            console.log('🚰 Get tokens from: https://labs.zetachain.com/get-zeta');
            return false;
        } else {
            console.log('✅ Sufficient balance for deployment');
            return true;
        }
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--check-balance')) {
        // Check existing wallet balance
        require('dotenv').config();
        if (!process.env.ZETACHAIN_WALLET_ADDRESS) {
            console.error('❌ No wallet address found in .env file');
            process.exit(1);
        }
        await checkBalance(process.env.ZETACHAIN_WALLET_ADDRESS);
    } else {
        // Generate new wallet
        const wallet = await setupZetaChainWallet();
        
        // Check if we can connect to ZetaChain
        await checkBalance(wallet.address);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupZetaChainWallet, checkBalance };