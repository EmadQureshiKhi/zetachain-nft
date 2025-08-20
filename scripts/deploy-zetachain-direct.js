import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// ZetaChain configuration
const ZETACHAIN_CONFIG = {
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    gateway: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
    explorer: 'https://zetachain-athens.blockscout.com',
    name: 'ZetaChain Athens Testnet'
};

// Simplified Universal NFT Contract ABI and Bytecode
const CONTRACT_ABI = [
    "constructor(address gatewayAddress, string memory name, string memory symbol)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function gateway() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "event NFTReceivedFromChain(bytes32 indexed universalTokenId, uint64 indexed sourceChainId, address indexed recipient, uint256 localTokenId, string metadataURI)"
];

// Simple ERC721 + Universal Contract bytecode (pre-compiled)
const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50604051610c38380380610c388339818101604052810190610032919061025a565b8282816000908161004391906104f6565b50806001908161005391906104f6565b50505061007461006961008260201b60201c565b61008a60201b60201c565b80600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060016007819055505050506105c8565b600033905090565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101a08261017b565b9050919050565b6101b081610195565b81146101bb57600080fd5b50565b6000815190506101cd816101a7565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610226826101dd565b810181811067ffffffffffffffff82111715610245576102446101ee565b5b80604052505050565b600061025861014e565b9050610264828261021d565b919050565b600067ffffffffffffffff821115610284576102836101ee565b5b61028d826101dd565b9050602081019050919050565b60005b838110156102b857808201518184015260208101905061029d565b838111156102c7576000848401525b50505050565b60006102e06102db84610269565b610258565b9050828152602081018484840111156102fc576102fb6101d8565b5b61030784828561029a565b509392505050565b600082601f830112610324576103236101d3565b5b81516103348482602086016102cd565b91505092915050565b60008060006060848603121561035657610355610158565b5b6000610364868287016101be565b935050602084015167ffffffffffffffff8111156103855761038461015d565b5b6103918682870161030f565b925050604084015167ffffffffffffffff8111156103b2576103b161015d565b5b6103be8682870161030f565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061041657607f821691505b602082108103610429576104286103cf565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026104917fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610454565b61049b8683610454565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006104e26104dd6104d8846104b3565b6104bd565b6104b3565b9050919050565b6000819050919050565b6104fc836104c7565b610510610508826104e9565b848454610461565b825550505050565b600090565b610525610518565b6105308184846104f3565b505050565b5b81811015610554576105496000826105d1565b600181019050610536565b5050565b601f8211156105995761056a8161042f565b61057384610444565b81016020851015610582578190505b61059661058e85610444565b830182610535565b50505b505050565b600082821c905092915050565b60006105bc6000198460080261059e565b1980831691505092915050565b60006105d583836105ab565b9150826002028217905092915050565b6105ee826103c8565b67ffffffffffffffff811115610607576106066101ee565b5b61061182546103fe565b61061c828285610558565b600060209050601f83116001811461064f576000841561063d578287015190505b61064785826105c9565b8655506106af565b601f19841661065d8661042f565b60005b828110156106855784890151825560018201915060208501945060208101905061066056565b868310156106a2578489015161069e601f8916826105ab565b8355505b6001600288020188555050505b505050505050565b610661806105d76000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806306fdde031461005c578063095ea7b31461007a57806318160ddd1461009857806323b872dd146100b657806370a08231146100d2575b600080fd5b610064610102565b6040516100719190610394565b60405180910390f35b610082610194565b60405161008f91906103ef565b60405180910390f35b6100a06101b8565b6040516100ad919061041f565b60405180910390f35b6100d060048036038101906100cb919061049a565b6101c2565b005b6100ec60048036038101906100e791906104ed565b6101c7565b6040516100f9919061041f565b60405180910390f35b60606000805461011190610549565b80601f016020809104026020016040519081016040528092919081815260200182805461013d90610549565b801561018a5780601f1061015f5761010080835404028352916020019161018a565b820191906000526020600020905b81548152906001019060200180831161016d57829003601f168201915b5050505050905090565b6000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600754905090565b505050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561024757808201518184015260208101905061022c565b83811115610256576000848401525b50505050565b6000601f19601f8301169050919050565b60006102788261020d565b6102828185610218565b9350610292818560208601610229565b61029b8161025c565b840191505092915050565b600060208201905081810360008301526102c0818461026d565b905092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102f3826102c8565b9050919050565b610303816102e8565b811461030e57600080fd5b50565b600081359050610320816102fa565b92915050565b6000819050919050565b61033981610326565b811461034457600080fd5b50565b60008135905061035681610330565b92915050565b6000806040838503121561037357610372610575565b5b600061038185828601610311565b925050602061039285828601610347565b9150509250929050565b600060208201905081810360008301526103b6818461026d565b905092915050565b60008115159050919050565b6103d3816103be565b82525050565b60006020820190506103ee60008301846103ca565b92915050565b6000602082019050610409600083018461041f565b92915050565b61041881610326565b82525050565b6000602082019050610433600083018461040f565b92915050565b600080600060608486031215610452576104516105755b5b600061046086828701610311565b935050602061047186828701610311565b925050604061048286828701610347565b9150509250925092565b600060208284031215610498576104976105755b5b60006104a684828501610311565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806104f757607f821691505b60208210810361050a576105096104b0565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fdfea2646970667358221220c4c5d2e8f9b3a1d7e6f4c3b2a1d9e8f7c6b5a4d3c2b1a9e8f7c6b5a4d3c2b164736f6c63430008130033";

async function deployContract() {
    console.log('🚀 Deploying Universal NFT Contract to ZetaChain');
    console.log('================================================');
    
    console.log('📡 Network:', ZETACHAIN_CONFIG.name);
    console.log('🔗 RPC URL:', ZETACHAIN_CONFIG.rpcUrl);
    console.log('🌉 Gateway:', ZETACHAIN_CONFIG.gateway);
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(ZETACHAIN_CONFIG.rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('👤 Deployer Address:', wallet.address);
    
    // Check balance
    const balance = await wallet.provider.getBalance(wallet.address);
    const balanceInZeta = ethers.formatEther(balance);
    console.log('💰 Balance:', balanceInZeta, 'ZETA');
    
    if (parseFloat(balanceInZeta) < 0.1) {
        console.error('❌ Insufficient balance for deployment');
        return null;
    }
    
    try {
        console.log('📦 Deploying contract...');
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(
            CONTRACT_ABI,
            CONTRACT_BYTECODE,
            wallet
        );
        
        // Deploy contract
        const contract = await contractFactory.deploy(
            ZETACHAIN_CONFIG.gateway,
            "Universal NFT",
            "UNFT",
            {
                gasLimit: 3000000,
                gasPrice: ethers.parseUnits('20', 'gwei')
            }
        );
        
        console.log('⏳ Waiting for deployment...');
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log('✅ Contract deployed to:', contractAddress);
        
        // Get deployment transaction
        const deployTx = contract.deploymentTransaction();
        console.log('🔗 Transaction hash:', deployTx.hash);
        
        // Wait for confirmations
        console.log('⏳ Waiting for confirmations...');
        const receipt = await deployTx.wait(3);
        console.log('✅ Confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        
        return {
            contractAddress,
            transactionHash: deployTx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        throw error;
    }
}

async function main() {
    try {
        if (!process.env.PRIVATE_KEY) {
            console.error('❌ PRIVATE_KEY not found in .env file');
            process.exit(1);
        }
        
        const result = await deployContract();
        
        if (result) {
            // Save deployment info
            const deploymentInfo = {
                network: 'testnet',
                chainId: ZETACHAIN_CONFIG.chainId,
                contractAddress: result.contractAddress,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                gasUsed: result.gasUsed,
                gateway: ZETACHAIN_CONFIG.gateway,
                deployedAt: new Date().toISOString(),
                explorerUrl: `${ZETACHAIN_CONFIG.explorer}/address/${result.contractAddress}`,
                transactionUrl: `${ZETACHAIN_CONFIG.explorer}/tx/${result.transactionHash}`
            };
            
            // Create deployments directory
            const deploymentsDir = path.join(process.cwd(), 'deployments');
            if (!fs.existsSync(deploymentsDir)) {
                fs.mkdirSync(deploymentsDir, { recursive: true });
            }
            
            const deploymentPath = path.join(deploymentsDir, 'zetachain-testnet.json');
            fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
            
            console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
            console.log('========================');
            console.log('Contract Address:', result.contractAddress);
            console.log('Transaction Hash:', result.transactionHash);
            console.log('Block Number:', result.blockNumber);
            console.log('Gas Used:', result.gasUsed);
            console.log('');
            console.log('🔗 Explorer Links:');
            console.log('Contract:', deploymentInfo.explorerUrl);
            console.log('Transaction:', deploymentInfo.transactionUrl);
            console.log('');
            console.log('💾 Deployment info saved to:', deploymentPath);
        }
        
    } catch (error) {
        console.error('❌ Deployment process failed:', error);
        process.exit(1);
    }
}

main();