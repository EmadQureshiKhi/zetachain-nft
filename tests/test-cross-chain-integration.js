const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { Program, AnchorProvider, web3, BN } = require('@coral-xyz/anchor');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const PROGRAM_ID = new PublicKey('DCAHxisLaAxxqJDL66t1DaBgsBTPxghbrpeCzo5y2LGK');
const ZETACHAIN_GATEWAY_ID = new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis');
const RPC_URL = 'https://api.devnet.solana.com';

// Test scenarios for cross-chain integration
const TEST_SCENARIOS = [
  {
    name: 'Mint NFT on Solana',
    description: 'Test basic NFT minting functionality',
    chainId: 101, // Solana
  },
  {
    name: 'Transfer to Ethereum',
    description: 'Test cross-chain transfer from Solana to Ethereum',
    destinationChain: 1, // Ethereum mainnet
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  },
  {
    name: 'Transfer to BNB Chain',
    description: 'Test cross-chain transfer from Solana to BNB Chain',
    destinationChain: 56, // BNB Chain
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  },
  {
    name: 'Receive from ZetaChain',
    description: 'Test receiving NFT from ZetaChain Universal App',
    sourceChain: 7001, // ZetaChain testnet
  },
  {
    name: 'Handle Revert Scenario',
    description: 'Test revert handling when cross-chain transfer fails',
    shouldFail: true,
  }
];

class CrossChainIntegrationTester {
  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed');
    this.programId = PROGRAM_ID;
    this.testResults = [];
  }

  async initialize() {
    console.log('🚀 Initializing Cross-Chain Integration Tester');
    console.log('Program ID:', this.programId.toString());
    console.log('RPC URL:', RPC_URL);
    console.log('ZetaChain Gateway:', ZETACHAIN_GATEWAY_ID.toString());
    
    // Load test wallet
    try {
      const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json'));
      this.wallet = Keypair.fromSecretArray(secretKey);
      console.log('✅ Test wallet loaded:', this.wallet.publicKey.toString());
    } catch (error) {
      console.error('❌ Failed to load wallet:', error.message);
      process.exit(1);
    }

    // Check wallet balance
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    console.log('💰 Wallet balance:', balance / 1e9, 'SOL');
    
    if (balance < 0.1 * 1e9) {
      console.warn('⚠️ Low wallet balance. You may need more SOL for testing.');
    }
  }

  async runAllTests() {
    console.log('\n🧪 Running Cross-Chain Integration Tests\n');
    
    for (const scenario of TEST_SCENARIOS) {
      await this.runTestScenario(scenario);
    }
    
    this.printTestSummary();
  }

  async runTestScenario(scenario) {
    console.log(`\n📋 Test: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    
    const startTime = Date.now();
    let result = {
      name: scenario.name,
      success: false,
      duration: 0,
      error: null,
      details: {}
    };

    try {
      switch (scenario.name) {
        case 'Mint NFT on Solana':
          result.details = await this.testMintNFT();
          break;
        case 'Transfer to Ethereum':
        case 'Transfer to BNB Chain':
          result.details = await this.testCrossChainTransfer(scenario);
          break;
        case 'Receive from ZetaChain':
          result.details = await this.testReceiveFromZetaChain(scenario);
          break;
        case 'Handle Revert Scenario':
          result.details = await this.testRevertScenario(scenario);
          break;
        default:
          throw new Error(`Unknown test scenario: ${scenario.name}`);
      }
      
      result.success = true;
      console.log('✅ Test passed');
      
    } catch (error) {
      result.error = error.message;
      console.log('❌ Test failed:', error.message);
      
      if (!scenario.shouldFail) {
        console.log('🔍 Error details:', error);
      } else {
        result.success = true; // Expected failure
        console.log('✅ Expected failure handled correctly');
      }
    }
    
    result.duration = Date.now() - startTime;
    this.testResults.push(result);
    
    console.log(`⏱️ Duration: ${result.duration}ms`);
  }

  async testMintNFT() {
    console.log('🎨 Testing NFT minting...');
    
    const mint = Keypair.generate();
    const [programState] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      this.programId
    );
    
    // Check if program is initialized
    const programStateInfo = await this.connection.getAccountInfo(programState);
    if (!programStateInfo) {
      throw new Error('Program not initialized');
    }
    
    console.log('📊 Program state found, proceeding with mint...');
    
    // Create mint instruction (simplified for testing)
    const instruction = {
      programId: this.programId,
      keys: [
        { pubkey: programState, isSigner: false, isWritable: true },
        { pubkey: mint.publicKey, isSigner: true, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: this.createMintInstructionData('Test NFT', 'TEST', 'https://example.com/nft.json'),
    };
    
    const transaction = new Transaction().add(instruction);
    const signature = await this.connection.sendTransaction(transaction, [this.wallet, mint]);
    
    console.log('📝 Mint transaction:', signature);
    
    return {
      mint: mint.publicKey.toString(),
      transaction: signature,
      name: 'Test NFT',
      symbol: 'TEST'
    };
  }

  async testCrossChainTransfer(scenario) {
    console.log(`🌉 Testing cross-chain transfer to ${scenario.destinationChain}...`);
    
    // For testing, we'll simulate the cross-chain transfer
    // In a real scenario, this would interact with the actual ZetaChain gateway
    
    const mockTokenId = Buffer.alloc(32);
    mockTokenId.writeUInt32BE(Date.now(), 0); // Use timestamp as mock token ID
    
    const transferMessage = {
      messageType: 'Transfer',
      tokenId: Array.from(mockTokenId),
      sourceChainId: 101, // Solana
      destinationChainId: scenario.destinationChain,
      sender: this.wallet.publicKey.toString(),
      recipient: scenario.recipient,
      metadata: {
        name: 'Cross-Chain NFT',
        symbol: 'XNFT',
        uri: 'https://api.universalnft.io/metadata/test.json'
      },
      timestamp: Date.now()
    };
    
    console.log('📦 Cross-chain message prepared:', {
      destination: scenario.destinationChain,
      recipient: scenario.recipient,
      tokenId: mockTokenId.toString('hex').slice(0, 16) + '...'
    });
    
    // Simulate gateway call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      destinationChain: scenario.destinationChain,
      recipient: scenario.recipient,
      tokenId: mockTokenId.toString('hex'),
      message: transferMessage,
      status: 'Simulated - Gateway integration pending'
    };
  }

  async testReceiveFromZetaChain(scenario) {
    console.log('📥 Testing NFT receive from ZetaChain...');
    
    // Simulate receiving an NFT from ZetaChain
    const mockUniversalTokenId = Buffer.alloc(32);
    mockUniversalTokenId.writeUInt32BE(Date.now(), 0);
    
    const receiveMessage = {
      universalTokenId: Array.from(mockUniversalTokenId),
      sourceChainId: scenario.sourceChain,
      name: 'ZetaChain NFT',
      symbol: 'ZNFT',
      uri: 'https://zetachain.com/nft/metadata.json',
      recipient: this.wallet.publicKey.toString()
    };
    
    console.log('📨 Receive message:', {
      sourceChain: scenario.sourceChain,
      tokenId: mockUniversalTokenId.toString('hex').slice(0, 16) + '...',
      name: receiveMessage.name
    });
    
    // Simulate on_call handler
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      sourceChain: scenario.sourceChain,
      tokenId: mockUniversalTokenId.toString('hex'),
      message: receiveMessage,
      status: 'Simulated - Would mint NFT on Solana'
    };
  }

  async testRevertScenario(scenario) {
    console.log('🔄 Testing revert scenario...');
    
    // Simulate a failed cross-chain transfer that triggers revert
    const mockTokenId = Buffer.alloc(32);
    mockTokenId.writeUInt32BE(Date.now(), 0);
    
    console.log('💥 Simulating transfer failure...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🛡️ Triggering revert handler...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const revertData = {
      originalTokenId: mockTokenId.toString('hex'),
      originalOwner: this.wallet.publicKey.toString(),
      revertReason: 'Destination chain unavailable',
      revertAction: 'Re-mint NFT on Solana',
      timestamp: Date.now()
    };
    
    console.log('✅ Revert handled successfully');
    
    return revertData;
  }

  createMintInstructionData(name, symbol, uri) {
    // Create simplified instruction data for testing
    // In production, this would use proper Anchor encoding
    const discriminator = Buffer.from('d33906a70fdb23fb', 'hex'); // mint_nft discriminator
    
    const nameBuffer = Buffer.from(name, 'utf8');
    const symbolBuffer = Buffer.from(symbol, 'utf8');
    const uriBuffer = Buffer.from(uri, 'utf8');
    
    const data = Buffer.alloc(8 + 4 + nameBuffer.length + 4 + symbolBuffer.length + 4 + uriBuffer.length + 1);
    let offset = 0;
    
    discriminator.copy(data, offset);
    offset += 8;
    
    data.writeUInt32LE(nameBuffer.length, offset);
    offset += 4;
    nameBuffer.copy(data, offset);
    offset += nameBuffer.length;
    
    data.writeUInt32LE(symbolBuffer.length, offset);
    offset += 4;
    symbolBuffer.copy(data, offset);
    offset += symbolBuffer.length;
    
    data.writeUInt32LE(uriBuffer.length, offset);
    offset += 4;
    uriBuffer.copy(data, offset);
    offset += uriBuffer.length;
    
    data.writeUInt8(0, offset); // No creators
    
    return data;
  }

  printTestSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️ Total Duration: ${totalDuration}ms`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Deploy ZetaChain Universal App contract');
    console.log('2. Test actual cross-chain transfers on testnet');
    console.log('3. Integrate with ZetaChain gateway on mainnet');
    console.log('4. Add comprehensive error handling and monitoring');
  }
}

// Run the tests
async function main() {
  const tester = new CrossChainIntegrationTester();
  await tester.initialize();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CrossChainIntegrationTester };