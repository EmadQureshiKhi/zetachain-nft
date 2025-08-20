const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');

async function debugMintSimple() {
    console.log('🔍 Debug: Simple Mint Test');
    console.log('==========================');

    // Setup connection
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load program
    const programId = new PublicKey('H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC');
    
    // Load payer
    const payerKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(require('fs').readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
    );
    
    console.log('💳 Payer:', payerKeypair.publicKey.toString());
    
    // Generate new mint
    const mintKeypair = Keypair.generate();
    console.log('🔑 Mint:', mintKeypair.publicKey.toString());
    
    // Calculate PDAs
    const [programState] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        programId
    );
    
    const [mintAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        programId
    );
    
    const [nftOrigin] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_origin'), mintKeypair.publicKey.toBuffer()],
        programId
    );
    
    // Get associated token account
    const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        payerKeypair.publicKey
    );
    
    // Calculate metadata accounts
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    
    const [metadata] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    
    const [masterEdition] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
            Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log('\n📍 Calculated Accounts:');
    console.log('Program State:', programState.toString());
    console.log('Mint Authority:', mintAuthority.toString());
    console.log('NFT Origin:', nftOrigin.toString());
    console.log('Token Account:', tokenAccount.toString());
    console.log('Metadata:', metadata.toString());
    console.log('Master Edition:', masterEdition.toString());
    
    // Check if program state exists
    try {
        const programStateAccount = await connection.getAccountInfo(programState);
        if (!programStateAccount) {
            console.log('❌ Program state not initialized!');
            return;
        }
        console.log('✅ Program state exists');
    } catch (error) {
        console.log('❌ Error checking program state:', error.message);
        return;
    }
    
    // Create minimal instruction data with just the discriminator
    const discriminator = Buffer.from([211, 57, 6, 167, 15, 219, 35, 251]); // mint_nft discriminator
    
    // Minimal NFT data
    const name = "Test NFT";
    const symbol = "TEST";
    const uri = "https://example.com/metadata.json";
    
    // Serialize the instruction data
    const nameBuffer = Buffer.from(name, 'utf8');
    const symbolBuffer = Buffer.from(symbol, 'utf8');
    const uriBuffer = Buffer.from(uri, 'utf8');
    
    // Use proper Borsh serialization format
    const instructionData = Buffer.concat([
        discriminator,
        // String serialization: length (u32 LE) + bytes
        Buffer.from([nameBuffer.length, 0, 0, 0]),
        nameBuffer,
        Buffer.from([symbolBuffer.length, 0, 0, 0]),
        symbolBuffer,
        Buffer.from([uriBuffer.length, 0, 0, 0]),
        uriBuffer,
        Buffer.from([0]), // Option<Vec<Creator>> = None (0)
    ]);
    
    console.log('Raw instruction data:', instructionData.toString('hex'));
    
    console.log('\n🔧 Instruction Details:');
    console.log('Discriminator:', discriminator.toString('hex'));
    console.log('Instruction data size:', instructionData.length);
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('URI:', uri);
    
    // Create transaction
    const instruction = {
        programId,
        keys: [
            { pubkey: programState, isSigner: false, isWritable: true },
            { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: nftOrigin, isSigner: false, isWritable: true },
            { pubkey: metadata, isSigner: false, isWritable: true },
            { pubkey: masterEdition, isSigner: false, isWritable: true },
            { pubkey: mintAuthority, isSigner: false, isWritable: false },
            { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: payerKeypair.publicKey, isSigner: false, isWritable: false }, // recipient
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: instructionData,
    };
    
    const transaction = new anchor.web3.Transaction();
    
    // Add compute budget
    transaction.add(
        anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
            units: 400_000,
        })
    );
    
    transaction.add(instruction);
    
    // Simulate transaction
    console.log('\n🔍 Simulating transaction...');
    try {
        const simulation = await connection.simulateTransaction(transaction, [payerKeypair, mintKeypair]);
        
        if (simulation.value.err) {
            console.log('Simulation result: ❌ FAILED');
            console.log('\n📋 Program Logs:');
            if (simulation.value.logs) {
                simulation.value.logs.forEach((log, index) => {
                    console.log(`${index + 1}. ${log}`);
                });
            }
            console.log('❌ Error:', simulation.value.err);
        } else {
            console.log('Simulation result: ✅ SUCCESS');
            console.log('✅ Transaction would succeed!');
        }
    } catch (error) {
        console.log('❌ Simulation error:', error.message);
    }
}

debugMintSimple().catch(console.error);