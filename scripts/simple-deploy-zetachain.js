const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ZetaChain configuration
const ZETACHAIN_CONFIG = {
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    gateway: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
    explorer: 'https://zetachain-athens.blockscout.com',
    name: 'ZetaChain Athens Testnet'
};

// Contract ABI and Bytecode (we'll compile manually)
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UniversalNFTContract is ERC721, ERC721URIStorage, Ownable, UniversalContract {
    using Counters for Counters.Counter;

    IGatewayZEVM public immutable gateway;
    Counters.Counter private _tokenIdCounter;
    
    mapping(bytes32 => uint256) public universalToLocal;
    mapping(uint256 => bytes32) public localToUniversal;
    mapping(bytes32 => NFTOrigin) public nftOrigins;
    
    struct NFTOrigin {
        uint64 sourceChainId;
        bytes32 universalTokenId;
        address originalOwner;
        string originalMetadataURI;
        uint256 timestamp;
        bool exists;
    }
    
    struct CrossChainNFTMessage {
        bytes32 universalTokenId;
        uint64 sourceChainId;
        uint64 destinationChainId;
        address recipient;
        string name;
        string symbol;
        string metadataURI;
        uint256 timestamp;
    }

    event NFTReceivedFromChain(
        bytes32 indexed universalTokenId,
        uint64 indexed sourceChainId,
        address indexed recipient,
        uint256 localTokenId,
        string metadataURI
    );

    event NFTSentToChain(
        bytes32 indexed universalTokenId,
        uint64 indexed destinationChainId,
        address indexed sender,
        uint256 localTokenId
    );

    error Unauthorized();
    error InvalidMessage();
    error NFTNotFound();

    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert Unauthorized();
        _;
    }

    constructor(
        address payable gatewayAddress,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable() {
        gateway = IGatewayZEVM(gatewayAddress);
        _tokenIdCounter.increment();
    }

    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        CrossChainNFTMessage memory nftMessage = abi.decode(message, (CrossChainNFTMessage));
        
        if (nftMessage.universalTokenId == bytes32(0)) revert InvalidMessage();
        if (nftMessage.recipient == address(0)) revert InvalidMessage();
        
        uint256 existingTokenId = universalToLocal[nftMessage.universalTokenId];
        
        if (existingTokenId > 0) {
            _transfer(ownerOf(existingTokenId), nftMessage.recipient, existingTokenId);
        } else {
            uint256 newTokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(nftMessage.recipient, newTokenId);
            _setTokenURI(newTokenId, nftMessage.metadataURI);
            
            universalToLocal[nftMessage.universalTokenId] = newTokenId;
            localToUniversal[newTokenId] = nftMessage.universalTokenId;
            
            nftOrigins[nftMessage.universalTokenId] = NFTOrigin({
                sourceChainId: nftMessage.sourceChainId,
                universalTokenId: nftMessage.universalTokenId,
                originalOwner: nftMessage.recipient,
                originalMetadataURI: nftMessage.metadataURI,
                timestamp: block.timestamp,
                exists: true
            });
        }
        
        emit NFTReceivedFromChain(
            nftMessage.universalTokenId,
            nftMessage.sourceChainId,
            nftMessage.recipient,
            existingTokenId > 0 ? existingTokenId : _tokenIdCounter.current() - 1,
            nftMessage.metadataURI
        );
    }

    function onRevert(RevertContext calldata revertContext) external onlyGateway {
        // Handle revert scenarios
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
`;

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
        // For now, let's use a pre-compiled bytecode approach
        // This is a simplified version that we can deploy directly
        
        console.log('📦 Deploying simplified Universal NFT contract...');
        
        // Simple ERC721 contract bytecode (we'll use a basic implementation)
        const contractFactory = new ethers.ContractFactory(
            // ABI
            [
                "constructor(address gatewayAddress, string memory name, string memory symbol)",
                "function name() view returns (string)",
                "function symbol() view returns (string)", 
                "function gateway() view returns (address)",
                "event NFTReceivedFromChain(bytes32 indexed universalTokenId, uint64 indexed sourceChainId, address indexed recipient, uint256 localTokenId, string metadataURI)"
            ],
            // Bytecode - we'll need to compile this properly
            "0x608060405234801561001057600080fd5b50604051610a38380380610a388339818101604052810190610032919061007a565b50505050610100565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6100a082610057565b810181811067ffffffffffffffff821117156100bf576100be610068565b5b80604052505050565b60006100d261003e565b90506100de8282610097565b919050565b600067ffffffffffffffff8211156100fe576100fd610068565b5b61010782610057565b9050602081019050919050565b60005b83811015610132578082015181840152602081019050610117565b83811115610141576000848401525b50505050565b600061015a610155846100e3565b6100c8565b90508281526020810184848401111561017657610175610052565b5b610181848285610114565b509392505050565b600082601f83011261019e5761019d61004d565b5b81516101ae848260208601610147565b91505092915050565b6000819050919050565b6101ca816101b7565b81146101d557600080fd5b50565b6000815190506101e7816101c1565b92915050565b60008060006060848603121561020657610205610048565b5b600084015167ffffffffffffffff81111561022457610223610048565b5b61023086828701610189565b935050602084015167ffffffffffffffff81111561025157610250610048565b5b61025d86828701610189565b925050604061026e868287016101d8565b9150509250925092565b610756806102876000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063116191b61461003b57806395d89b4114610059575b600080fd5b610043610077565b60405161005091906100d7565b60405180910390f35b61006161009b565b60405161006e919061015d565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000081565b606060018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101335780601f1061010857610100808354040283529160200191610133565b820191906000526020600020905b81548152906001019060200180831161011657829003601f168201915b5050505050905090565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610168826101dd565b9050919050565b6101788161015d565b82525050565b6000602082019050610193600083018461016f565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156101d35780820151818401526020810190506101b8565b838111156101e2576000848401525b50505050565b6000601f19601f8301169050919050565b600061020482610199565b61020e81856101a4565b935061021e8185602086016101b5565b610227816101e8565b840191505092915050565b6000602082019050818103600083015261024c81846101f9565b90509291505056fea2646970667358221220c4c5d2e8f9b3a1d7e6f4c3b2a1d9e8f7c6b5a4d3c2b1a9e8f7c6b5a4d3c2b164736f6c63430008130033",
            wallet
        );
        
        // For now, let's create a minimal deployment info since we can't compile the full contract
        const deploymentInfo = {
            network: 'testnet',
            chainId: ZETACHAIN_CONFIG.chainId,
            contractAddress: '0x' + '1'.repeat(40), // Placeholder
            deployerAddress: wallet.address,
            gateway: ZETACHAIN_CONFIG.gateway,
            deployedAt: new Date().toISOString(),
            status: 'pending_compilation'
        };
        
        console.log('⚠️ Contract compilation needed');
        console.log('📋 Using placeholder deployment for now');
        
        // Save deployment info
        const deploymentsDir = path.join(__dirname, 'deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        const deploymentPath = path.join(deploymentsDir, 'zetachain-testnet.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('💾 Deployment info saved to:', deploymentPath);
        
        return deploymentInfo;
        
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
        
        const deployment = await deployContract();
        
        if (deployment) {
            console.log('\n📋 Deployment Summary:');
            console.log('======================');
            console.log('Status:', deployment.status);
            console.log('Network:', deployment.network);
            console.log('Gateway:', deployment.gateway);
            console.log('Deployer:', deployment.deployerAddress);
        }
        
    } catch (error) {
        console.error('❌ Deployment process failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { deployContract, ZETACHAIN_CONFIG };