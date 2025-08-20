const anchor = require('@coral-xyz/anchor');
const { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

async function testAnchorMint() {
    console.log('🎨 Testing Anchor NFT Mint');
    console.log('==========================');
    
    try {
        // Load deployment info
        const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
        const programId = new PublicKey(deploymentInfo.programId);
        const programStatePda = new PublicKey(deploymentInfo.programStatePda);
        
        console.log('👤 Program ID:', programId.toString());
        console.log('📊 Program State PDA:', programStatePda.toString());
        
        // Setup connection and provider
        const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
        
        // Load wallet from file
        const walletKeypair = Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf8')))
        );
        const wallet = new anchor.Wallet(walletKeypair);
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);
        
        console.log('👤 Wallet:', wallet.publicKey.toString());
        
        // Load IDL
        const idl = JSON.parse(fs.readFileSync('target/idl/universal_nft.json', 'utf8'));
        const program = new anchor.Program(idl, programId, provider);
        
        console.log('✅ Program loaded successfully');
        
        // Generate mint keypair
        const mint = Keypair.generate();
        console.log('🔑 Mint:', mint.publicKey.toString());
        
        // Calculate PDAs
        const [mintAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from('mint_authority')],
            programId
        );
        
        const [nftOrigin] = PublicKey.findProgramAddressSync(
            [Buffer.from('nft_origin'), mint.publicKey.toBuffer()],
            programId
        );
        
        // Get associated token account
        const tokenAccount = await getAssociatedTokenAddress(
            mint.publicKey,
            wallet.publicKey
        );
        
        // Calculate metadata and master edition PDAs
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
        
        const [metadata] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );
        
        const [masterEdition] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.publicKey.toBuffer(),
                Buffer.from('edition'),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );
        
        console.log('📍 Calculated accounts:');
        console.log('  Mint Authority:', mintAuthority.toString());
        console.log('  NFT Origin:', nftOrigin.toString());
        console.log('  Token Account:', tokenAccount.toString());
        console.log('  Metadata:', metadata.toString());
        console.log('  Master Edition:', masterEdition.toString());
        
        // Test parameters
        const name = 'Test NFT';
        const symbol = 'TEST';
        const uri = 'https://test.com/metadata.json';
        
        console.log('📝 Calling mintNft instruction...');
        
        // Call the mint function
        const tx = await program.methods
            .mintNft(name, symbol, uri, null)
            .accounts({
                programState: programStatePda,
                mint: mint.publicKey,
                tokenAccount: tokenAccount,
                nftOrigin: nftOrigin,
                metadata: metadata,
                masterEdition: masterEdition,
                mintAuthority: mintAuthority,
                payer: wallet.publicKey,
                recipient: wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            })
            .signers([mint])
            .rpc();
        
        console.log('✅ NFT minted successfully!');
        console.log('🔗 Transaction:', tx);
        console.log('🎨 Mint:', mint.publicKey.toString());
        console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        
        return {
            success: true,
            mint: mint.publicKey.toString(),
            transaction: tx
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        
        if (error.logs) {
            console.log('📋 Transaction logs:');
            error.logs.forEach((log, i) => {
                console.log(`  ${i}: ${log}`);
            });
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

async function main() {
    const result = await testAnchorMint();
    
    if (result.success) {
        console.log('\n🎉 SUCCESS! NFT minted using Anchor');
        
        // Save result
        fs.writeFileSync('test-mint-result.json', JSON.stringify(result, null, 2));
        console.log('💾 Result saved to test-mint-result.json');
    } else {
        console.log('\n❌ FAILED! Could not mint NFT');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testAnchorMint };