const crypto = require('crypto');

function calculateDiscriminator(instruction) {
    const hash = crypto.createHash('sha256').update(`global:${instruction}`).digest('hex');
    return hash.substring(0, 16);
}

// Test all possible variations
const instructionVariations = [
    // From IDL (camelCase)
    'initialize',
    'mintNft',
    'transferCrossChain', 
    'receiveCrossChain',
    'onCall',
    'onRevert',
    'updateGateway',
    
    // snake_case versions
    'mint_nft',
    'transfer_cross_chain',
    'receive_cross_chain',
    'on_call',
    'on_revert',
    'update_gateway',
    
    // Other possible variations
    'mint_nft_simple',
    'mintNftSimple',
];

console.log('🧪 Testing All Discriminator Variations');
console.log('=======================================');

const discriminators = {};

instructionVariations.forEach(instruction => {
    const discriminator = calculateDiscriminator(instruction);
    discriminators[instruction] = discriminator;
    console.log(`${instruction.padEnd(20)}: ${discriminator}`);
});

console.log('\n📋 Organized by Function:');
console.log('=========================');

console.log('\n🔧 Initialize:');
console.log(`  initialize: ${discriminators.initialize}`);

console.log('\n🎨 Mint NFT:');
console.log(`  mintNft: ${discriminators.mintNft}`);
console.log(`  mint_nft: ${discriminators.mint_nft}`);
console.log(`  mintNftSimple: ${discriminators.mintNftSimple}`);
console.log(`  mint_nft_simple: ${discriminators.mint_nft_simple}`);

console.log('\n🌉 Transfer Cross Chain:');
console.log(`  transferCrossChain: ${discriminators.transferCrossChain}`);
console.log(`  transfer_cross_chain: ${discriminators.transfer_cross_chain}`);

console.log('\n📥 Receive Cross Chain:');
console.log(`  receiveCrossChain: ${discriminators.receiveCrossChain}`);
console.log(`  receive_cross_chain: ${discriminators.receive_cross_chain}`);

console.log('\n📞 On Call:');
console.log(`  onCall: ${discriminators.onCall}`);
console.log(`  on_call: ${discriminators.on_call}`);

console.log('\n🔄 On Revert:');
console.log(`  onRevert: ${discriminators.onRevert}`);
console.log(`  on_revert: ${discriminators.on_revert}`);

console.log('\n⚙️ Update Gateway:');
console.log(`  updateGateway: ${discriminators.updateGateway}`);
console.log(`  update_gateway: ${discriminators.update_gateway}`);

// Save to file for reference
const fs = require('fs');
fs.writeFileSync('all-discriminators.json', JSON.stringify(discriminators, null, 2));

console.log('\n💾 All discriminators saved to all-discriminators.json');

// Based on the IDL, the correct ones should be camelCase
console.log('\n🎯 RECOMMENDED DISCRIMINATORS (based on IDL):');
console.log('============================================');

const recommended = {
    initialize: discriminators.initialize,
    mintNft: discriminators.mintNft,
    transferCrossChain: discriminators.transferCrossChain,
    receiveCrossChain: discriminators.receiveCrossChain,
    onCall: discriminators.onCall,
    onRevert: discriminators.onRevert,
    updateGateway: discriminators.updateGateway,
};

Object.entries(recommended).forEach(([name, disc]) => {
    console.log(`  ${name}: ${disc}`);
});

fs.writeFileSync('recommended-discriminators.json', JSON.stringify(recommended, null, 2));
console.log('\n💾 Recommended discriminators saved to recommended-discriminators.json');

module.exports = { discriminators, recommended };