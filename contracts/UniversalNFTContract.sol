// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import "@zetachain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Counters.sol is deprecated, we'll use a simple uint256 counter instead

/**
 * @title UniversalNFTContract
 * @dev Universal NFT contract on ZetaChain that can receive NFTs from Solana
 * and mint them as ERC721 tokens, then transfer to other EVM chains
 */
contract UniversalNFTContract is ERC721, ERC721URIStorage, Ownable, UniversalContract {
    IGatewayZEVM public immutable gateway;
    uint256 private _tokenIdCounter;
    
    // Mapping from universal token ID to local token ID
    mapping(bytes32 => uint256) public universalToLocal;
    // Mapping from local token ID to universal token ID
    mapping(uint256 => bytes32) public localToUniversal;
    // Mapping to track NFT origins
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
    error InvalidChainId();

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
        _tokenIdCounter = 1; // Start from token ID 1
    }

    /**
     * @dev Called by ZetaChain gateway when receiving cross-chain calls
     * This handles NFTs coming from Solana or other chains
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        // Decode the cross-chain NFT message
        CrossChainNFTMessage memory nftMessage = abi.decode(message, (CrossChainNFTMessage));
        
        // Validate the message
        if (nftMessage.universalTokenId == bytes32(0)) revert InvalidMessage();
        if (nftMessage.recipient == address(0)) revert InvalidMessage();
        
        // Check if this NFT already exists on ZetaChain
        uint256 existingTokenId = universalToLocal[nftMessage.universalTokenId];
        
        if (existingTokenId > 0) {
            // NFT returning to ZetaChain - transfer to new recipient
            _transfer(ownerOf(existingTokenId), nftMessage.recipient, existingTokenId);
        } else {
            // New NFT arriving on ZetaChain - mint it
            uint256 newTokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(nftMessage.recipient, newTokenId);
            _setTokenURI(newTokenId, nftMessage.metadataURI);
            
            // Store mappings
            universalToLocal[nftMessage.universalTokenId] = newTokenId;
            localToUniversal[newTokenId] = nftMessage.universalTokenId;
            
            // Store origin information
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
            existingTokenId > 0 ? existingTokenId : _tokenIdCounter - 1,
            nftMessage.metadataURI
        );
    }

    /**
     * @dev Transfer NFT to another chain via ZetaChain gateway
     */
    function transferToChain(
        uint256 tokenId,
        address zrc20,
        uint64 destinationChainId,
        address recipient,
        uint256 gasLimit
    ) external payable {
        // Verify ownership
        if (ownerOf(tokenId) != msg.sender) revert Unauthorized();
        
        // Get universal token ID
        bytes32 universalTokenId = localToUniversal[tokenId];
        if (universalTokenId == bytes32(0)) revert NFTNotFound();
        
        // Get NFT metadata
        string memory metadataURI = tokenURI(tokenId);
        NFTOrigin memory origin = nftOrigins[universalTokenId];
        
        // Burn the NFT on ZetaChain
        _burn(tokenId);
        
        // Prepare cross-chain message
        CrossChainNFTMessage memory message = CrossChainNFTMessage({
            universalTokenId: universalTokenId,
            sourceChainId: 7001, // ZetaChain testnet ID
            destinationChainId: destinationChainId,
            recipient: recipient,
            name: name(),
            symbol: symbol(),
            metadataURI: metadataURI,
            timestamp: block.timestamp
        });
        
        bytes memory encodedMessage = abi.encode(message);
        
        // Call gateway to send to destination chain
        gateway.withdrawAndCall(
            abi.encodePacked(recipient),
            0, // No token amount for NFT transfer
            zrc20,
            encodedMessage,
            CallOptions({
                gasLimit: gasLimit,
                isArbitraryCall: false
            }),
            RevertOptions({
                revertAddress: msg.sender,
                callOnRevert: true,
                abortAddress: msg.sender,
                revertMessage: abi.encodePacked("NFT_TRANSFER_REVERT:", universalTokenId),
                onRevertGasLimit: 100000
            })
        );
        
        emit NFTSentToChain(universalTokenId, destinationChainId, msg.sender, tokenId);
    }

    /**
     * @dev Handle revert scenarios - re-mint NFT if transfer fails
     */
    function onRevert(RevertContext calldata revertContext) external onlyGateway {
        // Parse revert message to get universal token ID
        bytes memory revertMessage = revertContext.revertMessage;
        if (revertMessage.length >= 36) { // "NFT_TRANSFER_REVERT:" + 32 bytes
            bytes32 universalTokenId;
            assembly {
                universalTokenId := mload(add(revertMessage, 52)) // Skip prefix + length
            }
            
            // Re-mint the NFT if it exists in our records
            NFTOrigin memory origin = nftOrigins[universalTokenId];
            if (origin.exists) {
                uint256 newTokenId = _tokenIdCounter;
                _tokenIdCounter++;
                
                _safeMint(origin.originalOwner, newTokenId);
                _setTokenURI(newTokenId, origin.originalMetadataURI);
                
                // Update mappings
                universalToLocal[universalTokenId] = newTokenId;
                localToUniversal[newTokenId] = universalTokenId;
            }
        }
    }

    /**
     * @dev Get NFT origin information
     */
    function getNFTOrigin(bytes32 universalTokenId) external view returns (NFTOrigin memory) {
        return nftOrigins[universalTokenId];
    }

    /**
     * @dev Get universal token ID from local token ID
     */
    function getUniversalTokenId(uint256 tokenId) external view returns (bytes32) {
        return localToUniversal[tokenId];
    }

    /**
     * @dev Get local token ID from universal token ID
     */
    function getLocalTokenId(bytes32 universalTokenId) external view returns (uint256) {
        return universalToLocal[universalTokenId];
    }

    /**
     * @dev Check if NFT exists on this chain
     */
    function nftExists(bytes32 universalTokenId) external view returns (bool) {
        return universalToLocal[universalTokenId] > 0;
    }

    // Override required by Solidity
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