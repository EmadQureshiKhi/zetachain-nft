import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { UniversalNft } from "../target/types/universal_nft";

export class UniversalNftClient {
  private program: Program<UniversalNft>;
  private provider: AnchorProvider;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey
  ) {
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(
      require("../target/idl/universal_nft.json"),
      programId,
      this.provider
    );
  }

  /**
   * Initialize the Universal NFT program
   */
  async initialize(authority: PublicKey, gateway: PublicKey): Promise<string> {
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );

    const tx = await this.program.methods
      .initialize()
      .accounts({
        programState: programStatePda,
        authority,
        gateway,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Program initialized:", tx);
    return tx;
  }

  /**
   * Mint a new NFT on Solana
   */
  async mintNft(
    recipient: PublicKey,
    name: string,
    symbol: string,
    uri: string,
    creators?: any[]
  ): Promise<{ signature: string; mint: PublicKey; tokenId: Buffer }> {
    const mint = Keypair.generate();
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority")],
      this.program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      recipient
    );

    // Generate token ID (simplified version)
    const tokenId = this.generateTokenId(mint.publicKey);
    
    const [nftOrigin] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_origin"), tokenId],
      this.program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [masterEdition] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const signature = await this.program.methods
      .mintNft(name, symbol, uri, creators || null)
      .accounts({
        programState: programStatePda,
        mint: mint.publicKey,
        tokenAccount,
        nftOrigin,
        metadata,
        masterEdition,
        mintAuthority,
        payer: this.provider.wallet.publicKey,
        recipient,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .signers([mint])
      .rpc();

    console.log("NFT minted:", signature);
    return { signature, mint: mint.publicKey, tokenId };
  }

  /**
   * Transfer NFT to another chain
   */
  async transferCrossChain(
    mint: PublicKey,
    owner: PublicKey,
    destinationChainId: number,
    recipient: Buffer
  ): Promise<string> {
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(mint, owner);

    // Get token ID from NFT origin account
    const tokenId = await this.getTokenId(mint);
    const [nftOrigin] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_origin"), tokenId],
      this.program.programId
    );

    const programState = await this.program.account.programState.fetch(programStatePda);

    const signature = await this.program.methods
      .transferCrossChain(new anchor.BN(destinationChainId), Array.from(recipient))
      .accounts({
        programState: programStatePda,
        mint,
        tokenAccount,
        nftOrigin,
        owner,
        gateway: programState.gateway,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Cross-chain transfer initiated:", signature);
    return signature;
  }

  /**
   * Receive NFT from another chain (gateway only)
   */
  async receiveCrossChain(
    recipient: PublicKey,
    tokenId: Buffer,
    name: string,
    symbol: string,
    uri: string,
    creators?: any[]
  ): Promise<{ signature: string; mint: PublicKey }> {
    const mint = Keypair.generate();
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority")],
      this.program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      recipient
    );

    const [nftOrigin] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_origin"), tokenId],
      this.program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const signature = await this.program.methods
      .receiveCrossChain(Array.from(tokenId), name, symbol, uri, creators || null)
      .accounts({
        programState: programStatePda,
        mint: mint.publicKey,
        tokenAccount,
        nftOrigin,
        metadata,
        mintAuthority,
        payer: this.provider.wallet.publicKey,
        recipient,
        gateway: this.provider.wallet.publicKey, // This should be the actual gateway
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .signers([mint])
      .rpc();

    console.log("NFT received from cross-chain:", signature);
    return { signature, mint: mint.publicKey };
  }

  /**
   * Update gateway address (admin only)
   */
  async updateGateway(authority: Keypair, newGateway: PublicKey): Promise<string> {
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );

    const signature = await this.program.methods
      .updateGateway(newGateway)
      .accounts({
        programState: programStatePda,
        authority: authority.publicKey,
        newGateway,
      })
      .signers([authority])
      .rpc();

    console.log("Gateway updated:", signature);
    return signature;
  }

  /**
   * Get program state
   */
  async getProgramState(): Promise<any> {
    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      this.program.programId
    );

    return await this.program.account.programState.fetch(programStatePda);
  }

  /**
   * Get NFT origin information
   */
  async getNftOrigin(tokenId: Buffer): Promise<any> {
    const [nftOrigin] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_origin"), tokenId],
      this.program.programId
    );

    return await this.program.account.nftOrigin.fetch(nftOrigin);
  }

  /**
   * Listen for cross-chain events
   */
  addEventListener(eventName: string, callback: (event: any) => void): number {
    return this.program.addEventListener(eventName, callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listenerId: number): Promise<void> {
    return this.program.removeEventListener(listenerId);
  }

  private generateTokenId(mint: PublicKey): Buffer {
    // Simplified token ID generation
    // In production, this should match the on-chain generation logic
    const mintBytes = mint.toBuffer();
    const timestamp = Buffer.from(Date.now().toString());
    const combined = Buffer.concat([mintBytes.slice(0, 16), timestamp.slice(0, 16)]);
    return combined;
  }

  private async getTokenId(mint: PublicKey): Promise<Buffer> {
    // This would need to be implemented to fetch the actual token ID
    // from the NFT origin account or derive it from the mint
    return this.generateTokenId(mint);
  }
}

// Example usage
export async function example() {
  const connection = new Connection("http://localhost:8899");
  const wallet = new Wallet(Keypair.generate());
  const programId = new PublicKey("UniversalNFT11111111111111111111111111111111");

  const client = new UniversalNftClient(connection, wallet, programId);

  // Initialize program
  const gateway = new PublicKey("Gateway11111111111111111111111111111111");
  await client.initialize(wallet.publicKey, gateway);

  // Mint NFT
  const { mint, tokenId } = await client.mintNft(
    wallet.publicKey,
    "My Universal NFT",
    "UNFT",
    "https://example.com/metadata.json"
  );

  // Transfer to another chain
  await client.transferCrossChain(
    mint,
    wallet.publicKey,
    1, // Ethereum chain ID
    Buffer.from("0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e8e8", "hex")
  );
}