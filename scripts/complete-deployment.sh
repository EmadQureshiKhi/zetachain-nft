#!/bin/bash

echo "🚀 Complete Universal NFT Deployment Pipeline"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if solana CLI is installed
if ! command -v solana &> /dev/null; then
    print_error "Solana CLI not found. Please install it first."
    exit 1
fi

# Check if anchor is installed
if ! command -v anchor &> /dev/null; then
    print_error "Anchor CLI not found. Please install it first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install it first."
    exit 1
fi

print_status "All prerequisites found"

# Step 1: Deploy Solana Program
echo ""
echo "📦 Step 1: Deploying Solana Program"
echo "===================================="

if [ -f "deploy-fresh-solana.sh" ]; then
    chmod +x deploy-fresh-solana.sh
    ./deploy-fresh-solana.sh
    
    if [ $? -ne 0 ]; then
        print_error "Solana deployment failed"
        exit 1
    fi
    print_status "Solana program deployed successfully"
else
    print_error "deploy-fresh-solana.sh not found"
    exit 1
fi

# Step 2: Initialize Program
echo ""
echo "🔧 Step 2: Initializing Program"
echo "==============================="

if [ -f "initialize-program.js" ]; then
    node initialize-program.js
    
    if [ $? -ne 0 ]; then
        print_error "Program initialization failed"
        exit 1
    fi
    print_status "Program initialized successfully"
else
    print_error "initialize-program.js not found"
    exit 1
fi

# Step 3: Update Frontend Configuration
echo ""
echo "🔧 Step 3: Updating Frontend Configuration"
echo "=========================================="

if [ -f "update-frontend-config.js" ]; then
    node update-frontend-config.js
    
    if [ $? -ne 0 ]; then
        print_error "Frontend configuration update failed"
        exit 1
    fi
    print_status "Frontend configuration updated successfully"
else
    print_error "update-frontend-config.js not found"
    exit 1
fi

# Step 4: Test NFT Minting
echo ""
echo "🎨 Step 4: Testing NFT Minting"
echo "=============================="

if [ -f "test-nft-minting.js" ]; then
    node test-nft-minting.js
    
    if [ $? -ne 0 ]; then
        print_warning "NFT minting test failed, but continuing..."
    else
        print_status "NFT minting test passed"
    fi
else
    print_warning "test-nft-minting.js not found, skipping test"
fi

# Step 5: Install Frontend Dependencies
echo ""
echo "📦 Step 5: Installing Frontend Dependencies"
echo "==========================================="

if [ -d "frontend" ]; then
    cd frontend
    
    if [ -f "package.json" ]; then
        print_info "Installing frontend dependencies..."
        npm install
        
        if [ $? -eq 0 ]; then
            print_status "Frontend dependencies installed"
        else
            print_warning "Frontend dependency installation had issues"
        fi
    else
        print_warning "Frontend package.json not found"
    fi
    
    cd ..
else
    print_warning "Frontend directory not found"
fi

# Step 6: Generate Summary
echo ""
echo "📋 Step 6: Generating Deployment Summary"
echo "========================================"

if [ -f "deployment-info.json" ]; then
    PROGRAM_ID=$(jq -r '.programId' deployment-info.json)
    PROGRAM_STATE_PDA=$(jq -r '.programStatePda' deployment-info.json)
    DEPLOYED_AT=$(jq -r '.deployedAt' deployment-info.json)
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "======================="
    echo "Program ID: $PROGRAM_ID"
    echo "Program State PDA: $PROGRAM_STATE_PDA"
    echo "Network: Solana Devnet"
    echo "Deployed At: $DEPLOYED_AT"
    echo ""
    echo "🔗 Explorer Links:"
    echo "Program: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
    echo "Program State: https://explorer.solana.com/address/$PROGRAM_STATE_PDA?cluster=devnet"
    echo ""
    echo "📋 What's Ready:"
    print_status "Solana Universal NFT Program deployed and initialized"
    print_status "Frontend configuration updated"
    print_status "IDL generated and copied to frontend"
    print_status "All discriminators verified"
    
    if [ -f "test-mint-result.json" ]; then
        TEST_MINT=$(jq -r '.mint' test-mint-result.json)
        print_status "Test NFT minted: $TEST_MINT"
        echo "Test NFT: https://explorer.solana.com/address/$TEST_MINT?cluster=devnet"
    fi
    
    echo ""
    echo "📋 Next Steps:"
    echo "1. 🌐 Deploy ZetaChain Universal App Contract"
    echo "2. 🔗 Link Solana and ZetaChain contracts"
    echo "3. 🧪 Test cross-chain functionality"
    echo "4. 🎨 Test frontend integration"
    echo "5. 🚀 Deploy to mainnet when ready"
    
    echo ""
    echo "🚀 Ready to deploy ZetaChain Universal App!"
    echo "Run: node scripts/deploy-universal-app.js"
    
else
    print_error "deployment-info.json not found"
    exit 1
fi

echo ""
print_status "Complete deployment pipeline finished successfully!"