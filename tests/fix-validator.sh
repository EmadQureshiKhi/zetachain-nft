#!/bin/bash

echo "🔧 Fixing Solana Test Validator Issues"

# Kill any existing validators
echo "🛑 Stopping any existing validators..."
pkill -f "solana-test-validator" || true
sleep 2

# Clean up all validator data
echo "🧹 Cleaning up validator data..."
rm -rf test-ledger
rm -rf ~/.cache/solana-test-validator
rm -rf /tmp/solana-test-validator*

# Clear any corrupted genesis files
echo "🗑️ Clearing corrupted genesis files..."
find ~/.cache -name "*genesis*" -delete 2>/dev/null || true
find /tmp -name "*genesis*" -delete 2>/dev/null || true

# Try starting validator manually
echo "🚀 Starting validator manually..."
solana-test-validator --reset --ledger test-ledger --bind-address 127.0.0.1 --rpc-port 8899 &
VALIDATOR_PID=$!

echo "⏳ Waiting for validator to start..."
sleep 10

# Check if validator is running
if curl -s http://127.0.0.1:8899 > /dev/null; then
    echo "✅ Validator is running!"
    echo "🔗 RPC URL: http://127.0.0.1:8899"
    echo "📋 Validator PID: $VALIDATOR_PID"
    echo ""
    echo "💡 In another terminal, run:"
    echo "   solana config set --url http://127.0.0.1:8899"
    echo "   solana airdrop 10"
    echo "   anchor deploy"
else
    echo "❌ Validator failed to start"
    echo "💡 Try running manually: solana-test-validator --reset"
fi