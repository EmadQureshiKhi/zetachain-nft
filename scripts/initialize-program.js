const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const ZETACHAIN_GATEWAY_ID = 'ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis';

async function initializeProgram() {
    console.log('🚀 Initializing Universal NFT Program');
    console.log('====================================');
    
    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
        console.log('📋 Loaded deployment info:');
        console.log('  Program ID:', deploymentInfo.programId);
        console.log('  Program State PDA:', deploymentInfo.programStatePda);
        console.log('  Network:', deploymentInfo.network);
    } catch (error) {
        console.error('❌ Failed to load deployment info. Run deploy script first.');
        process.exit(1);
    }
    
    // Setup connection and wallet
    const connection = new Connection(RPC_URL, 'confirmed');
    const programId = new PublicKey(deploymentInfo.programId);
    const programStatePda = new PublicKey(deploymentInfo.programStatePda);
    const gateway = new PublicKey(ZETACHAIN_GATEWAY_ID);
    
    // Load wallet
    let wallet;
    try {
        const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json'));
        wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
        console.log('👤 Authority wallet:', wallet.publicKey.toString());
    } catch (error) {
        console.error('❌ Failed to load wallet:', error.message);
        process.exit(1);
    }
    
    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Wallet balance:', balance / 1e9, 'SOL');
    
    if (balance < 0.1 * 1e9) {
        console.warn('⚠️ Low wallet balance. You may need more SOL.');
    }
    
    // Check if already initialized
    console.log('🔍 Checking program state...');
    const programStateInfo = await connection.getAccountInfo(programStatePda);
    
    if (programStateInfo) {
        console.log('✅ Program already initialized!');
        console.log('📊 Program state account exists with', programStateInfo.data.length, 'bytes');
        
        // Parse and display current state
        if (programStateInfo.data.length >= 106) {
            try {
                const data = programStateInfo.data;
                const authority = new PublicKey(data.slice(8, 40));
                const gatewayStored = new PublicKey(data.slice(40, 72));
                const nextTokenId = data.readBigUInt64LE(72);
                const totalMinted = data.readBigUInt64LE(80);
                const version = data[104];
                
                console.log('📋 Current Program State:');
                console.log('  Authority:', authority.toString());
                console.log('  Gateway:', gatewayStored.toString());
                console.log('  Next Token ID:', nextTokenId.toString());
                console.log('  Total Minted:', totalMinted.toString());
                console.log('  Version:', version);
                
                if (authority.equals(wallet.publicKey)) {
                    console.log('✅ You are the program authority');
                } else {
                    console.log('⚠️ You are not the program authority');
                }
                
                return {
                    programId: deploymentInfo.programId,
                    programStatePda: deploymentInfo.programStatePda,
                    initialized: true,
                    authority: authority.toString(),
                    gateway: gatewayStored.toString()
                };
            } catch (error) {
                console.error('❌ Failed to parse program state:', error.message);
            }
        }
        return;
    }
    
    console.log('🔧 Program not initialized. Initializing...');
    
    // Create initialize instruction
    const initializeDiscriminator = Buffer.from('afaf6d1f0d989bed', 'hex');
    
    const instruction = {
        programId: programId,
        keys: [
            { pubkey: programStatePda, isSigner: false, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: gateway, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: initializeDiscriminator,
    };
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    try {
        console.log('📝 Sending initialize transaction...');
        const signature = await connection.sendTransaction(transaction, [wallet]);
        console.log('📋 Transaction signature:', signature);
        
        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...');
        await connection.confirmTransaction(signature, 'confirmed');
        
        console.log('✅ Program initialized successfully!');
        console.log('🔗 Transaction:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        
        // Verify initialization
        const verifyInfo = await connection.getAccountInfo(programStatePda);
        if (verifyInfo) {
            console.log('✅ Program state account created with', verifyInfo.data.length, 'bytes');
        }
        
        // Update deployment info
        deploymentInfo.initialized = true;
        deploymentInfo.initializeTransaction = signature;
        deploymentInfo.authority = wallet.publicKey.toString();
        deploymentInfo.gateway = gateway.toString();
        
        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('💾 Updated deployment info');
        
        return {
            programId: deploymentInfo.programId,
            programStatePda: deploymentInfo.programStatePda,
            initialized: true,
            authority: wallet.publicKey.toString(),
            gateway: gateway.toString(),
            initializeTransaction: signature
        };
        
    } catch (error) {
        console.error('❌ Initialize failed:', error.message);
        
        // Check for specific errors
        if (error.message.includes('already in use')) {
            console.log('ℹ️ Program state account already exists. Checking state...');
            const existingInfo = await connection.getAccountInfo(programStatePda);
            if (existingInfo) {
                console.log('✅ Program appears to be initialized');
                return {
                    programId: deploymentInfo.programId,
                    programStatePda: deploymentInfo.programStatePda,
                    initialized: true
                };
            }
        }
        
        throw error;
    }
}

// Test discriminators
async function testDiscriminators() {
    console.log('\n🧪 Testing Instruction Discriminators');
    console.log('====================================');
    
    const crypto = require('crypto');
    
    function calculateDiscriminator(instruction) {
        const hash = crypto.createHash('sha256').update(`global:${instruction}`).digest('hex');
        return hash.substring(0, 16);
    }
    
    const instructions = [
        'initialize',
        'mint_nft',
        'transfer_cross_chain',
        'receive_cross_chain',
        'on_call',
        'on_revert',
        'update_gateway'
    ];
    
    console.log('📋 Calculated Discriminators:');
    instructions.forEach(instruction => {
        const discriminator = calculateDiscriminator(instruction);
        console.log(`  ${instruction}: ${discriminator}`);
    });
    
    // Test against known working discriminators
    const knownDiscriminators = {
        'initialize': 'afaf6d1f0d989bed',
        'mint_nft': 'd33906a70fdb23fb',
        'transfer_cross_chain': '9cfe795a40c0b66e'
    };
    
    console.log('\n✅ Verification:');
    Object.entries(knownDiscriminators).forEach(([instruction, expected]) => {
        const calculated = calculateDiscriminator(instruction);
        const match = calculated === expected;
        console.log(`  ${instruction}: ${match ? '✅' : '❌'} ${calculated} ${match ? '==' : '!='} ${expected}`);
    });
}

// Main execution
async function main() {
    try {
        const result = await initializeProgram();
        await testDiscriminators();
        
        console.log('\n🎉 INITIALIZATION COMPLETE!');
        console.log('===========================');
        console.log('Program ID:', result.programId);
        console.log('Program State PDA:', result.programStatePda);
        console.log('Initialized:', result.initialized);
        console.log('Authority:', result.authority);
        console.log('Gateway:', result.gateway);
        
        if (result.initializeTransaction) {
            console.log('Initialize Tx:', result.initializeTransaction);
        }
        
        console.log('\n📋 Next Steps:');
        console.log('1. Update frontend configuration');
        console.log('2. Generate and update IDL');
        console.log('3. Test NFT minting');
        console.log('4. Deploy ZetaChain Universal App');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { initializeProgram, testDiscriminators };