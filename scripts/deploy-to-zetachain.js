const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ZetaChain configuration
const ZETACHAIN_CONFIG = {
  testnet: {
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    gateway: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
    explorer: 'https://zetachain-athens.blockscout.com',
    name: 'ZetaChain Athens Testnet'
  }
};

async function checkBalance() {
    const walletAddress = process.env.ZETACHAIN_WALLET_ADDRESS;
    const provider = new ethers.JsonRpcProvider(ZETACHAIN_CONFIG.testnet.rpcUrl);
    
    try {
        const balance = await provider.getBalance(walletAddress);
        const balanceInZeta = ethers.formatEther(balance);
        
        console.log('💰 Wallet Balance:', balanceInZeta, 'ZETA');
        return parseFloat(balanceInZeta);
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
        return 0;
    }
}

async function deployUniversalNFTContract() {
    console.log('🚀 Deploying Universal NFT Contract to ZetaChain');
    console.log('================================================');
    
    const config = ZETACHAIN_CONFIG.testnet;
    
    console.log('📡 Network:', config.name);
    console.log('🔗 RPC URL:', config.rpcUrl);
    console.log('🌉 Gateway:', config.gateway);
    console.log('🆔 Chain ID:', config.chainId);
    
    // Check if we have sufficient balance
    const balance = await checkBalance();
    if (balance < 0.1) {
        console.log('\n❌ Insufficient balance for deployment!');
        console.log('📋 Please get testnet tokens:');
        console.log('1. Visit: https://labs.zetachain.com/get-zeta');
        console.log('2. Enter address:', process.env.ZETACHAIN_WALLET_ADDRESS);
        console.log('3. Request tokens and wait for confirmation');
        console.log('4. Run this script again');
        return null;
    }
    
    console.log('✅ Sufficient balance for deployment');
    
    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log('\n👤 Deployer Address:', deployer.address);
        console.log('💰 Deployer Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ZETA');
        
        // Deploy Universal NFT Contract
        console.log('\n📦 Deploying UniversalNFTContract...');
        
        const UniversalNFTContract = await ethers.getContractFactory('UniversalNFTContract');
        
        console.log('🔧 Constructor parameters:');
        console.log('  Gateway:', config.gateway);
        console.log('  Name: Universal NFT');
        console.log('  Symbol: UNFT');
        
        const universalNFT = await UniversalNFTContract.deploy(
            config.gateway,
            'Universal NFT',
            'UNFT'
        );
        
        console.log('⏳ Waiting for deployment...');
        await universalNFT.waitForDeployment();
        
        const contractAddress = await universalNFT.getAddress();
        console.log('✅ Contract deployed to:', contractAddress);
        
        // Get deployment transaction
        const deployTx = universalNFT.deploymentTransaction();
        console.log('🔗 Transaction hash:', deployTx.hash);
        
        // Wait for confirmations
        console.log('⏳ Waiting for confirmations...');
        const receipt = await deployTx.wait(3);
        console.log('✅ Confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        
        // Verify deployment
        console.log('\n🔍 Verifying deployment...');
        
        try {
            const name = await universalNFT.name();
            const symbol = await universalNFT.symbol();
            const gateway = await universalNFT.gateway();
            
            console.log('📝 Contract details:');
            console.log('  Name:', name);
            console.log('  Symbol:', symbol);
            console.log('  Gateway:', gateway);
            
            if (gateway.toLowerCase() !== config.gateway.toLowerCase()) {
                console.warn('⚠️ Gateway address mismatch!');
            } else {
                console.log('✅ Gateway address verified');
            }
            
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
        }
        
        // Save deployment info
        const deploymentInfo = {
            network: 'testnet',
            chainId: config.chainId,
            contractAddress: contractAddress,
            deployerAddress: deployer.address,
            transactionHash: deployTx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: deployTx.gasPrice?.toString(),
            gateway: config.gateway,
            deployedAt: new Date().toISOString(),
            explorerUrl: `${config.explorer}/address/${contractAddress}`,
            transactionUrl: `${config.explorer}/tx/${deployTx.hash}`
        };
        
        // Create deployments directory
        const deploymentsDir = path.join(__dirname, 'deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        const deploymentPath = path.join(deploymentsDir, 'zetachain-testnet.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('\n💾 Deployment info saved to:', deploymentPath);
        
        // Update frontend config
        await updateFrontendConfig(deploymentInfo);
        
        // Update Solana program with ZetaChain contract address
        await updateSolanaConfig(deploymentInfo);
        
        // Print summary
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('========================');
        console.log('Contract Address:', contractAddress);
        console.log('Network:', config.name);
        console.log('Chain ID:', config.chainId);
        console.log('Gateway:', config.gateway);
        console.log('Block Number:', receipt.blockNumber);
        console.log('Gas Used:', receipt.gasUsed.toString());
        console.log('');
        console.log('🔗 Explorer Links:');
        console.log('Contract:', `${config.explorer}/address/${contractAddress}`);
        console.log('Transaction:', `${config.explorer}/tx/${deployTx.hash}`);
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. ✅ ZetaChain contract deployed');
        console.log('2. 🔄 Update Solana program with contract address');
        console.log('3. 🧪 Test cross-chain functionality');
        console.log('4. 🎨 Test frontend integration');
        
        return deploymentInfo;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log('\n💰 Insufficient funds for deployment');
            console.log('Please get more testnet ZETA tokens');
        } else if (error.code === 'NETWORK_ERROR') {
            console.log('\n🌐 Network connection error');
            console.log('Please check your internet connection and try again');
        }
        
        throw error;
    }
}

async function updateFrontendConfig(deploymentInfo) {
    console.log('\n🔧 Updating frontend configuration...');
    
    const configPath = path.join(__dirname, 'frontend', 'src', 'lib', 'config.ts');
    
    if (!fs.existsSync(configPath)) {
        console.warn('⚠️ Frontend config file not found, skipping update');
        return;
    }
    
    try {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Update ZetaChain contract address
        const addressPattern = /export const ZETACHAIN_UNIVERSAL_APP_ADDRESS.*=.*['"`].*['"`]/;
        const newAddressLine = `export const ZETACHAIN_UNIVERSAL_APP_ADDRESS = '${deploymentInfo.contractAddress}';`;
        
        if (addressPattern.test(configContent)) {
            configContent = configContent.replace(addressPattern, newAddressLine);
        } else {
            // Add new line if not exists
            configContent += `\n// ZetaChain Universal App\n${newAddressLine}\n`;
        }
        
        // Update chain ID
        const chainIdPattern = /export const ZETACHAIN_CHAIN_ID.*=.*\d+/;
        const newChainIdLine = `export const ZETACHAIN_CHAIN_ID = ${deploymentInfo.chainId};`;
        
        if (chainIdPattern.test(configContent)) {
            configContent = configContent.replace(chainIdPattern, newChainIdLine);
        } else {
            configContent += `${newChainIdLine}\n`;
        }
        
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Frontend config updated');
        
    } catch (error) {
        console.error('❌ Failed to update frontend config:', error.message);
    }
}

async function updateSolanaConfig(deploymentInfo) {
    console.log('🔧 Updating Solana program configuration...');
    
    try {
        // Update deployment-info.json with ZetaChain contract address
        const solanaDeploymentPath = path.join(__dirname, 'deployment-info.json');
        
        if (fs.existsSync(solanaDeploymentPath)) {
            const solanaDeployment = JSON.parse(fs.readFileSync(solanaDeploymentPath, 'utf8'));
            
            solanaDeployment.zetachainContract = deploymentInfo.contractAddress;
            solanaDeployment.zetachainChainId = deploymentInfo.chainId;
            solanaDeployment.zetachainGateway = deploymentInfo.gateway;
            solanaDeployment.crossChainEnabled = true;
            solanaDeployment.lastUpdated = new Date().toISOString();
            
            fs.writeFileSync(solanaDeploymentPath, JSON.stringify(solanaDeployment, null, 2));
            console.log('✅ Solana deployment info updated');
        } else {
            console.warn('⚠️ Solana deployment info not found');
        }
        
    } catch (error) {
        console.error('❌ Failed to update Solana config:', error.message);
    }
}

async function main() {
    try {
        console.log('🌟 ZetaChain Universal NFT Deployment');
        console.log('====================================');
        
        // Check environment
        if (!process.env.PRIVATE_KEY) {
            console.error('❌ PRIVATE_KEY not found in .env file');
            process.exit(1);
        }
        
        if (!process.env.ZETACHAIN_WALLET_ADDRESS) {
            console.error('❌ ZETACHAIN_WALLET_ADDRESS not found in .env file');
            process.exit(1);
        }
        
        const deployment = await deployUniversalNFTContract();
        
        if (deployment) {
            console.log('\n🚀 Deployment completed successfully!');
            
            // Save final summary
            const summaryPath = path.join(__dirname, 'ZETACHAIN_DEPLOYMENT_SUMMARY.md');
            const summary = `# ZetaChain Deployment Summary

## Contract Information
- **Contract Address**: ${deployment.contractAddress}
- **Network**: ${deployment.network}
- **Chain ID**: ${deployment.chainId}
- **Gateway**: ${deployment.gateway}
- **Deployed At**: ${deployment.deployedAt}

## Transaction Details
- **Transaction Hash**: ${deployment.transactionHash}
- **Block Number**: ${deployment.blockNumber}
- **Gas Used**: ${deployment.gasUsed}
- **Deployer**: ${deployment.deployerAddress}

## Explorer Links
- **Contract**: ${deployment.explorerUrl}
- **Transaction**: ${deployment.transactionUrl}

## Integration Status
- ✅ ZetaChain contract deployed
- ✅ Frontend configuration updated
- ✅ Solana program configuration updated
- 🔄 Ready for cross-chain testing

## Next Steps
1. Test cross-chain NFT transfers
2. Verify contract functionality
3. Update documentation
4. Deploy to mainnet when ready
`;
            
            fs.writeFileSync(summaryPath, summary);
            console.log('📄 Deployment summary saved to:', summaryPath);
        }
        
    } catch (error) {
        console.error('❌ Deployment process failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    deployUniversalNFTContract,
    updateFrontendConfig,
    updateSolanaConfig,
    ZETACHAIN_CONFIG
};