const { Connection, PublicKey, Keypair, Transaction, SystemProgram, ComputeBudgetProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function testNFTMinting() {
    console.log('🎨 Testing NFT Minting');
    console.log('=====================');
    
    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
        console.log('📋 Using program:', deploymentInfo.programId);
    } catch (error) {
        console.error('❌ Failed to load deployment info. Run deploy script first.');
        process.exit(1);
    }
    
    // Setup connection
    const connection = new Connection(RPC_URL, 'confirmed');
    const programId = new PublicKey(deploymentInfo.programId);
    const programStatePda = new PublicKey(deploymentInfo.programStatePda);
    
    // Load wallet
    let wallet;
    try {
        const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json'));
        wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
        console.log('👤 Wallet:', wallet.publicKey.toString());
    } catch (error) {
        console.error('❌ Failed to load wallet:', error.message);
        process.exit(1);
    }
    
    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Wallet balance:', balance / 1e9, 'SOL');
    
    if (balance < 0.05 * 1e9) {
        console.warn('⚠️ Low wallet balance. You may need more SOL.');
    }
    
    // Check program state
    console.log('🔍 Checking program state...');
    const programStateInfo = await connection.getAccountInfo(programStatePda);
    
    if (!programStateInfo) {
        console.error('❌ Program not initialized. Run initialize script first.');
        process.exit(1);
    }
    
    console.log('✅ Program is initialized');
    
    // Generate mint keypair
    const mint = Keypair.generate();
    console.log('🔑 Generated mint:', mint.publicKey.toString());
    
    // Calculate required PDAs
    const [mintAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        programId
    );
    
    const [nftOrigin] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_origin'), mint.publicKey.toBuffer()],
        programId
    );
    
    const tokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        wallet.publicKey
    );
    
    const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );
    
    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
            Buffer.from('edition'),
        ],
        METADATA_PROGRAM_ID
    );
    
    console.log('📍 Calculated accounts:');
    console.log('  Mint Authority:', mintAuthority.toString());
    console.log('  NFT Origin:', nftOrigin.toString());
    console.log('  Token Account:', tokenAccount.toString());
    console.log('  Metadata:', metadataAccount.toString());
    console.log('  Master Edition:', masterEditionAccount.toString());
    
    // Create mint instruction
    const mintNFTData = createMintNFTInstructionData(
        'Test Universal NFT',
        'TUNFT',
        'https://api.universalnft.io/metadata/test.json'
    );
    
    const mintInstruction = {
        programId: programId,
        keys: [
            { pubkey: programStatePda, isSigner: false, isWritable: true },
            { pubkey: mint.publicKey, isSigner: true, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: nftOrigin, isSigner: false, isWritable: true },
            { pubkey: metadataAccount, isSigner: false, isWritable: true },
            { pubkey: masterEditionAccount, isSigner: false, isWritable: true },
            { pubkey: mintAuthority, isSigner: false, isWritable: false },
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: false, isWritable: false }, // recipient
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
            { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: mintNFTData,
    };
    
    // Add compute budget instruction
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000,
    });
    
    // Create transaction
    const transaction = new Transaction()
        .add(computeBudgetIx)
        .add(mintInstruction);
    
    try {
        console.log('📝 Sending mint transaction...');
        const signature = await connection.sendTransaction(transaction, [wallet, mint]);
        console.log('📋 Transaction signature:', signature);
        
        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...');
        await connection.confirmTransaction(signature, 'confirmed');
        
        console.log('✅ NFT minted successfully!');
        console.log('🔗 Transaction:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        console.log('🎨 NFT Mint:', `https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`);
        
        // Verify mint
        console.log('🔍 Verifying mint...');
        const mintInfo = await connection.getAccountInfo(mint.publicKey);
        const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
        const nftOriginInfo = await connection.getAccountInfo(nftOrigin);
        
        console.log('✅ Verification results:');
        console.log('  Mint account:', mintInfo ? '✅ Created' : '❌ Not found');
        console.log('  Token account:', tokenAccountInfo ? '✅ Created' : '❌ Not found');
        console.log('  NFT Origin:', nftOriginInfo ? '✅ Created' : '❌ Not found');
        
        if (tokenAccountInfo) {
            try {
                const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
                console.log('  Token balance:', tokenBalance.value.uiAmount);
            } catch (error) {
                console.log('  Token balance: Could not fetch');
            }
        }
        
        // Save mint info
        const mintInfo_data = {
            mint: mint.publicKey.toString(),
            tokenAccount: tokenAccount.toString(),
            nftOrigin: nftOrigin.toString(),
            metadata: metadataAccount.toString(),
            masterEdition: masterEditionAccount.toString(),
            transaction: signature,
            name: 'Test Universal NFT',
            symbol: 'TUNFT',
            uri: 'https://api.universalnft.io/metadata/test.json',
            mintedAt: new Date().toISOString()
        };
        
        fs.writeFileSync('test-mint-result.json', JSON.stringify(mintInfo_data, null, 2));
        console.log('💾 Mint info saved to test-mint-result.json');
        
        return mintInfo_data;
        
    } catch (error) {
        console.error('❌ Mint failed:', error.message);
        
        // Try to get more details about the error
        if (error.logs) {
            console.log('📋 Transaction logs:');
            error.logs.forEach((log, index) => {
                console.log(`  ${index}: ${log}`);
            });
        }
        
        throw error;
    }
}

function createMintNFTInstructionData(name, symbol, uri) {
    // Use the correct mint_nft discriminator (snake_case from Rust code)
    const discriminator = Buffer.from('d33906a70fdb23fb', 'hex');
    
    const nameBuffer = Buffer.from(name, 'utf8');
    const symbolBuffer = Buffer.from(symbol, 'utf8');
    const uriBuffer = Buffer.from(uri, 'utf8');
    
    // Calculate total size
    const totalSize = 8 + 4 + nameBuffer.length + 4 + symbolBuffer.length + 4 + uriBuffer.length + 1;
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Write discriminator
    discriminator.copy(data, offset);
    offset += 8;
    
    // Write name (length + data)
    data.writeUInt32LE(nameBuffer.length, offset);
    offset += 4;
    nameBuffer.copy(data, offset);
    offset += nameBuffer.length;
    
    // Write symbol (length + data)
    data.writeUInt32LE(symbolBuffer.length, offset);
    offset += 4;
    symbolBuffer.copy(data, offset);
    offset += symbolBuffer.length;
    
    // Write URI (length + data)
    data.writeUInt32LE(uriBuffer.length, offset);
    offset += 4;
    uriBuffer.copy(data, offset);
    offset += uriBuffer.length;
    
    // Write creators option (None)
    data.writeUInt8(0, offset);
    
    console.log('🔧 Mint instruction data created:');
    console.log('  Size:', data.length, 'bytes');
    console.log('  Discriminator:', discriminator.toString('hex'));
    console.log('  Name:', name);
    console.log('  Symbol:', symbol);
    console.log('  URI:', uri);
    
    return data;
}

async function main() {
    try {
        const result = await testNFTMinting();
        
        console.log('\n🎉 NFT MINTING TEST COMPLETE!');
        console.log('=============================');
        console.log('Mint Address:', result.mint);
        console.log('Transaction:', result.transaction);
        console.log('Explorer:', `https://explorer.solana.com/address/${result.mint}?cluster=devnet`);
        
        console.log('\n📋 Next Steps:');
        console.log('1. Test frontend integration');
        console.log('2. Test cross-chain transfers');
        console.log('3. Deploy ZetaChain Universal App');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testNFTMinting };