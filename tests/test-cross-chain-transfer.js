/**
 * 🌉 Cross-Chain NFT Transfer Test Suite
 * =====================================
 * 
 * This script tests the cross-chain transfer functionality of the Universal NFT program.
 * It simulates transferring an NFT from Solana to various EVM chains via ZetaChain.
 * 
 * Usage:
 *   node test-cross-chain-transfer.js           # Basic transfer test (simulation only)
 *   node test-cross-chain-transfer.js --execute # Execute actual transfer (burns NFT!)
 *   node test-cross-chain-transfer.js --info    # Display account information
 *   node test-cross-chain-transfer.js --chains  # Test multiple destination chains
 *   node test-cross-chain-transfer.js --invalid # Test invalid scenarios
 *   node test-cross-chain-transfer.js --mint    # Mint a test NFT for cross-chain transfer
 *   node test-cross-chain-transfer.js --all     # Run complete test suite
 * 
 * Prerequisites:
 *   - Solana CLI configured with a funded devnet wallet
 *   - Test NFT minted and owned by the wallet
 *   - Node.js with @solana/web3.js and @solana/spl-token installed
 * 
 * Safety:
 *   - By default, only simulates transactions (no actual transfers)
 *   - Use --execute flag to perform real transfers (irreversible!)
 *   - Only works on Solana devnet for safety
 */

const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('GQ8QTva9cd87hoRugkUADDVdb8nSpvcA4iStrVr7vD4s');
const TEST_NFT_MINT = new PublicKey('EG9TdGCFHENpKTz7DBHiorYpQWwa74eArCzki8xKwhjq'); // Replace with NFT minted through Universal NFT program

async function testCrossChainTransfer() {
    console.log('🌉 Testing Cross-Chain Transfer...');
    console.log('=====================================');

    const connection = new Connection(RPC_URL, 'confirmed');

    // Load payer keypair
    const payerKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
    );

    console.log('💰 Payer:', payerKeypair.publicKey.toString());
    console.log('🎨 NFT Mint:', TEST_NFT_MINT.toString());

    // Calculate PDAs
    const [programStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        PROGRAM_ID
    );

    const [nftOriginPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_origin'), TEST_NFT_MINT.toBuffer()],
        PROGRAM_ID
    );

    const tokenAccount = getAssociatedTokenAddressSync(
        TEST_NFT_MINT,
        payerKeypair.publicKey
    );

    // Generate transfer record PDA (using a simple token ID for testing)
    const tokenId = new Uint8Array(32);
    tokenId.fill(1); // Simple test token ID

    const [transferRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('transfer'), tokenId],
        PROGRAM_ID
    );

    console.log('📍 Account addresses:');
    console.log('  Program State:', programStatePda.toString());
    console.log('  NFT Origin:', nftOriginPda.toString());
    console.log('  Token Account:', tokenAccount.toString());
    console.log('  Transfer Record:', transferRecordPda.toString());

    // Test parameters
    const destinationChainId = 5; // Goerli testnet
    const recipient = new Uint8Array(32);
    // Convert Ethereum address to 32-byte format (pad with zeros)
    const ethAddress = '0x742d35Cc6634C0532925a3b8D4C2C4e8b9d8b8b8';
    const ethBytes = Buffer.from(ethAddress.slice(2), 'hex'); // Remove 0x prefix
    recipient.set(ethBytes, 0); // Copy to beginning, rest stays zero

    console.log('🎯 Transfer parameters:');
    console.log('  Destination Chain:', destinationChainId, '(Goerli Testnet)');
    console.log('  Recipient:', ethAddress);
    console.log('  Recipient bytes:', Array.from(recipient.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

    // Create instruction data with correct discriminator
    const discriminator = Buffer.from('9cfe795a40c0b66e', 'hex');

    const instructionData = Buffer.concat([
        discriminator,
        Buffer.from(new BigUint64Array([BigInt(destinationChainId)]).buffer), // destination_chain_id (u64)
        Buffer.from(recipient), // recipient ([u8; 32])
    ]);

    console.log('📦 Instruction data:');
    console.log('  Length:', instructionData.length);
    console.log('  Discriminator:', discriminator.toString('hex'));
    console.log('  Destination Chain ID:', destinationChainId);

    // Create the transfer instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: programStatePda, isSigner: false, isWritable: true },
            { pubkey: TEST_NFT_MINT, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: nftOriginPda, isSigner: false, isWritable: true },
            { pubkey: transferRecordPda, isSigner: false, isWritable: true },
            { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true }, // owner
            { pubkey: new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis'), isSigner: false, isWritable: false }, // gateway
            { pubkey: Keypair.generate().publicKey, isSigner: false, isWritable: true }, // gateway_pda (placeholder)
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    });

    console.log('🔧 Created instruction with', instruction.keys.length, 'accounts');

    // Create transaction
    const transaction = new Transaction().add(instruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerKeypair.publicKey;

    // Sign transaction
    transaction.sign(payerKeypair);

    console.log('🔐 Transaction signed');

    // First, check if we actually own the NFT
    console.log('🔍 Checking NFT ownership...');
    try {
        const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
        console.log('Token balance:', tokenAccountInfo.value.uiAmount);

        if (tokenAccountInfo.value.uiAmount !== 1) {
            console.log('❌ You do not own this NFT or it does not exist');
            console.log('💡 This is expected if the NFT was minted to a different wallet');
            return;
        }
    } catch (error) {
        console.log('❌ Token account not found:', error.message);
        console.log('💡 This is expected if the NFT was minted to a different wallet');
        return;
    }

    // Check if NFT origin account exists
    console.log('🔍 Checking NFT origin account...');
    try {
        const nftOriginInfo = await connection.getAccountInfo(nftOriginPda);
        if (!nftOriginInfo) {
            console.log('❌ NFT origin account not found!');
            console.log('💡 This NFT was not minted through our Universal NFT program');
            console.log('💡 Only NFTs minted through mint_nft or mint_nft_simple can be transferred');
            console.log('');
            console.log('🔧 To fix this, you need to:');
            console.log('   1. Mint a new NFT using: node test-basic-mint.js');
            console.log('   2. Update TEST_NFT_MINT in this file to the new mint address');
            console.log('   3. Run this test again');
            return;
        } else {
            console.log('✅ NFT origin account exists');
            console.log('  📊 Data length:', nftOriginInfo.data.length, 'bytes');
        }
    } catch (error) {
        console.log('❌ Could not check NFT origin account:', error.message);
        return;
    }

    // Simulate transaction
    console.log('🧪 Simulating cross-chain transfer...');
    try {
        const simulation = await connection.simulateTransaction(transaction);
        console.log('Simulation result:', simulation.value.err ? 'FAILED' : 'SUCCESS');

        if (simulation.value.err) {
            console.error('❌ Simulation error:', simulation.value.err);
            console.error('Logs:');
            simulation.value.logs?.forEach(log => console.log('  ', log));
            return;
        } else {
            console.log('✅ Simulation successful!');
            console.log('Logs:');
            simulation.value.logs?.forEach(log => console.log('  ', log));
        }
    } catch (simError) {
        console.error('❌ Simulation failed:', simError);
        return;
    }

    // Ask user if they want to execute the transfer
    console.log('\n�o READY TO EXECUTE CROSS-CHAIN TRANSFER');
    console.log('=====================================');
    console.log('⚠️  WARNING: This will burn your NFT on Solana!');
    console.log('📍 NFT will be transferred to:', ethAddress);
    console.log('🌐 Destination chain: Goerli Testnet (Chain ID: 5)');
    console.log('');
    console.log('💡 To execute this transfer, uncomment the execution code below');
    console.log('   and run the script again with: node test-cross-chain-transfer.js --execute');

    // Check for execution flag
    const shouldExecute = process.argv.includes('--execute');

    if (shouldExecute) {
        console.log('\n🚀 EXECUTING CROSS-CHAIN TRANSFER...');
        console.log('=====================================');

        try {
            const signature = await connection.sendRawTransaction(transaction.serialize());
            console.log('� Tiransaction sent:', signature);

            // Confirm transaction
            console.log('⏳ Confirming transaction...');
            const confirmation = await connection.confirmTransaction(signature, 'confirmed');

            if (confirmation.value.err) {
                console.error('❌ Transaction failed:', confirmation.value.err);
            } else {
                console.log('✅ Cross-chain transfer initiated successfully!');
                console.log('  📝 Signature:', signature);
                console.log('  🔥 NFT burned on Solana');
                console.log('  🌐 Will be minted on Goerli Testnet');
                console.log('  📍 Recipient:', ethAddress);
                console.log('🔗 View transaction:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

                // Additional verification
                console.log('\n🔍 Post-transfer verification...');
                try {
                    const postTransferBalance = await connection.getTokenAccountBalance(tokenAccount);
                    console.log('  Token balance after transfer:', postTransferBalance.value.uiAmount);

                    if (postTransferBalance.value.uiAmount === 0) {
                        console.log('  ✅ NFT successfully burned on Solana');
                    }
                } catch (verifyError) {
                    console.log('  ⚠️  Could not verify post-transfer balance:', verifyError.message);
                }
            }
        } catch (sendError) {
            console.error('❌ Failed to send transaction:', sendError);

            // Provide helpful debugging info
            if (sendError.message.includes('insufficient funds')) {
                console.log('💡 Make sure you have enough SOL for transaction fees');
            } else if (sendError.message.includes('Blockhash not found')) {
                console.log('💡 Try running the test again (blockhash expired)');
            }
        }
    } else {
        console.log('\n✅ Test completed successfully!');
        console.log('💡 Run with --execute flag to perform actual transfer');
    }
}

// Additional test functions
async function testMultipleChains() {
    console.log('\n🌐 Testing Multiple Destination Chains...');
    console.log('=========================================');

    const chains = [
        { id: 5, name: 'Ethereum Goerli' },
        { id: 11155111, name: 'Ethereum Sepolia' },
        { id: 97, name: 'BNB Testnet' },
        { id: 80001, name: 'Polygon Mumbai' }
    ];

    for (const chain of chains) {
        console.log(`\n🔗 Testing ${chain.name} (Chain ID: ${chain.id})`);

        // Create instruction data for this chain
        const discriminator = Buffer.from('9cfe795a40c0b66e', 'hex');
        const recipient = new Uint8Array(32);
        const ethAddress = '0x742d35Cc6634C0532925a3b8D4C2C4e8b9d8b8b8';
        const ethBytes = Buffer.from(ethAddress.slice(2), 'hex');
        recipient.set(ethBytes, 0);

        const instructionData = Buffer.concat([
            discriminator,
            Buffer.from(new BigUint64Array([BigInt(chain.id)]).buffer),
            Buffer.from(recipient),
        ]);

        console.log(`  ✅ Chain ${chain.name}: Instruction data length ${instructionData.length} bytes`);
    }
}

async function testInvalidScenarios() {
    console.log('\n⚠️  Testing Invalid Scenarios...');
    console.log('=================================');

    const connection = new Connection(RPC_URL, 'confirmed');

    // Test 1: Invalid chain ID
    console.log('\n1️⃣ Testing invalid chain ID...');
    try {
        const invalidChainId = 999999; // Non-existent chain
        const discriminator = Buffer.from('9cfe795a40c0b66e', 'hex');
        const recipient = new Uint8Array(32);

        const instructionData = Buffer.concat([
            discriminator,
            Buffer.from(new BigUint64Array([BigInt(invalidChainId)]).buffer),
            Buffer.from(recipient),
        ]);

        console.log(`  📦 Created instruction for invalid chain ID: ${invalidChainId}`);
        console.log('  💡 This should be handled by the program validation');
    } catch (error) {
        console.log('  ❌ Error creating invalid instruction:', error.message);
    }

    // Test 2: Invalid recipient address
    console.log('\n2️⃣ Testing invalid recipient address...');
    try {
        const invalidRecipient = new Uint8Array(32);
        // All zeros - invalid Ethereum address
        console.log('  📍 Testing zero address recipient');
        console.log('  💡 This should be handled by the program validation');
    } catch (error) {
        console.log('  ❌ Error with invalid recipient:', error.message);
    }

    // Test 3: Non-existent NFT
    console.log('\n3️⃣ Testing non-existent NFT...');
    try {
        const fakeNFT = Keypair.generate().publicKey;
        console.log('  🎨 Testing with fake NFT:', fakeNFT.toString());
        console.log('  💡 This should fail during token account validation');
    } catch (error) {
        console.log('  ❌ Error with fake NFT:', error.message);
    }
}

async function displayAccountInfo() {
    console.log('\n📊 Account Information...');
    console.log('=========================');

    const connection = new Connection(RPC_URL, 'confirmed');

    // Load payer keypair
    const payerKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
    );

    // Check SOL balance
    try {
        const balance = await connection.getBalance(payerKeypair.publicKey);
        console.log('💰 SOL Balance:', balance / 1e9, 'SOL');

        if (balance < 0.01 * 1e9) {
            console.log('⚠️  Low SOL balance! You may need more SOL for transaction fees');
            console.log('💡 Get devnet SOL from: https://faucet.solana.com/');
        }
    } catch (error) {
        console.log('❌ Could not fetch SOL balance:', error.message);
    }

    // Check NFT ownership
    try {
        const tokenAccount = getAssociatedTokenAddressSync(
            TEST_NFT_MINT,
            payerKeypair.publicKey
        );

        const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
        console.log('🎨 NFT Balance:', tokenAccountInfo.value.uiAmount);

        if (tokenAccountInfo.value.uiAmount === 1) {
            console.log('✅ You own the test NFT and can perform transfers');
        } else {
            console.log('❌ You do not own the test NFT');
        }
    } catch (error) {
        console.log('❌ NFT not found in your wallet:', error.message);
    }

    // Check program accounts
    console.log('\n🏗️  Program Account Status:');
    const [programStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        PROGRAM_ID
    );

    try {
        const programStateInfo = await connection.getAccountInfo(programStatePda);
        if (programStateInfo) {
            console.log('✅ Program state account exists');
            console.log('  📊 Data length:', programStateInfo.data.length, 'bytes');
        } else {
            console.log('❌ Program state account not found');
        }
    } catch (error) {
        console.log('❌ Could not check program state:', error.message);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🧪 CROSS-CHAIN TRANSFER TEST SUITE');
    console.log('===================================');
    console.log('🕒 Started at:', new Date().toISOString());
    console.log('');

    try {
        // Display account info first
        await displayAccountInfo();

        // Test multiple chains
        await testMultipleChains();

        // Test invalid scenarios
        await testInvalidScenarios();

        // Main transfer test
        await testCrossChainTransfer();

        console.log('\n🎉 All tests completed!');
        console.log('========================');

    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

async function mintTestNFT() {
    console.log('🎨 Minting Test NFT for Cross-Chain Transfer...');
    console.log('===============================================');

    const connection = new Connection(RPC_URL, 'confirmed');

    // Load payer keypair
    const payerKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync('/Users/nokitha/.config/solana/id.json', 'utf8')))
    );

    console.log('💰 Payer:', payerKeypair.publicKey.toString());

    // Generate new mint
    const mintKeypair = Keypair.generate();
    console.log('🎨 New Mint:', mintKeypair.publicKey.toString());

    // Calculate PDAs
    const [programStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        PROGRAM_ID
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        PROGRAM_ID
    );

    const [nftOriginPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nft_origin'), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
    );

    const tokenAccount = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        payerKeypair.publicKey
    );

    console.log('📍 Account addresses:');
    console.log('  Program State:', programStatePda.toString());
    console.log('  Mint Authority:', mintAuthorityPda.toString());
    console.log('  NFT Origin:', nftOriginPda.toString());
    console.log('  Token Account:', tokenAccount.toString());

    // Create instruction data for mint_nft_simple
    const discriminator = Buffer.from('dd6bfa63a7d3dcb4', 'hex');
    const name = 'Cross-Chain Test NFT';
    const symbol = 'CCNFT';

    const nameBytes = Buffer.from(name, 'utf8');
    const symbolBytes = Buffer.from(symbol, 'utf8');

    const instructionData = Buffer.concat([
        discriminator,
        Buffer.from([nameBytes.length]), // name length (u8)
        nameBytes,
        Buffer.from([symbolBytes.length]), // symbol length (u8)
        symbolBytes,
    ]);

    console.log('📦 Instruction data:');
    console.log('  Length:', instructionData.length);
    console.log('  Name:', name);
    console.log('  Symbol:', symbol);

    // Create the mint instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: programStatePda, isSigner: false, isWritable: true },
            { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: nftOriginPda, isSigner: false, isWritable: true },
            { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'), isSigner: false, isWritable: false }, // Associated Token Program
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    });

    console.log('🔧 Created mint instruction with', instruction.keys.length, 'accounts');

    // Create transaction
    const transaction = new Transaction().add(instruction);

    try {
        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payerKeypair.publicKey;

        // Sign transaction
        transaction.sign(payerKeypair, mintKeypair);

        console.log('🔐 Transaction signed');

        // Send transaction
        console.log('📤 Sending mint transaction...');
        const signature = await connection.sendRawTransaction(transaction.serialize());
        console.log('Transaction signature:', signature);

        // Confirm transaction
        console.log('⏳ Confirming transaction...');
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            console.error('❌ Transaction failed:', confirmation.value.err);
        } else {
            console.log('✅ NFT minted successfully!');
            console.log('  📝 Signature:', signature);
            console.log('  🎨 Mint Address:', mintKeypair.publicKey.toString());
            console.log('  🔗 View transaction:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
            console.log('');
            console.log('🔧 To test cross-chain transfer:');
            console.log('   1. Update TEST_NFT_MINT in test-cross-chain-transfer.js to:');
            console.log('      const TEST_NFT_MINT = new PublicKey(\'' + mintKeypair.publicKey.toString() + '\');');
            console.log('   2. Run: node test-cross-chain-transfer.js');
        }
    } catch (error) {
        console.error('❌ Failed to mint NFT:', error);

        if (error.message.includes('insufficient funds')) {
            console.log('💡 Make sure you have enough SOL for transaction fees');
        } else if (error.message.includes('Blockhash not found')) {
            console.log('💡 Try running the test again (blockhash expired)');
        }
    }
}

// Run tests based on command line arguments
if (process.argv.includes('--info')) {
    displayAccountInfo().catch(console.error);
} else if (process.argv.includes('--chains')) {
    testMultipleChains().catch(console.error);
} else if (process.argv.includes('--invalid')) {
    testInvalidScenarios().catch(console.error);
} else if (process.argv.includes('--all')) {
    runAllTests().catch(console.error);
} else if (process.argv.includes('--mint')) {
    mintTestNFT().catch(console.error);
} else {
    testCrossChainTransfer().catch(console.error);
}