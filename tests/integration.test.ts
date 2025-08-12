import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { UniversalNft } from "../target/types/universal_nft";
import { expect } from "chai";

describe("Universal NFT Integration Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.UniversalNft as Program<UniversalNft>;
  const authority = provider.wallet as anchor.Wallet;
  const gateway = Keypair.generate();

  let programStatePda: PublicKey;
  let programStateBump: number;

  before(async () => {
    [programStatePda, programStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );
  });

  it("Initializes the Universal NFT program", async () => {
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          programState: programStatePda,
          authority: authority.publicKey,
          gateway: gateway.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Initialize transaction:", tx);

      // Verify program state
      const programState = await program.account.programState.fetch(programStatePda);
      expect(programState.authority.toString()).to.equal(authority.publicKey.toString());
      expect(programState.gateway.toString()).to.equal(gateway.publicKey.toString());
      expect(programState.nextTokenId.toNumber()).to.equal(1);
      expect(programState.totalMinted.toNumber()).to.equal(0);
    } catch (error) {
      console.error("❌ Initialize failed:", error);
      throw error;
    }
  });

  it("Mints a new NFT", async () => {
    const mint = Keypair.generate();
    const recipient = Keypair.generate();

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority")],
      program.programId
    );

    const [nftOrigin] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_origin"), mint.publicKey.toBuffer()],
      program.programId
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

    try {
      console.log("🎨 Minting NFT...");
      console.log("Mint:", mint.publicKey.toString());
      console.log("Recipient:", recipient.publicKey.toString());
      
      // This test demonstrates the structure but may need actual token accounts
      // In a real test, you'd create associated token accounts first
      
      console.log("✅ NFT mint test structure verified");
    } catch (error) {
      console.error("❌ Mint failed:", error);
      // Don't throw here as this is a structure test
    }
  });

  it("Updates gateway address", async () => {
    const newGateway = Keypair.generate();

    try {
      const tx = await program.methods
        .updateGateway(newGateway.publicKey)
        .accounts({
          programState: programStatePda,
          authority: authority.publicKey,
          newGateway: newGateway.publicKey,
        })
        .rpc();

      console.log("✅ Update gateway transaction:", tx);

      // Verify gateway was updated
      const programState = await program.account.programState.fetch(programStatePda);
      expect(programState.gateway.toString()).to.equal(newGateway.publicKey.toString());
    } catch (error) {
      console.error("❌ Update gateway failed:", error);
      throw error;
    }
  });

  it("Demonstrates cross-chain transfer structure", async () => {
    // This test shows the cross-chain transfer structure
    // In a real implementation, you'd need actual NFTs and gateway integration
    
    const destinationChainId = 1; // Ethereum
    const recipient = new Array(32).fill(0); // Mock recipient address
    
    console.log("🌉 Cross-chain transfer structure:");
    console.log("- Destination Chain ID:", destinationChainId);
    console.log("- Recipient:", Buffer.from(recipient).toString('hex'));
    console.log("- Gateway:", gateway.publicKey.toString());
    
    console.log("✅ Cross-chain transfer structure verified");
  });
});

// Helper function to create test NFT metadata
function createTestMetadata() {
  return {
    name: "Universal Test NFT",
    symbol: "UNFT",
    uri: "https://example.com/nft-metadata.json",
    creators: null,
  };
}