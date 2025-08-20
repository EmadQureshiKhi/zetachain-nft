#!/bin/bash

echo "🚀 Deploying Universal NFT Program to Devnet..."
echo "=================================================="

# Set Solana config to devnet
echo "🌐 Setting Solana cluster to devnet..."
solana config set --url https://api.devnet.solana.com

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

# Check if we have enough SOL (need at least 5 SOL for deployment)
if [[ "$BALANCE" == "0 SOL" ]]; then
    echo "💸 Requesting devnet airdrop..."
    solana airdrop 5
    sleep 5
    solana airdrop 5
    sleep 5
fi

# Build the program
echo "🔨 Building program..."
anchor build

# Deploy to devnet
echo "🚀 Deploying to devnet..."
anchor deploy --provider.cluster devnet

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/universal_nft-keypair.json)
echo "📋 Program ID: $PROGRAM_ID"

# Update Anchor.toml with devnet config
echo "📝 Updating Anchor.toml..."
cat > Anchor.toml << EOF
[features]
seeds = false
skip-lint = false

[programs.localnet]
universal_nft = "$PROGRAM_ID"

[programs.devnet]
universal_nft = "$PROGRAM_ID"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
EOF

echo "✅ Deployment to devnet complete!"
echo "📋 Program ID: $PROGRAM_ID"
echo "🌐 Network: Devnet"
echo "🔗 Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"

# Initialize the program
echo "⚡ Initializing program on devnet..."
npx ts-node scripts/initialize-program.ts

echo "🎉 Universal NFT Program is live on Devnet!"
echo "✅ Ready for hackathon demo!"