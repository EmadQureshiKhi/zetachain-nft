const { PublicKey } = require('@solana/web3.js');

const programId = new PublicKey('89BWBddtdbMriDFjotkPyzDvcehdJaZMvPYU1LifVjRc');

// Calculate Program State PDA
const [programStatePda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    programId
);

console.log('Program ID:', programId.toString());
console.log('Program State PDA:', programStatePda.toString());
console.log('Bump:', bump);

// Update deployment info
const fs = require('fs');
const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
deploymentInfo.programStatePda = programStatePda.toString();
deploymentInfo.bump = bump;

fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
console.log('✅ Updated deployment-info.json');