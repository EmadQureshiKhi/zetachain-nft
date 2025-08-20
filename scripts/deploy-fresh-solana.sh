#!/bin/bash

echo "🧹 Starting Fresh Solana Program Deployment"
echo "=========================================="

# Set devnet as target
solana config set --url https://api.devnet.solana.com

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance --lamports)
echo "Current balance: $BALANCE lamports"

if [ "$BALANCE" -lt 5000000000 ]; then
    echo "⚠️ Low balance detected. Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

# Clean all caches and build artifacts
echo "🧹 Cleaning caches and build artifacts..."
rm -rf target/
rm -rf .anchor/
rm -rf node_modules/.cache/
rm -rf ~/.cache/solana/
anchor clean

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install
anchor build

# Generate new program keypair
echo "🔑 Generating new program keypair..."
PROGRAM_KEYPAIR="target/deploy/universal_nft-keypair.json"
if [ -f "$PROGRAM_KEYPAIR" ]; then
    rm "$PROGRAM_KEYPAIR"
fi

# Generate new keypair with sufficient space
solana-keygen new --outfile "$PROGRAM_KEYPAIR" --no-bip39-passphrase --force

# Get the new program ID
NEW_PROGRAM_ID=$(solana-keygen pubkey "$PROGRAM_KEYPAIR")
echo "🆔 New Program ID: $NEW_PROGRAM_ID"

# Update Anchor.toml with new program ID
echo "📝 Updating Anchor.toml..."
sed -i.bak "s/universal_nft = \".*\"/universal_nft = \"$NEW_PROGRAM_ID\"/" Anchor.toml

# Update lib.rs with new program ID
echo "📝 Updating lib.rs..."
sed -i.bak "s/declare_id!(\".*\")/declare_id!(\"$NEW_PROGRAM_ID\")/" programs/universal-nft/src/lib.rs

# Rebuild with new program ID
echo "🔨 Rebuilding with new program ID..."
anchor build

# Check program size
PROGRAM_SIZE=$(wc -c < "target/deploy/universal_nft.so")
echo "📏 Program size: $PROGRAM_SIZE bytes"

if [ "$PROGRAM_SIZE" -gt 1000000 ]; then
    echo "⚠️ Program size is large. This may require more SOL for deployment."
fi

# Deploy to devnet with retry logic
echo "🚀 Deploying to devnet..."

# Try different RPC endpoints for better reliability
RPC_ENDPOINTS=(
    "https://api.devnet.solana.com"
    "https://devnet.helius-rpc.com/?api-key=public"
    "https://solana-devnet.g.alchemy.com/v2/demo"
)

DEPLOY_SUCCESS=false

for i in {1..3}; do
    echo "🔄 Deployment attempt $i/3..."
    
    for rpc in "${RPC_ENDPOINTS[@]}"; do
        echo "📡 Trying RPC: $rpc"
        
        # Set RPC temporarily
        solana config set --url "$rpc"
        
        # Try deployment with increased timeout and smaller buffer size
        timeout 300 anchor deploy --provider.cluster devnet --provider.wallet ~/.config/solana/id.json
        
        if [ $? -eq 0 ]; then
            echo "✅ Deployment successful with RPC: $rpc"
            DEPLOY_SUCCESS=true
            break 2
        else
            echo "⚠️ Failed with RPC: $rpc, trying next..."
            sleep 5
        fi
    done
    
    if [ "$DEPLOY_SUCCESS" = false ]; then
        echo "⏳ Waiting 15 seconds before retry..."
        sleep 15
    fi
done

# Reset to default RPC
solana config set --url "https://api.devnet.solana.com"

if [ "$DEPLOY_SUCCESS" = true ]; then
    echo "✅ Program deployed successfully!"
    echo "🆔 Program ID: $NEW_PROGRAM_ID"
    echo "🌐 Network: Devnet"
    
    # Calculate Program State PDA
    echo "📍 Calculating Program State PDA..."
    PROGRAM_STATE_PDA=$(solana address --program-id "$NEW_PROGRAM_ID" --seed "program_state")
    echo "📊 Program State PDA: $PROGRAM_STATE_PDA"
    
    # Save deployment info
    cat > deployment-info.json << EOF
{
  "programId": "$NEW_PROGRAM_ID",
  "programStatePda": "$PROGRAM_STATE_PDA",
  "network": "devnet",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "rpcUrl": "https://api.devnet.solana.com"
}
EOF
    
    echo "💾 Deployment info saved to deployment-info.json"
    
    # Update frontend config
    echo "🔧 Updating frontend configuration..."
    if [ -f "frontend/src/lib/config.ts" ]; then
        sed -i.bak "s/export const UNIVERSAL_NFT_PROGRAM_ID = '.*'/export const UNIVERSAL_NFT_PROGRAM_ID = '$NEW_PROGRAM_ID'/" frontend/src/lib/config.ts
        sed -i.bak "s/export const PROGRAM_STATE_PDA = '.*'/export const PROGRAM_STATE_PDA = '$PROGRAM_STATE_PDA'/" frontend/src/lib/config.ts
        echo "✅ Frontend config updated"
    fi
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "======================"
    echo "Program ID: $NEW_PROGRAM_ID"
    echo "Program State PDA: $PROGRAM_STATE_PDA"
    echo "Explorer: https://explorer.solana.com/address/$NEW_PROGRAM_ID?cluster=devnet"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Initialize the program"
    echo "2. Update IDL and test discriminators"
    echo "3. Test frontend integration"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi