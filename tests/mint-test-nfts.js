const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const bs58 = require('bs58');

// Your wallet details
const WALLET_ADDRESS = '';
const PRIVATE_KEY = '';

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Create keypair from private key
const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

// Initialize Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair));

// Test NFT data
const testNFTs = [
  {
    name: "Universal Cosmic #001",
    description: "A stunning cosmic NFT showcasing the beauty of universal interoperability. This NFT represents the first in a series of cross-chain digital art pieces.",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=800&fit=crop&crop=center",
    attributes: [
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Theme", value: "Cosmic" },
      { trait_type: "Color Scheme", value: "Purple Galaxy" },
      { trait_type: "Chain Origin", value: "Solana" },
      { trait_type: "Interoperability", value: "Universal" }
    ],
    symbol: "UNFT",
    sellerFeeBasisPoints: 500, // 5% royalty
  },
  {
    name: "Digital Dreams #042",
    description: "An abstract representation of digital consciousness in the Web3 era. This NFT embodies the spirit of decentralized creativity and cross-chain innovation.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop&crop=center",
    attributes: [
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Theme", value: "Abstract" },
      { trait_type: "Color Scheme", value: "Neon Dreams" },
      { trait_type: "Chain Origin", value: "Solana" },
      { trait_type: "Mood", value: "Ethereal" }
    ],
    symbol: "UNFT",
    sellerFeeBasisPoints: 250, // 2.5% royalty
  },
  {
    name: "Neon Genesis #777",
    description: "A vibrant cyberpunk-inspired artwork from the future of blockchain technology. This piece represents the convergence of art and decentralized finance.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop&crop=center",
    attributes: [
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Theme", value: "Cyberpunk" },
      { trait_type: "Color Scheme", value: "Electric Blue" },
      { trait_type: "Chain Origin", value: "Solana" },
      { trait_type: "Number", value: "777" },
      { trait_type: "Vibe", value: "Futuristic" }
    ],
    symbol: "UNFT",
    sellerFeeBasisPoints: 750, // 7.5% royalty
  },
  {
    name: "Quantum Bridge #001",
    description: "The first NFT in the Quantum Bridge collection, representing the seamless connection between different blockchain networks through ZetaChain's universal protocol.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop&crop=center",
    attributes: [
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Theme", value: "Quantum" },
      { trait_type: "Color Scheme", value: "Cosmic Blue" },
      { trait_type: "Chain Origin", value: "Solana" },
      { trait_type: "Bridge Type", value: "Universal" },
      { trait_type: "Protocol", value: "ZetaChain" }
    ],
    symbol: "UNFT",
    sellerFeeBasisPoints: 1000, // 10% royalty
  },
  {
    name: "Solana Sunset #888",
    description: "A beautiful sunset over the Solana blockchain, symbolizing the endless possibilities of decentralized applications and cross-chain interoperability.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop&crop=center",
    attributes: [
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Theme", value: "Nature" },
      { trait_type: "Color Scheme", value: "Sunset Orange" },
      { trait_type: "Chain Origin", value: "Solana" },
      { trait_type: "Time", value: "Golden Hour" },
      { trait_type: "Mood", value: "Peaceful" }
    ],
    symbol: "UNFT",
    sellerFeeBasisPoints: 300, // 3% royalty
  }
];

async function mintNFT(nftData, index) {
  try {
    console.log(`\n🎨 Minting NFT ${index + 1}/5: ${nftData.name}`);
    console.log(`📝 Description: ${nftData.description.substring(0, 100)}...`);
    
    // Create metadata object
    const metadata = {
      name: nftData.name,
      description: nftData.description,
      image: nftData.image,
      attributes: nftData.attributes,
    };

    // Upload metadata and mint NFT
    const { nft } = await metaplex.nfts().create({
      name: nftData.name,
      symbol: nftData.symbol,
      uri: nftData.image, // For now using image URL, in production you'd upload metadata to IPFS
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      creators: [
        {
          address: keypair.publicKey,
          verified: true,
          share: 100,
        },
      ],
      isMutable: true,
    });

    console.log(`✅ Successfully minted: ${nftData.name}`);
    console.log(`🔗 Mint Address: ${nft.address.toString()}`);
    console.log(`🖼️  Image: ${nftData.image}`);
    console.log(`💎 Attributes: ${nftData.attributes.length} traits`);
    
    return nft;
  } catch (error) {
    console.error(`❌ Failed to mint ${nftData.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Universal NFT Minting Script');
  console.log('================================');
  console.log(`💳 Wallet: ${WALLET_ADDRESS}`);
  console.log(`🌐 Network: Solana Devnet`);
  console.log(`📦 NFTs to mint: ${testNFTs.length}`);
  
  // Check wallet balance
  try {
    const balance = await connection.getBalance(keypair.publicKey);
    const solBalance = balance / 1e9;
    console.log(`💰 Wallet Balance: ${solBalance.toFixed(4)} SOL`);
    
    if (solBalance < 0.1) {
      console.log('⚠️  Low balance! You might need more devnet SOL.');
      console.log('💡 Get devnet SOL from: https://faucet.solana.com/');
    }
  } catch (error) {
    console.error('❌ Failed to check balance:', error.message);
  }
  
  console.log('\n🎯 Starting minting process...\n');
  
  const mintedNFTs = [];
  
  // Mint each NFT with a delay to avoid rate limits
  for (let i = 0; i < testNFTs.length; i++) {
    const nft = await mintNFT(testNFTs[i], i);
    if (nft) {
      mintedNFTs.push(nft);
    }
    
    // Add delay between mints to avoid rate limiting
    if (i < testNFTs.length - 1) {
      console.log('⏳ Waiting 3 seconds before next mint...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 Minting Complete!');
  console.log('===================');
  console.log(`✅ Successfully minted: ${mintedNFTs.length}/${testNFTs.length} NFTs`);
  
  if (mintedNFTs.length > 0) {
    console.log('\n📋 Minted NFT Addresses:');
    mintedNFTs.forEach((nft, index) => {
      console.log(`${index + 1}. ${nft.name}: ${nft.address.toString()}`);
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Restart your frontend dev server');
    console.log('2. Connect your Phantom wallet (set to Devnet)');
    console.log('3. Your new NFTs should appear in the gallery!');
    console.log('\n🌐 View your NFTs on Solana Explorer:');
    mintedNFTs.forEach((nft) => {
      console.log(`https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    });
  }
}

// Run the script
main().catch(console.error);