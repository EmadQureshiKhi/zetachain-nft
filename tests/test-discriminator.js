const crypto = require('crypto');

function calculateDiscriminator(instruction) {
    const hash = crypto.createHash('sha256').update(`global:${instruction}`).digest('hex');
    return hash.substring(0, 16);
}

// Test both camelCase and snake_case
const instructions = [
    'mintNft',      // camelCase (from IDL)
    'mint_nft',     // snake_case (what we calculated)
];

console.log('🧪 Testing Discriminators:');
instructions.forEach(instruction => {
    const discriminator = calculateDiscriminator(instruction);
    console.log(`  ${instruction}: ${discriminator}`);
});

// The correct one should be camelCase based on the IDL
console.log('\n✅ Correct discriminator for mintNft:', calculateDiscriminator('mintNft'));