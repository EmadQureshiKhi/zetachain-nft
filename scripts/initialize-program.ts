import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as fs from 'fs';

// Program ID from deployment
const PROGRAM_ID = new PublicKey('6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2');

// Gateway address (placeholder for now)
const GATEWAY_ADDRESS = new PublicKey('11111111111111111111111111111112'); // System program as placeholder

async function initializeProgram() {
    console.log('🚀 Initializing Universal NFT Program...');

    // Connect to local validator
    const connection = new Connection('http://localhost:8899', 'confirmed');

    // Load wallet
    const walletPath = process.env.HOME + '/.config/solana/id.json';
    const walletKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
    );

    console.log('👤 Authority:', walletKeypair.publicKey.toString());
    console.log('🏛️ Program ID:', PROGRAM_ID.toString());
    console.log('🌉 Gateway:', GATEWAY_ADDRESS.toString());

    // Create provider
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(walletKeypair),
        { commitment: 'confirmed' }
    );

    // Load program IDL
    const idlPath = './target/idl/universal_nft.json';
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    // Create program instance
    const program = new anchor.Program(idl, provider);

    try {
        // Find program state PDA
        const [programState] = PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            PROGRAM_ID
        );

        console.log('📍 Program State PDA:', programState.toString());

        // Check if already initialized
        try {
            const stateAccount = await connection.getAccountInfo(programState);
            if (stateAccount) {
                console.log('✅ Program already initialized!');
                return;
            }
        } catch (error) {
            // Account doesn't exist, proceed with initialization
        }

        // Initialize the program
        console.log('⚡ Sending initialization transaction...');

        const tx = await program.methods
            .initialize()
            .accounts({
                authority: walletKeypair.publicKey,
                programState: programState,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        console.log('✅ Program initialized successfully!');
        console.log('📝 Transaction signature:', tx);

        // Verify initialization
        const stateAccount = await program.account.programState.fetch(programState);
        console.log('🎉 Program State:', {
            authority: stateAccount.authority.toString(),
            gateway: stateAccount.gateway.toString(),
            nextTokenId: stateAccount.nextTokenId.toString(),
            totalMinted: stateAccount.totalMinted.toString(),
        });

    } catch (error) {
        console.error('❌ Initialization failed:', error);

        if (error.message.includes('already in use')) {
            console.log('💡 Program might already be initialized');
        }
    }
}

// Run initialization
initializeProgram()
    .then(() => {
        console.log('🎯 Initialization complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Initialization error:', error);
        process.exit(1);
    });