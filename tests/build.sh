#!/bin/bash

# Simple build script for Universal NFT program
echo "🔨 Building Universal NFT program..."

# Remove any problematic lock files
rm -f Cargo.lock

# Build the program directly
cd programs/universal-nft
cargo build-sbf --sbf-out-dir=../../target/deploy

echo "✅ Build complete!"
echo "📋 Program built at: target/deploy/universal_nft.so"