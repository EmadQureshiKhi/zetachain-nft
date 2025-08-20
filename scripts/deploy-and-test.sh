#!/bin/bash

# Universal NFT Deployment and Testing Script
# This script deploys the program and runs comprehensive tests

set -e  # Exit on any error

echo "🚀 Universal NFT - Deployment and Testing Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER=${1:-"devnet"}  # Default to devnet, can override with argument
PROGRAM_ID="H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC"
GATEWAY_ID="ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis"

echo -e "${BLUE}Configuration:${NC}"
echo "  Cluster: $CLUSTER"
echo "  Program ID: $PROGRAM_ID"
echo "  Gateway ID: $GATEWAY_ID"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check if solana CLI is installed
if ! command -v solana &> /dev/null; then
    print_error "Solana CLI not found. Please install it first."
    exit 1
fi

# Check if anchor CLI is installed
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

# Set Solana cluster
echo -e "${BLUE}Setting Solana cluster to $CLUSTER...${NC}"
solana config set --url $CLUSTER
print_status "Cluster set to $CLUSTER"

# Check wallet balance
echo -e "${BLUE}Checking wallet balance...${NC}"
BALANCE_RAW=$(solana balance --lamports)
# Extract just the number from the balance output
BALANCE=$(echo "$BALANCE_RAW" | grep -o '[0-9]*' | head -1)
# Simple division using awk for portability
BALANCE_SOL=$(echo "$BALANCE" | awk '{printf "%.4f", $1/1000000000}')
echo "  Balance: $BALANCE_SOL SOL ($BALANCE lamports)"

# Check if balance is less than 1 SOL (1000000000 lamports)
if [ "$BALANCE" -lt 1000000000 ]; then
    print_warning "Low balance detected. You may need more SOL for deployment."
    if [ "$CLUSTER" = "devnet" ]; then
        print_info "Get devnet SOL from: https://faucet.solana.com/"
    fi
fi

# Build the program
echo -e "${BLUE}Building Universal NFT program...${NC}"
anchor build

if [ $? -eq 0 ]; then
    print_status "Program built successfully"
else
    print_error "Program build failed"
    exit 1
fi

# Deploy the program
echo -e "${BLUE}Deploying Universal NFT program...${NC}"

# First, try to extend the program account if it exists
echo "Checking if program account needs extension..."
solana program extend $PROGRAM_ID 200000 2>/dev/null || echo "Program account doesn't exist yet or extension not needed"

# Deploy with specific program ID
anchor deploy --provider.cluster $CLUSTER --program-id $PROGRAM_ID

if [ $? -eq 0 ]; then
    print_status "Program deployed successfully"
else
    print_warning "Standard deployment failed, trying alternative approach..."
    
    # Alternative: Deploy without specifying program ID and then update
    echo "Trying deployment without program ID constraint..."
    anchor deploy --provider.cluster $CLUSTER
    
    if [ $? -eq 0 ]; then
        print_status "Program deployed successfully with alternative method"
    else
        print_error "Program deployment failed"
        print_info "This might be due to:"
        print_info "1. Insufficient SOL for deployment"
        print_info "2. Program account size limitations"
        print_info "3. Network issues"
        exit 1
    fi
fi

# Verify deployment
echo -e "${BLUE}Verifying deployment...${NC}"
PROGRAM_ACCOUNT=$(solana account $PROGRAM_ID --output json 2>/dev/null)

if [ $? -eq 0 ]; then
    print_status "Program account found on $CLUSTER"
    
    # Extract program data length
    DATA_LENGTH=$(echo $PROGRAM_ACCOUNT | jq -r '.account.data[1]')
    echo "  Program data length: $DATA_LENGTH bytes"
    
    # Check if program is executable
    EXECUTABLE=$(echo $PROGRAM_ACCOUNT | jq -r '.account.executable')
    if [ "$EXECUTABLE" = "true" ]; then
        print_status "Program is executable"
    else
        print_warning "Program is not marked as executable"
    fi
else
    print_error "Program account not found on $CLUSTER"
    exit 1
fi

# Generate program keypair info
echo -e "${BLUE}Program Information:${NC}"
echo "  Program ID: $PROGRAM_ID"
echo "  Cluster: $CLUSTER"
echo "  RPC URL: $(solana config get | grep 'RPC URL' | awk '{print $3}')"

# Calculate important PDAs
echo -e "${BLUE}Calculating Program Derived Addresses (PDAs)...${NC}"

# Program State PDA
PROGRAM_STATE_PDA=$(solana address --seed program_state --program-id $PROGRAM_ID)
echo "  Program State PDA: $PROGRAM_STATE_PDA"

# Mint Authority PDA
MINT_AUTHORITY_PDA=$(solana address --seed mint_authority --program-id $PROGRAM_ID)
echo "  Mint Authority PDA: $MINT_AUTHORITY_PDA"

# Test program functionality
echo -e "${BLUE}Testing program functionality...${NC}"

# Run basic tests
echo "Running Anchor tests..."
anchor test --skip-deploy --provider.cluster $CLUSTER

if [ $? -eq 0 ]; then
    print_status "Basic tests passed"
else
    print_warning "Some tests may have failed - check output above"
fi

# Test program state
echo -e "${BLUE}Checking program state...${NC}"
PROGRAM_STATE_ACCOUNT=$(solana account $PROGRAM_STATE_PDA --output json 2>/dev/null)

if [ $? -eq 0 ]; then
    print_status "Program state account exists"
    
    # Check if account has data
    DATA_LENGTH=$(echo $PROGRAM_STATE_ACCOUNT | jq -r '.account.data[1]')
    if [ "$DATA_LENGTH" != "0" ] && [ "$DATA_LENGTH" != "null" ]; then
        print_status "Program appears to be initialized"
    else
        print_info "Program state account exists but may not be initialized"
    fi
else
    print_info "Program state account not found (program not initialized yet)"
fi

# Create test script for frontend
echo -e "${BLUE}Creating test configuration for frontend...${NC}"

cat > frontend/src/lib/config.ts << EOF
// Auto-generated configuration from deployment script
// Generated on: $(date)

export const UNIVERSAL_NFT_PROGRAM_ID = '$PROGRAM_ID';
export const ZETACHAIN_GATEWAY_ID = '$GATEWAY_ID';
export const SOLANA_CLUSTER = '$CLUSTER';
export const PROGRAM_STATE_PDA = '$PROGRAM_STATE_PDA';
export const MINT_AUTHORITY_PDA = '$MINT_AUTHORITY_PDA';

// RPC Configuration
export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  localnet: 'http://127.0.0.1:8899',
};

export const CURRENT_RPC_URL = RPC_ENDPOINTS['$CLUSTER'] || RPC_ENDPOINTS.devnet;

// Program Information
export const DEPLOYMENT_INFO = {
  programId: '$PROGRAM_ID',
  cluster: '$CLUSTER',
  deployedAt: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
  version: '1.0.0',
};

console.log('🔧 Universal NFT Config Loaded:', DEPLOYMENT_INFO);
EOF

print_status "Frontend configuration created"

# Create deployment summary
echo -e "${BLUE}Creating deployment summary...${NC}"

cat > DEPLOYMENT_SUMMARY.md << EOF
# Universal NFT Deployment Summary

**Deployment Date:** $(date)
**Cluster:** $CLUSTER
**Program ID:** \`$PROGRAM_ID\`
**Gateway ID:** \`$GATEWAY_ID\`

## Program Derived Addresses (PDAs)

- **Program State:** \`$PROGRAM_STATE_PDA\`
- **Mint Authority:** \`$MINT_AUTHORITY_PDA\`

## RPC Information

- **Cluster:** $CLUSTER
- **RPC URL:** $(solana config get | grep 'RPC URL' | awk '{print $3}')

## Wallet Information

- **Wallet:** $(solana config get | grep 'Keypair Path' | awk '{print $3}')
- **Balance:** $BALANCE_SOL SOL

## Next Steps

1. **Initialize the program** (if not already done):
   \`\`\`bash
   # Run the initialization script
   node initialize-program.js
   \`\`\`

2. **Test NFT minting**:
   \`\`\`bash
   # Run the test minting script
   node test-minting.js
   \`\`\`

3. **Start the frontend**:
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

## Verification Commands

\`\`\`bash
# Check program account
solana account $PROGRAM_ID

# Check program state
solana account $PROGRAM_STATE_PDA

# View program logs (if running locally)
solana logs $PROGRAM_ID
\`\`\`

## ZetaChain Integration

The program is configured to work with ZetaChain Gateway:
- Gateway Program ID: \`$GATEWAY_ID\`
- Supports cross-chain NFT transfers
- Implements \`on_call\` and \`on_revert\` handlers

## Troubleshooting

If you encounter issues:

1. **Check balance**: Ensure you have enough SOL for transactions
2. **Verify cluster**: Make sure you're on the correct cluster
3. **Check logs**: Use \`solana logs\` to see transaction details
4. **Restart validator**: If using localnet, restart the test validator

For more help, check the README.md file.
EOF

print_status "Deployment summary created: DEPLOYMENT_SUMMARY.md"

# Final status
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================================"
echo -e "${GREEN}✅ Program deployed successfully to $CLUSTER${NC}"
echo -e "${GREEN}✅ Program ID: $PROGRAM_ID${NC}"
echo -e "${GREEN}✅ Frontend configuration updated${NC}"
echo -e "${GREEN}✅ Deployment summary created${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Initialize the program: node initialize-program.js"
echo "2. Test NFT minting: node test-minting.js"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo -e "${BLUE}View deployment details:${NC} cat DEPLOYMENT_SUMMARY.md"
echo -e "${BLUE}Monitor program:${NC} solana logs $PROGRAM_ID"
echo ""
print_status "Ready for cross-chain NFT operations! 🚀"