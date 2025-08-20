import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  TransactionInstruction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
// Note: crypto is available in Node.js, for browser we'll use a different approach
import { web3, BN, Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import universalNftIdl from './universal_nft.json';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  MINT_SIZE,
} from '@solana/spl-token';

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

import {
  UNIVERSAL_NFT_PROGRAM_ID as PROGRAM_ID_STRING,
  PROGRAM_SEEDS,
  TRANSACTION_CONFIG,
  CHAIN_IDS,
  SUPPORTED_CHAINS,
  ZETACHAIN_GATEWAY_ID
} from './config';

// Universal NFT Program ID (deployed and ready)
const UNIVERSAL_NFT_PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

// Program state seeds (from deployed program)
const PROGRAM_STATE_SEED = PROGRAM_SEEDS.PROGRAM_STATE;
const NFT_ORIGIN_SEED = PROGRAM_SEEDS.NFT_ORIGIN;
const MINT_AUTHORITY_SEED = PROGRAM_SEEDS.MINT_AUTHORITY;

export interface UniversalNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MintNFTParams {
  metadata: UniversalNFTMetadata;
  creators?: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
}

export class UniversalNFTService {
  private connection: Connection;
  private program: Program | null = null;
  private programId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.programId = UNIVERSAL_NFT_PROGRAM_ID;
    this.initProgram();
  }

  private initProgram() {
    try {
      console.log('🔧 Initializing Anchor program...');
      
      // Create a dummy wallet for the provider (we'll use actual wallet for signing)
      const dummyWallet = {
        publicKey: new PublicKey('11111111111111111111111111111111'),
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };
      
      const provider = new AnchorProvider(this.connection, dummyWallet as any, {});
      
      // Create program directly with program ID and provider
      this.program = new Program(universalNftIdl as any, this.programId, provider);
      console.log('✅ Anchor program initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Anchor program:', error);
      console.warn('⚠️ Using manual instruction encoding only');
      this.program = null; // Force manual encoding
    }
  }

  getProgramStatePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_SEEDS.PROGRAM_STATE)],
      this.programId
    );
  }

  getMintAuthorityPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_AUTHORITY_SEED)],
      this.programId
    );
  }

  getNFTOriginPDA(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ORIGIN_SEED), mint.toBuffer()],
      this.programId
    );
  }

  getTransferPDA(tokenId: Uint8Array): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PROGRAM_SEEDS.TRANSFER), tokenId],
      this.programId
    );
  }

  async initialize(
    authority: PublicKey,
    gateway: PublicKey
  ): Promise<Transaction> {
    const [programState] = this.getProgramStatePDA();

    const instruction = {
      programId: this.programId,
      keys: [
        { pubkey: authority, isSigner: true, isWritable: false },
        { pubkey: programState, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from([0]),
    };

    const transaction = new Transaction().add(instruction);
    return transaction;
  }

  async mintNFT(
    payer: PublicKey,
    params: MintNFTParams,
    recipientOverride?: PublicKey
  ): Promise<{
    transaction: Transaction;
    mint: PublicKey;
    tokenAccount: PublicKey;
    metadataAccount: PublicKey;
    masterEditionAccount: PublicKey;
  }> {
    console.log('🎨 Creating Universal NFT:', params.metadata.name);

    // Validate input parameters
    if (!params.metadata.name || params.metadata.name.length > TRANSACTION_CONFIG.MAX_NAME_LENGTH) {
      throw new Error(`NFT name must be 1-${TRANSACTION_CONFIG.MAX_NAME_LENGTH} characters`);
    }
    if (!params.metadata.description) {
      throw new Error('NFT description is required');
    }

    const mint = web3.Keypair.generate();
    const recipient = recipientOverride ?? payer;
    const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, recipient);

    console.log('🔑 Generated mint:', mint.publicKey.toString());
    console.log('👤 Recipient:', recipient.toString());
    console.log('🏦 Token account:', tokenAccount.toString());

    // Calculate all required PDAs
    const [programStatePDA] = this.getProgramStatePDA();
    const [mintAuthority] = this.getMintAuthorityPDA();
    const [nftOrigin] = this.getNFTOriginPDA(mint.publicKey);

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

    console.log('📍 Program State PDA:', programStatePDA.toString());
    console.log('🔐 Mint Authority:', mintAuthority.toString());
    console.log('📊 NFT Origin:', nftOrigin.toString());
    console.log('📝 Metadata Account:', metadataAccount.toString());
    console.log('🏆 Master Edition:', masterEditionAccount.toString());

    // Check if program is initialized
    const programState = await this.getProgramState();
    if (!programState || !programState.initialized) {
      throw new Error('Universal NFT program is not initialized. Please contact support.');
    }

    console.log('✅ Program is initialized and ready');
    console.log('📊 Program stats:', {
      totalMinted: programState.totalMinted?.toString() || '0',
      nextTokenId: programState.nextTokenId?.toString() || '1',
    });

    try {
      let mintNFTIx: TransactionInstruction | undefined;

      console.log('🔍 Anchor program status:', this.program ? 'Available' : 'Not available');
      // Force manual encoding for debugging
      this.program = null;

      // Try to use Anchor program for instruction building
      if (this.program) {
        console.log('🔧 Using Anchor program for instruction encoding');
        
        try {
          mintNFTIx = await this.program.methods
            .mintNft(
              params.metadata.name,
              params.metadata.symbol || 'UNFT',
              params.metadata.image || '',
              null // creators as null (Option::None)
            )
            .accounts({
              programState: programStatePDA,
              mint: mint.publicKey,
              tokenAccount: tokenAccount,
              nftOrigin: nftOrigin,
              metadata: metadataAccount,
              masterEdition: masterEditionAccount,
              mintAuthority: mintAuthority,
              payer: payer,
              recipient: recipient,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
              tokenMetadataProgram: METADATA_PROGRAM_ID,
            })
            .instruction();
            
          console.log('✅ Anchor instruction created successfully');
        } catch (anchorError) {
          console.error('❌ Anchor instruction creation failed:', anchorError);
          console.log('⚠️ Falling back to manual encoding due to Anchor error');
          this.program = null; // Disable anchor for this session
        }
      }
      
      // If Anchor failed or isn't available, use manual encoding
      if (!mintNFTIx) {
        // Fallback to manual instruction creation
        console.log('⚠️ Falling back to manual instruction encoding');
        mintNFTIx = new TransactionInstruction({
          keys: [
            { pubkey: programStatePDA, isSigner: false, isWritable: true },
            { pubkey: mint.publicKey, isSigner: true, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: nftOrigin, isSigner: false, isWritable: true },
            { pubkey: metadataAccount, isSigner: false, isWritable: true },
            { pubkey: masterEditionAccount, isSigner: false, isWritable: true },
            { pubkey: mintAuthority, isSigner: false, isWritable: false },
            { pubkey: payer, isSigner: true, isWritable: true },
            { pubkey: recipient, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data: this.encodeMintNFTData(params, /*useFullMint*/ true),
        });
      }

      // Add compute budget instruction for NFT minting (Metaplex operations are compute-intensive)
      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000, // Increase compute limit for NFT minting with Metaplex
      });

      // Build transaction with compute budget and mint instruction
      const transaction = new Transaction()
        .add(computeBudgetIx)
        .add(mintNFTIx);

      // Set recent blockhash and fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer;

      // Partially sign with mint keypair
      transaction.partialSign(mint);

      console.log('✅ Universal NFT transaction created successfully');
      console.log('🔑 Mint address:', mint.publicKey.toString());
      console.log('📦 Transaction size:', transaction.serialize({ requireAllSignatures: false }).length, 'bytes');

      return {
        transaction,
        mint: mint.publicKey,
        tokenAccount,
        metadataAccount,
        masterEditionAccount,
      };
    } catch (error) {
      console.error('❌ Failed to create mint transaction:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create NFT mint transaction: ${message}`);
    }
  }

  async transferCrossChain(
    owner: PublicKey,
    mint: PublicKey,
    destinationChainId: number,
    recipient: Uint8Array
  ): Promise<Transaction> {
    console.log('🌉 Creating cross-chain transfer transaction');
    console.log('From:', owner.toString());
    console.log('NFT Mint:', mint.toString());
    console.log('To Chain:', destinationChainId);
    console.log('Recipient:', Array.from(recipient));

    // Validate destination chain
    const supportedChain = SUPPORTED_CHAINS.find(chain => chain.id === destinationChainId);
    if (!supportedChain) {
      throw new Error(`Unsupported destination chain ID: ${destinationChainId}`);
    }

    // Validate recipient address
    if (recipient.length !== 32) {
      throw new Error('Recipient address must be 32 bytes');
    }

    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    const [programStatePDA] = this.getProgramStatePDA();
    const [nftOrigin] = this.getNFTOriginPDA(mint);

    // Check if NFT exists and is owned by the user
    let tokenAccountInfo;
    try {
      tokenAccountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
    } catch (error: any) {
      if (error.message.includes('could not find account')) {
        throw new Error(
          `This NFT cannot be transferred because it wasn't minted through our Universal NFT program. ` +
          `Only NFTs minted using our platform can be transferred cross-chain. ` +
          `Please mint a new NFT through our minting interface first.`
        );
      }
      throw new Error(`Failed to check NFT ownership: ${error.message}`);
    }

    if (tokenAccountInfo.value.uiAmount !== 1) {
      throw new Error('You do not own this NFT or it does not exist');
    }

    // Check if NFT origin account exists (required for cross-chain transfers)
    try {
      const nftOriginInfo = await this.connection.getAccountInfo(nftOrigin);
      if (!nftOriginInfo) {
        throw new Error(
          `This NFT cannot be transferred cross-chain because it lacks an origin record. ` +
          `Only NFTs minted through our Universal NFT program can be transferred. ` +
          `Please mint a new NFT using our platform's minting interface.`
        );
      }
    } catch (error: any) {
      if (error.message.includes('origin record')) {
        throw error; // Re-throw our custom error
      }
      throw new Error(`Failed to verify NFT origin: ${error.message}`);
    }

    // Get the universal token ID from NFT origin (required for Universal NFT)
    const nftOriginInfo = await this.connection.getAccountInfo(nftOrigin);
    if (!nftOriginInfo) {
      throw new Error('NFT origin record not found');
    }
    
    // Parse NFT origin to get the universal token ID
    const universalTokenId = this.parseNFTOriginTokenId(nftOriginInfo.data);
    console.log('🔗 Universal Token ID:', this.bytesToHex(universalTokenId));

    const [transferRecord] = this.getTransferPDA(universalTokenId);

    console.log('📍 Token Account:', tokenAccount.toString());
    console.log('📊 NFT Origin:', nftOrigin.toString());
    console.log('📝 Transfer Record:', transferRecord.toString());

    const transferIx = new TransactionInstruction({
      keys: [
        { pubkey: programStatePDA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: tokenAccount, isSigner: false, isWritable: true },
        { pubkey: nftOrigin, isSigner: false, isWritable: true },
        { pubkey: transferRecord, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: new PublicKey(ZETACHAIN_GATEWAY_ID), isSigner: false, isWritable: false },
        { pubkey: Keypair.generate().publicKey, isSigner: false, isWritable: true }, // Gateway PDA placeholder
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: this.encodeTransferCrossChainData(destinationChainId, recipient),
    });

    const transaction = new Transaction().add(transferIx);

          console.log('✅ Cross-chain transfer transaction created');
      console.log('🎯 Destination:', supportedChain.name);
      console.log('🛡️ Revert protection: Enabled');
      console.log('  - If transfer fails, NFT will be restored to your wallet');
      console.log('  - ZetaChain will call onRevert to re-mint NFT on Solana');
      console.log('  - Original ownership will be preserved');

      return transaction;
  }

  async getProgramState(): Promise<any> {
    const [programStatePDA] = this.getProgramStatePDA();

    try {
      const accountInfo = await this.connection.getAccountInfo(programStatePDA);
      if (!accountInfo) {
        console.log('❌ Program state not found - program may not be initialized');
        return {
          authority: null,
          gateway: null,
          nextTokenId: new BN(0),
          totalMinted: new BN(0),
          totalTransfers: new BN(0),
          totalReceives: new BN(0),
          version: 0,
          initialized: false,
        };
      }

      console.log('✅ Program state found, data length:', accountInfo.data.length);

      // Parse the program state based on our deployed program structure
      if (accountInfo.data.length >= 106) { // Updated size from deployment
        const data = accountInfo.data;

        try {
          const authority = new PublicKey(data.slice(8, 40));
          const gateway = new PublicKey(data.slice(40, 72));
          const nextTokenId = new BN(data.slice(72, 80), 'le');
          const totalMinted = new BN(data.slice(80, 88), 'le');
          const totalTransfers = new BN(data.slice(88, 96), 'le');
          const totalReceives = new BN(data.slice(96, 104), 'le');
          const version = data[104];
          const bump = data[105];

          const state = {
            authority,
            gateway,
            nextTokenId,
            totalMinted,
            totalTransfers,
            totalReceives,
            version,
            bump,
            initialized: true,
          };

          console.log('📊 Program State:', {
            authority: authority.toString(),
            gateway: gateway.toString(),
            nextTokenId: nextTokenId.toString(),
            totalMinted: totalMinted.toString(),
            totalTransfers: totalTransfers.toString(),
            totalReceives: totalReceives.toString(),
            version,
            bump,
          });

          return state;
        } catch (parseError) {
          console.error('❌ Failed to parse program state:', parseError);
          return {
            authority: null,
            gateway: null,
            nextTokenId: new BN(0),
            totalMinted: new BN(0),
            totalTransfers: new BN(0),
            totalReceives: new BN(0),
            version: 0,
            initialized: false,
            error: 'Failed to parse program state data',
          };
        }
      } else {
        console.log('⚠️ Program state data too small:', accountInfo.data.length, 'bytes');
        return {
          authority: null,
          gateway: null,
          nextTokenId: new BN(0),
          totalMinted: new BN(0),
          totalTransfers: new BN(0),
          totalReceives: new BN(0),
          version: 0,
          initialized: false,
          error: 'Program state data too small',
        };
      }
    } catch (error) {
      console.error('❌ Error fetching program state:', error);
      return {
        authority: null,
        gateway: null,
        nextTokenId: new BN(0),
        totalMinted: new BN(0),
        totalTransfers: new BN(0),
        totalReceives: new BN(0),
        version: 0,
        initialized: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getNFTOrigin(mint: PublicKey): Promise<any> {
    const [nftOrigin] = this.getNFTOriginPDA(mint);

    try {
      const accountInfo = await this.connection.getAccountInfo(nftOrigin);
      if (!accountInfo) return null;

      return {
        originalMint: new PublicKey(accountInfo.data.slice(8, 40)),
        tokenId: accountInfo.data.slice(40, 72),
        originChainId: new BN(accountInfo.data.slice(72, 80), 'le'),
        blockNumber: new BN(accountInfo.data.slice(80, 88), 'le'),
      };
    } catch (error) {
      console.error('Error fetching NFT origin:', error);
      return null;
    }
  }

  private encodeMintNFTData(params: MintNFTParams, useFullMint: boolean = false): Buffer {
    // Use the canonical mint_nft discriminator
    const discriminator = this.getInstructionDiscriminator('mint_nft');

    const nameBuffer = Buffer.from(params.metadata.name, 'utf8');
    const symbolBuffer = Buffer.from(params.metadata.symbol || 'UNFT', 'utf8');
    
    // Create a proper metadata JSON URI (required for NFT standards)
    const metadataUri = params.metadata.image || 'https://api.jsonbin.io/v3/b/universal-nft-metadata';
    const uriBuffer = Buffer.from(metadataUri, 'utf8');

    // Calculate total size: discriminator + string lengths + strings + creators option (None = 1 byte)
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

    // Write creators option (always None for now)
    data.writeUInt8(0, offset); // None

    console.log('🔧 Mint NFT instruction data:', {
      size: data.length,
      discriminator: discriminator.toString('hex'),
      name: params.metadata.name,
      symbol: symbolBuffer.toString(),
      uri: metadataUri,
      uriLength: uriBuffer.length,
    });

    return data;
  }

  private encodeTransferCrossChainData(destinationChainId: number, recipient: Uint8Array): Buffer {
    // Create discriminator for transfer_cross_chain instruction (snake_case)
    const discriminator = this.getInstructionDiscriminator('transfer_cross_chain');

    const data = Buffer.alloc(8 + 8 + 32);
    let offset = 0;

    // Write discriminator
    discriminator.copy(data, offset);
    offset += 8;

    // Write destination chain ID
    data.writeBigUInt64LE(BigInt(destinationChainId), offset);
    offset += 8;

    // Write recipient address
    Buffer.from(recipient).copy(data, offset);

    console.log('🔧 Transfer cross-chain instruction data:', {
      size: data.length,
      discriminator: discriminator.toString('hex'),
      destinationChainId,
      recipient: Array.from(recipient),
    });

    return data;
  }

  // Add helper method to get supported chains
  getSupportedChains() {
    return SUPPORTED_CHAINS;
  }

  // Add helper method to validate chain ID
  isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
  }

  // Check if an NFT is transferable (has origin account)
  async isNFTTransferable(mint: PublicKey): Promise<boolean> {
    try {
      const [nftOrigin] = this.getNFTOriginPDA(mint);
      const nftOriginInfo = await this.connection.getAccountInfo(nftOrigin);
      return nftOriginInfo !== null;
    } catch (error) {
      console.warn('Failed to check NFT transferability:', error);
      return false;
    }
  }

  // Helper method to generate correct instruction discriminators
  private getInstructionDiscriminator(instruction: string): Buffer {
    // Working discriminators from our deployed program (snake_case conversion)
    const discriminators: { [key: string]: Buffer } = {
      'initialize': Buffer.from('afaf6d1f0d989bed', 'hex'),
      'mint_nft': Buffer.from('d33906a70fdb23fb', 'hex'), // mint_nft (snake_case)
      'transfer_cross_chain': Buffer.from('9cfe795a40c0b66e', 'hex'), // transfer_cross_chain (CORRECT!)
      'receive_cross_chain': Buffer.from([117, 33, 7, 40, 221, 135, 87, 40]),
      'on_call': Buffer.from([16, 136, 66, 32, 254, 40, 181, 8]),
      'on_revert': Buffer.from([226, 44, 101, 52, 224, 214, 41, 9]),
      'update_gateway': Buffer.from([11, 133, 146, 0, 122, 116, 10, 75]),
    };

    return discriminators[instruction] || Buffer.alloc(8);
  }

  // Helper method to parse universal token ID from NFT origin account data
  private parseNFTOriginTokenId(data: Buffer): Uint8Array {
    try {
      // NFT Origin structure: discriminator (8) + original_mint (32) + token_id (32) + ...
      const tokenIdOffset = 8 + 32; // Skip discriminator and original_mint
      const tokenIdBytes = data.slice(tokenIdOffset, tokenIdOffset + 32);
      return new Uint8Array(tokenIdBytes);
    } catch (error) {
      console.error('❌ Failed to parse NFT origin token ID:', error);
      throw new Error('Invalid NFT origin data format');
    }
  }

  // Helper method to convert bytes to hex string for logging
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}