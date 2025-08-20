#!/bin/bash

echo "🚀 Starting Solana test validator with Metaplex programs..."

# Remove any existing ledger
rm -rf test-ledger

# Start validator with proper program cloning
solana-test-validator \
  --reset \
  --clone metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s \
  --clone TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA \
  --clone ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL \
  --clone 11111111111111111111111111111111 \
  --clone SysvarRent111111111111111111111111111111111 \
  --url https://api.devnet.solana.com \
  --quiet