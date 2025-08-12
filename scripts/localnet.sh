#!/bin/bash

# Universal NFT Solana Localnet Setup Script
# This script sets up a local Solana test validator and deploys the Universal NFT program

set -e

echo "🚀 Starting Universal NFT Localnet Setup..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install it first."
    exit 1
fi

# Kill any existing test validator
echo "🔄 Stopping any existing test validator..."
pkill -f "solana-test-validator" || true
sleep 2

# Start test validator with required programs
echo "🏗️  Starting Solana test validator..."
solana-test-validator \
    --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s /Users/$USER/.local/share/solana/install/releases/1.18.0/solana-release/bin/spl_token_metadata.so \
    --reset \
    --quiet &

# Wait for validator to start
echo "⏳ Waiting for validator to start..."
sleep 5

# Set Solana config to use localnet
solana config set --url localhost

# Build and deploy the program
echo "🔨 Building Universal NFT program..."
anchor build

echo "🚀 Deploying Universal NFT program..."
anchor deploy

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/universal_nft-keypair.json)
echo "📋 Universal NFT Program ID: $PROGRAM_ID"

# Initialize the program
echo "🎯 Initializing Universal NFT program..."
# This would typically be done through a client script
# For now, we'll just show the program is deployed

echo "✅ Universal NFT program deployed successfully!"
echo "🌐 Program ID: $PROGRAM_ID"
echo "🔗 RPC URL: http://localhost:8899"
echo "💡 You can now test cross-chain NFT transfers between ZetaChain, Ethereum, BNB, and Solana"

# Keep the validator running
echo "🔄 Test validator is running. Press Ctrl+C to stop."
wait