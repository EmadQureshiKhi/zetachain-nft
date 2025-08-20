const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkCommand(command, name) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${name}: ${output.trim().split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Not found or error`);
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name}: Found`);
    return true;
  } else {
    console.log(`❌ ${name}: Missing`);
    return false;
  }
}

async function verifySetup() {
  console.log("🔍 Universal NFT - Setup Verification");
  console.log("=====================================");
  
  let allGood = true;
  
  // Check prerequisites
  console.log("\n📋 Prerequisites:");
  allGood &= checkCommand('solana --version', 'Solana CLI');
  allGood &= checkCommand('anchor --version', 'Anchor CLI');
  allGood &= checkCommand('node --version', 'Node.js');
  allGood &= checkCommand('rustc --version', 'Rust');
  
  // Check Solana configuration
  console.log("\n⚙️  Solana Configuration:");
  try {
    const config = execSync('solana config get', { encoding: 'utf8' });
    console.log("✅ Solana config:");
    config.split('\n').forEach(line => {
      if (line.trim()) console.log(`   ${line}`);
    });
    
    // Check if on devnet
    if (config.includes('devnet')) {
      console.log("✅ Cluster set to devnet");
    } else {
      console.log("⚠️  Not on devnet - run: solana config set --url devnet");
    }
  } catch (error) {
    console.log("❌ Could not get Solana config");
    allGood = false;
  }
  
  // Check wallet balance
  console.log("\n💰 Wallet Balance:");
  try {
    const balance = execSync('solana balance', { encoding: 'utf8' });
    const balanceNum = parseFloat(balance);
    console.log(`✅ Balance: ${balance.trim()}`);
    
    if (balanceNum < 0.1) {
      console.log("⚠️  Low balance! Get devnet SOL: https://faucet.solana.com/");
    }
  } catch (error) {
    console.log("❌ Could not check balance");
    allGood = false;
  }
  
  // Check project files
  console.log("\n📁 Project Files:");
  allGood &= checkFile('Anchor.toml', 'Anchor.toml');
  allGood &= checkFile('Cargo.toml', 'Cargo.toml');
  allGood &= checkFile('programs/universal-nft/src/lib.rs', 'Program source');
  allGood &= checkFile('programs/universal-nft/Cargo.toml', 'Program Cargo.toml');
  
  // Check scripts
  console.log("\n📜 Scripts:");
  allGood &= checkFile('scripts/deploy-and-test.sh', 'Deployment script');
  allGood &= checkFile('initialize-program.js', 'Initialize script');
  allGood &= checkFile('test-minting.js', 'Minting test script');
  allGood &= checkFile('test-cross-chain.js', 'Cross-chain test script');
  
  // Check if executable
  try {
    const stats = fs.statSync('scripts/deploy-and-test.sh');
    if (stats.mode & parseInt('111', 8)) {
      console.log("✅ Deployment script is executable");
    } else {
      console.log("⚠️  Deployment script not executable - run: chmod +x scripts/deploy-and-test.sh");
    }
  } catch (error) {
    console.log("❌ Could not check script permissions");
  }
  
  // Check frontend
  console.log("\n🌐 Frontend:");
  allGood &= checkFile('frontend/package.json', 'Frontend package.json');
  allGood &= checkFile('frontend/src/lib/config.ts', 'Frontend config');
  allGood &= checkFile('frontend/src/lib/universal-nft-service.ts', 'NFT service');
  
  // Try to build (quick check)
  console.log("\n🔨 Build Check:");
  try {
    console.log("Checking if program can build...");
    execSync('anchor build --skip-lint', { stdio: 'pipe' });
    console.log("✅ Program builds successfully");
  } catch (error) {
    console.log("❌ Program build failed");
    console.log("💡 Try running: anchor build");
    allGood = false;
  }
  
  // Check IDL exists after build
  if (fs.existsSync('target/idl/universal_nft.json')) {
    console.log("✅ Program IDL generated");
  } else {
    console.log("⚠️  Program IDL not found - run: anchor build");
  }
  
  // Summary
  console.log("\n📊 Verification Summary:");
  console.log("========================");
  
  if (allGood) {
    console.log("🎉 All checks passed! Ready for deployment.");
    console.log("\n🚀 Next steps:");
    console.log("1. Run: ./scripts/deploy-and-test.sh devnet");
    console.log("2. Run: node initialize-program.js");
    console.log("3. Run: node test-minting.js");
    console.log("4. Run: node test-cross-chain.js");
  } else {
    console.log("⚠️  Some issues found. Please fix them before deployment.");
    console.log("\n🔧 Common fixes:");
    console.log("- Install missing tools");
    console.log("- Set Solana cluster: solana config set --url devnet");
    console.log("- Get devnet SOL: solana airdrop 2");
    console.log("- Make script executable: chmod +x scripts/deploy-and-test.sh");
  }
  
  console.log("\n📚 Documentation:");
  console.log("- Deployment Guide: DEPLOYMENT_GUIDE.md");
  console.log("- Project README: README.md");
  console.log("- ZetaChain Docs: https://www.zetachain.com/docs/");
}

verifySetup().catch(console.error);