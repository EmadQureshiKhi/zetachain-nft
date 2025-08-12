#!/bin/bash

echo "🚀 Testing Universal NFT Program Deployment"

# Clean up any existing validator
pkill -f "solana-test-validator" || true
rm -rf test-ledger

# Start local validator with clean state
echo "📡 Starting Solana test validator..."
solana-test-validator --reset --ledger test-ledger --quiet &
VALIDATOR_PID=$!

# Wait for validator to start
echo "⏳ Waiting for validator to start..."
sleep 8

# Set config to localhost
solana config set --url localhost

# Fund the default keypair
echo "💰 Funding wallet..."
solana airdrop 10

# Deploy the program
echo "🚀 Deploying Universal NFT program..."
anchor deploy

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/universal_nft-keypair.json)
echo "📋 Program deployed at: $PROGRAM_ID"

# Verify deployment
echo "✅ Verifying deployment..."
solana account $PROGRAM_ID

echo "🎉 Deployment test complete!"
echo "Program ID: $PROGRAM_ID"
echo "RPC URL: http://localhost:8899"

# Keep validator running for testing
echo "💡 Test validator is running. Press Ctrl+C to stop."
wait $VALIDATOR_PID