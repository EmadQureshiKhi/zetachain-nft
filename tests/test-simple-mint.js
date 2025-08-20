const { Connection, PublicKey, Keypair, Transaction, SystemProgram, ComputeBudgetProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function testSimpleMint() {
    console.log('🎨 Testing Simple NFT Mint');
    console.log('==========================');
    
    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
    const connection = new Connection(RPC_URL, 'confirmed');
    const programId = new PublicKey(deploymentInfo.programId);
    const programStatePda = new PublicKey(deploymentInfo.programStatePda);
    
    // Load wallet
    const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    
    console.log('👤 Wallet:', wallet.publicKey.toString());
    console.log('🆔 Program:', programId.toString());
    console.log('📊 Program State:', programStatePda.toString());
    
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
    
    console.log('📍 Accounts:');
    console.log('  Mint Authority:', mintAuthority.toString());
    console.log('  NFT Origin:', nftOrigin.toString());
    console.log('  Token Account:', tokenAccount.toString());
    console.log('  Metadata:', metadataAccount.toString());
    console.log('  Master Edition:', masterEditionAccount.toString());
    
    // Create instruction data with proper Anchor serialization
    const instructionData = createAnchorInstructionData(
        'Test NFT',
        'TEST',
        'https://example.com/test.json'
    );
    
    console.log('🔧 Instruction data:', instructionData.length, 'bytes');
    console.log('   Discriminator:', instructionData.slice(0, 8).toString('hex'));
    
    // Create instruction
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
        data: instructionData,
    };
    
    // Create transaction
    const transaction = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
        .add(mintInstruction);
    
    try {
        console.log('📝 Simulating transaction...');
        const simulation = await connection.simulateTransaction(transaction, [wallet, mint]);
        
        if (simulation.value.err) {
            console.log('❌ Simulation failed:', simulation.value.err);
            console.log('📋 Logs:');
            simulation.value.logs?.forEach((log, i) => {
                console.log(`  ${i}: ${log}`);
            });
        } else {
            console.log('✅ Simulation successful!');
            console.log('📋 Logs:');
            simulation.value.logs?.forEach((log, i) => {
                console.log(`  ${i}: ${log}`);
            });
            
            // If simulation passes, try sending the transaction
            console.log('\n📝 Sending transaction...');
            const signature = await connection.sendTransaction(transaction, [wallet, mint]);
            console.log('✅ Transaction sent:', signature);
            
            // Wait for confirmation
            await connection.confirmTransaction(signature, 'confirmed');
            console.log('✅ Transaction confirmed!');
            
            return {
                mint: mint.publicKey.toString(),
                transaction: signature,
                success: true
            };
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.logs) {
            console.log('📋 Error logs:');
            error.logs.forEach((log, i) => {
                console.log(`  ${i}: ${log}`);
            });
        }
    }
}

function createAnchorInstructionData(name, symbol, uri) {
    // Use the correct discriminator for mint_nft (snake_case)
    const discriminator = Buffer.from('d33906a70fdb23fb', 'hex');
    
    // Anchor serialization format for the parameters:
    // - String: 4 bytes length + UTF-8 bytes
    // - Option<T>: 1 byte (0 = None, 1 = Some) + T if Some
    
    const nameBytes = Buffer.from(name, 'utf8');
    const symbolBytes = Buffer.from(symbol, 'utf8');
    const uriBytes = Buffer.from(uri, 'utf8');
    
    // Calculate total size
    const totalSize = 8 + // discriminator
                     4 + nameBytes.length + // name
                     4 + symbolBytes.length + // symbol  
                     4 + uriBytes.length + // uri
                     1; // Option<Vec<Creator>> = None
    
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Write discriminator
    discriminator.copy(data, offset);
    offset += 8;
    
    // Write name (4 bytes length + data)
    data.writeUInt32LE(nameBytes.length, offset);
    offset += 4;
    nameBytes.copy(data, offset);
    offset += nameBytes.length;
    
    // Write symbol (4 bytes length + data)
    data.writeUInt32LE(symbolBytes.length, offset);
    offset += 4;
    symbolBytes.copy(data, offset);
    offset += symbolBytes.length;
    
    // Write uri (4 bytes length + data)
    data.writeUInt32LE(uriBytes.length, offset);
    offset += 4;
    uriBytes.copy(data, offset);
    offset += uriBytes.length;
    
    // Write Option<Vec<Creator>> = None
    data.writeUInt8(0, offset); // 0 = None
    
    console.log('🔧 Anchor instruction data:');
    console.log('  Total size:', data.length);
    console.log('  Name length:', nameBytes.length);
    console.log('  Symbol length:', symbolBytes.length);
    console.log('  URI length:', uriBytes.length);
    
    return data;
}

async function main() {
    try {
        const result = await testSimpleMint();
        if (result && result.success) {
            console.log('\n🎉 SUCCESS!');
            console.log('Mint:', result.mint);
            console.log('Transaction:', result.transaction);
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testSimpleMint };