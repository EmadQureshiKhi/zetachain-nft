// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleUniversalNFT
 * @dev A simplified Universal NFT contract for ZetaChain
 * This version focuses on basic NFT functionality without complex cross-chain features
 */
contract SimpleUniversalNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    address public gateway;
    
    // Mapping from universal token ID to local token ID
    mapping(bytes32 => uint256) public universalToLocal;
    // Mapping from local token ID to universal token ID
    mapping(uint256 => bytes32) public localToUniversal;
    
    struct NFTOrigin {
        uint64 sourceChainId;
        bytes32 universalTokenId;
        address originalOwner;
        string originalMetadataURI;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(bytes32 => NFTOrigin) public nftOrigins;

    event NFTMinted(
        uint256 indexed tokenId,
        bytes32 indexed universalTokenId,
        address indexed recipient,
        string metadataURI
    );

    event NFTReceivedFromChain(
        bytes32 indexed universalTokenId,
        uint64 indexed sourceChainId,
        address indexed recipient,
        uint256 localTokenId,
        string metadataURI
    );

    constructor(
        address gatewayAddress,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable() {
        gateway = gatewayAddress;
        _tokenIdCounter = 1; // Start from token ID 1
    }

    /**
     * @dev Mint a new NFT
     */
    function mintNFT(
        address recipient,
        string memory metadataURI,
        bytes32 universalTokenId
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Store mappings
        universalToLocal[universalTokenId] = tokenId;
        localToUniversal[tokenId] = universalTokenId;
        
        // Store origin information
        nftOrigins[universalTokenId] = NFTOrigin({
            sourceChainId: 7001, // ZetaChain testnet
            universalTokenId: universalTokenId,
            originalOwner: recipient,
            originalMetadataURI: metadataURI,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit NFTMinted(tokenId, universalTokenId, recipient, metadataURI);
        
        return tokenId;
    }

    /**
     * @dev Receive NFT from another chain (simplified version)
     */
    function receiveFromChain(
        bytes32 universalTokenId,
        uint64 sourceChainId,
        address recipient,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        // Check if this NFT already exists on ZetaChain
        uint256 existingTokenId = universalToLocal[universalTokenId];
        
        if (existingTokenId > 0) {
            // NFT returning to ZetaChain - transfer to new recipient
            _transfer(ownerOf(existingTokenId), recipient, existingTokenId);
            return existingTokenId;
        } else {
            // New NFT arriving on ZetaChain - mint it
            uint256 newTokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(recipient, newTokenId);
            _setTokenURI(newTokenId, metadataURI);
            
            // Store mappings
            universalToLocal[universalTokenId] = newTokenId;
            localToUniversal[newTokenId] = universalTokenId;
            
            // Store origin information
            nftOrigins[universalTokenId] = NFTOrigin({
                sourceChainId: sourceChainId,
                universalTokenId: universalTokenId,
                originalOwner: recipient,
                originalMetadataURI: metadataURI,
                timestamp: block.timestamp,
                exists: true
            });
            
            emit NFTReceivedFromChain(
                universalTokenId,
                sourceChainId,
                recipient,
                newTokenId,
                metadataURI
            );
            
            return newTokenId;
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

    /**
     * @dev Get total supply of NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
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