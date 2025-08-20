// Get the correct discriminator for mint_nft instruction
const crypto = require('crypto');

function getInstructionDiscriminator(namespace, name) {
  const preimage = `${namespace}:${name}`;
  return crypto.createHash('sha256').update(preimage).digest().slice(0, 8);
}

console.log('🔧 Getting correct instruction discriminators...');
console.log('================================================');

// Get discriminators for all instructions
const instructions = [
  'initialize',
  'mint_nft', 
  'transfer_cross_chain',
  'receive_cross_chain',
  'on_call',
  'on_revert',
  'update_gateway'
];

instructions.forEach(instruction => {
  const discriminator = getInstructionDiscriminator('global', instruction);
  console.log(`${instruction}: ${discriminator.toString('hex')}`);
});

console.log('\n🎯 For mint_nft specifically:');
const mintDiscriminator = getInstructionDiscriminator('global', 'mint_nft');
console.log('Hex:', mintDiscriminator.toString('hex'));
console.log('Array:', Array.from(mintDiscriminator));
console.log('Buffer:', `Buffer.from([${Array.from(mintDiscriminator).join(', ')}])`);

// Compare with what we're currently using
const currentDiscriminator = Buffer.from([0xaf, 0xaf, 0x6d, 0x1f, 0x0d, 0x98, 0x9b, 0xed]);
console.log('\n🔍 Comparison:');
console.log('Current (wrong):', currentDiscriminator.toString('hex'));
console.log('Correct:', mintDiscriminator.toString('hex'));
console.log('Match:', currentDiscriminator.equals(mintDiscriminator) ? '✅' : '❌');