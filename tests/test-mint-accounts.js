const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');

async function testMintAccounts() {
  console.log('🧪 Testing Mint Account Structure');
  console.log('=================================');

  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new PublicKey('H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC');
    const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    
    // Generate test mint
    const mint = Keypair.generate();
    const payer = new PublicKey('GjyjvJLfrNxT5FdzruCiSRK1xDqmnJHYdAxiahbyxc29'); // Your wallet
    
    console.log('🔑 Test mint:', mint.publicKey.toString());
    console.log('💳 Payer:', payer.toString());
    
    // Calculate all PDAs
    const [programStatePDA, programStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      programId
    );
    
    const [mintAuthority, mintAuthorityBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_authority')],
      programId
    );
    
    const [nftOrigin, nftOriginBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('nft_origin'), mint.publicKey.toBuffer()],
      programId
    );
    
    const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, payer);
    
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgramId.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      metadataProgramId
    );
    
    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgramId.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from('edition'),
      ],
      metadataProgramId
    );
    
    console.log('\n📍 Account Structure:');
    console.log('1. Program State PDA:', programStatePDA.toString(), `(bump: ${programStateBump})`);
    console.log('2. Mint:', mint.publicKey.toString(), '(signer: true, writable: true)');
    console.log('3. Token Account:', tokenAccount.toString(), '(writable: true)');
    console.log('4. NFT Origin:', nftOrigin.toString(), `(bump: ${nftOriginBump})`);
    console.log('5. Metadata:', metadataAccount.toString(), '(writable: true)');
    console.log('6. Master Edition:', masterEditionAccount.toString(), '(writable: true)');
    console.log('7. Mint Authority:', mintAuthority.toString(), `(bump: ${mintAuthorityBump})`);
    console.log('8. Payer:', payer.toString(), '(signer: true, writable: true)');
    console.log('9. Recipient:', payer.toString(), '(writable: false)');
    
    console.log('\n🔧 Program IDs:');
    console.log('- Token Program:', 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    console.log('- Associated Token Program:', 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    console.log('- System Program:', '11111111111111111111111111111112');
    console.log('- Rent Sysvar:', 'SysvarRent111111111111111111111111111111111');
    console.log('- Metadata Program:', metadataProgramId.toString());
    
    // Check if accounts exist (they shouldn't for a new mint)
    console.log('\n🔍 Account Existence Check:');
    
    const mintInfo = await connection.getAccountInfo(mint.publicKey);
    console.log('Mint exists:', mintInfo ? '❌ YES (should be NO)' : '✅ NO');
    
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
    console.log('Token Account exists:', tokenAccountInfo ? '❌ YES (should be NO)' : '✅ NO');
    
    const nftOriginInfo = await connection.getAccountInfo(nftOrigin);
    console.log('NFT Origin exists:', nftOriginInfo ? '❌ YES (should be NO)' : '✅ NO');
    
    const metadataInfo = await connection.getAccountInfo(metadataAccount);
    console.log('Metadata exists:', metadataInfo ? '❌ YES (should be NO)' : '✅ NO');
    
    const masterEditionInfo = await connection.getAccountInfo(masterEditionAccount);
    console.log('Master Edition exists:', masterEditionInfo ? '❌ YES (should be NO)' : '✅ NO');
    
    // Check program state
    const programStateInfo = await connection.getAccountInfo(programStatePDA);
    console.log('Program State exists:', programStateInfo ? '✅ YES' : '❌ NO (required)');
    
    console.log('\n✅ Account structure analysis complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMintAccounts();