const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// ZetaChain configuration
const ZETACHAIN_CONFIG = {
  testnet: {
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    gateway: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
    explorer: 'https://zetachain-athens.blockscout.com'
  },
  mainnet: {
    rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
    chainId: 7000,
    gateway: '0x', // Update with mainnet gateway
    explorer: 'https://zetachain.blockscout.com'
  }
};

async function deployUniversalApp() {
  console.log('🚀 Deploying Universal NFT Contract to ZetaChain...');
  
  const network = process.env.NETWORK || 'testnet';
  const config = ZETACHAIN_CONFIG[network];
  
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  
  console.log(`📡 Network: ${network}`);
  console.log(`🔗 RPC URL: ${config.rpcUrl}`);
  console.log(`🌉 Gateway: ${config.gateway}`);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer:', deployer.address);
  
  const balance = await deployer.getBalance();
  console.log('💰 Balance:', ethers.utils.formatEther(balance), 'ZETA');
  
  if (balance.lt(ethers.utils.parseEther('0.1'))) {
    console.warn('⚠️ Low balance. You may need more ZETA for deployment.');
  }
  
  // Deploy Universal NFT Contract
  console.log('\n📦 Deploying UniversalNFTContract...');
  
  const UniversalNFTContract = await ethers.getContractFactory('UniversalNFTContract');
  const universalNFT = await UniversalNFTContract.deploy(
    config.gateway,
    'Universal NFT',
    'UNFT'
  );
  
  await universalNFT.deployed();
  
  console.log('✅ UniversalNFTContract deployed to:', universalNFT.address);
  console.log('🔗 Transaction hash:', universalNFT.deployTransaction.hash);
  
  // Wait for confirmations
  console.log('⏳ Waiting for confirmations...');
  await universalNFT.deployTransaction.wait(3);
  
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
    network,
    chainId: config.chainId,
    contractAddress: universalNFT.address,
    deployerAddress: deployer.address,
    transactionHash: universalNFT.deployTransaction.hash,
    gateway: config.gateway,
    deployedAt: new Date().toISOString(),
    gasUsed: universalNFT.deployTransaction.gasLimit?.toString(),
    gasPrice: universalNFT.deployTransaction.gasPrice?.toString(),
  };
  
  const deploymentPath = path.join(__dirname, '..', 'deployments', `zetachain-${network}.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n💾 Deployment info saved to:', deploymentPath);
  
  // Update frontend config
  await updateFrontendConfig(deploymentInfo);
  
  // Print summary
  console.log('\n🎉 Deployment Summary');
  console.log('=====================');
  console.log('Contract Address:', universalNFT.address);
  console.log('Network:', network);
  console.log('Explorer URL:', `${config.explorer}/address/${universalNFT.address}`);
  console.log('Transaction:', `${config.explorer}/tx/${universalNFT.deployTransaction.hash}`);
  
  console.log('\n📋 Next Steps:');
  console.log('1. Verify contract on block explorer');
  console.log('2. Update Solana program with Universal App address');
  console.log('3. Test cross-chain functionality');
  console.log('4. Update frontend configuration');
  
  return {
    address: universalNFT.address,
    contract: universalNFT,
    deploymentInfo
  };
}

async function updateFrontendConfig(deploymentInfo) {
  console.log('🔧 Updating frontend configuration...');
  
  const configPath = path.join(__dirname, '..', 'frontend', 'src', 'lib', 'config.ts');
  
  if (!fs.existsSync(configPath)) {
    console.warn('⚠️ Frontend config file not found, skipping update');
    return;
  }
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update ZetaChain contract address
    const addressPattern = /ZETACHAIN_UNIVERSAL_APP_ADDRESS.*=.*['"`].*['"`]/;
    const newAddressLine = `export const ZETACHAIN_UNIVERSAL_APP_ADDRESS = '${deploymentInfo.contractAddress}';`;
    
    if (addressPattern.test(configContent)) {
      configContent = configContent.replace(addressPattern, newAddressLine);
    } else {
      // Add new line if not exists
      configContent += `\n// ZetaChain Universal App\n${newAddressLine}\n`;
    }
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Frontend config updated');
    
  } catch (error) {
    console.error('❌ Failed to update frontend config:', error.message);
  }
}

async function verifyContract(address, constructorArgs, network = 'testnet') {
  console.log('🔍 Verifying contract on block explorer...');
  
  try {
    await hre.run('verify:verify', {
      address: address,
      constructorArguments: constructorArgs,
      network: `zetachain_${network}`
    });
    
    console.log('✅ Contract verified successfully');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('✅ Contract already verified');
    } else {
      console.error('❌ Verification failed:', error.message);
    }
  }
}

// CLI interface
async function main() {
  try {
    const deployment = await deployUniversalApp();
    
    // Optionally verify contract
    if (process.env.VERIFY === 'true') {
      const config = ZETACHAIN_CONFIG[process.env.NETWORK || 'testnet'];
      await verifyContract(
        deployment.address,
        [config.gateway, 'Universal NFT', 'UNFT'],
        process.env.NETWORK || 'testnet'
      );
    }
    
    console.log('\n🚀 Deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  deployUniversalApp,
  updateFrontendConfig,
  verifyContract,
  ZETACHAIN_CONFIG
};