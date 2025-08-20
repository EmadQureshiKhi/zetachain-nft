#!/bin/bash

echo "🚀 Starting Solana test validator with required programs..."

# Stop any existing validator
pkill -f solana-test-validator

# Start validator with Metaplex Token Metadata program
solana-test-validator \
  --reset \
  --clone metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s \
  --clone TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA \
  --clone ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL \
  --url devnet