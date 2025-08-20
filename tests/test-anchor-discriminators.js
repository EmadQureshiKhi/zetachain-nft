const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Program, AnchorProvider, Wallet, BN } = require('@coral-xyz/anchor');
const fs = require('fs');

// Load IDL
const idl = JSON.parse(fs.readFileSync('target/idl/universal_nft.json', 'utf8'));

async function testAnchorDiscriminators() {
    console.log('🧪 Testing Anchor Discriminators');
    console.log('================================');
    
    // Setup connection and provider
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new PublicKey('CvPTmWRGRpwYLYg9hCr4eiviB8uoZCtJTGLzngBhmGhn');
    
    // Create a dummy wallet for the provider
    const dummyKeypair = Keypair.generate();
    const wallet = new Wallet(dummyKeypair);
    const provider = new AnchorProvider(connection, wallet, {});
    
    // Create program instance
    const program = new Program(idl, programId, provider);
    
    console.log('📋 Program Instructions from IDL:');
    idl.instructions.forEach((instruction, index) => {
        console.log(`  ${index + 1}. ${instruction.name}`);
    });
    
    console.log('\n🔧 Testing Discriminator Generation:');
    
    // Test each instruction to get the correct discriminator
    const instructions = [
        'initialize',
        'mintNft', 
        'transferCrossChain',
        'receiveCrossChain',
        'onCall',
        'onRevert',
        'updateGateway'
    ];
    
    const discriminators = {};
    
    for (const instructionName of instructions) {
        try {
            // Try to access the instruction method to trigger discriminator calculation
            if (program.methods[instructionName]) {
                // Get the discriminator by accessing the instruction's discriminator
                const methodBuilder = program.methods[instructionName];
                
                // For Anchor, we can calculate discriminators manually
                const crypto = require('crypto');
                const hash = crypto.createHash('sha256')
                    .update(`global:${instructionName}`)
                    .digest();
                const discriminator = hash.slice(0, 8).toString('hex');
                
                discriminators[instructionName] = discriminator;
                console.log(`  ✅ ${instructionName}: ${discriminator}`);
            } else {
                console.log(`  ❌ ${instructionName}: Method not found`);
            }
        } catch (error) {
            console.log(`  ❌ ${instructionName}: Error - ${error.message}`);
        }
    }
    
    console.log('\n📊 Complete Discriminator Map:');
    console.log('==============================');
    Object.entries(discriminators).forEach(([name, disc]) => {
        console.log(`"${name}": "${disc}",`);
    });
    
    // Test specific instruction building
    console.log('\n🧪 Testing Instruction Building:');
    console.log('================================');
    
    try {
        // Test mintNft instruction building
        const testMint = Keypair.generate();
        const testRecipient = Keypair.generate();
        
        // Calculate required PDAs
        const [programState] = PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            programId
        );
        
        const [mintAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from('mint_authority')],
            programId
        );
        
        const [nftOrigin] = PublicKey.findProgramAddressSync(
            [Buffer.from('nft_origin'), testMint.publicKey.toBuffer()],
            programId
        );
        
        console.log('📍 Test PDAs calculated:');
        console.log(`  Program State: ${programState.toString()}`);
        console.log(`  Mint Authority: ${mintAuthority.toString()}`);
        console.log(`  NFT Origin: ${nftOrigin.toString()}`);
        
        // Try to build a mintNft instruction
        const mintNftIx = await program.methods
            .mintNft(
                "Test NFT",
                "TEST", 
                "https://example.com/test.json",
                null
            )
            .accounts({
                programState: programState,
                mint: testMint.publicKey,
                tokenAccount: testRecipient.publicKey, // Simplified for test
                nftOrigin: nftOrigin,
                metadata: testRecipient.publicKey, // Simplified for test
                masterEdition: testRecipient.publicKey, // Simplified for test
                mintAuthority: mintAuthority,
                payer: dummyKeypair.publicKey,
                recipient: testRecipient.publicKey,
                tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
                systemProgram: new PublicKey('11111111111111111111111111111111'),
                rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
                tokenMetadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
            })
            .instruction();
            
        console.log('✅ mintNft instruction built successfully');
        console.log(`   Data length: ${mintNftIx.data.length} bytes`);
        console.log(`   Discriminator: ${mintNftIx.data.slice(0, 8).toString('hex')}`);
        
        // Save the correct discriminator
        discriminators.mintNft_actual = mintNftIx.data.slice(0, 8).toString('hex');
        
    } catch (error) {
        console.log(`❌ Failed to build mintNft instruction: ${error.message}`);
    }
    
    // Save discriminators to file
    fs.writeFileSync('discriminators.json', JSON.stringify(discriminators, null, 2));
    console.log('\n💾 Discriminators saved to discriminators.json');
    
    return discriminators;
}

// Manual discriminator calculation for verification
function calculateManualDiscriminator(instruction) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(`global:${instruction}`).digest('hex');
    return hash.substring(0, 16);
}

async function main() {
    try {
        const discriminators = await testAnchorDiscriminators();
        
        console.log('\n🔍 Manual vs Anchor Comparison:');
        console.log('===============================');
        
        const instructions = ['initialize', 'mintNft', 'transferCrossChain'];
        
        instructions.forEach(instruction => {
            const manual = calculateManualDiscriminator(instruction);
            const anchor = discriminators[instruction];
            const match = manual === anchor;
            
            console.log(`${instruction}:`);
            console.log(`  Manual:  ${manual}`);
            console.log(`  Anchor:  ${anchor}`);
            console.log(`  Match:   ${match ? '✅' : '❌'}`);
            console.log('');
        });
        
        if (discriminators.mintNft_actual) {
            console.log('🎯 CORRECT mintNft discriminator from Anchor:', discriminators.mintNft_actual);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testAnchorDiscriminators, calculateManualDiscriminator };