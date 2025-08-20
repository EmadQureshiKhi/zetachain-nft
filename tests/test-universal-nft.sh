#!/bin/bash

echo "🧪 Universal NFT Platform Testing Guide"
echo "======================================="

echo ""
echo "📋 TESTING CHECKLIST:"
echo "====================="

echo ""
echo "1️⃣  START FRONTEND:"
echo "   cd frontend && npm run dev"
echo "   → Open http://localhost:3000"

echo ""
echo "2️⃣  VERIFY PROGRAM DEPLOYMENT:"
echo "   solana program show 6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2 --url devnet"

echo ""
echo "3️⃣  CHECK WALLET SETUP:"
echo "   solana config get"
echo "   solana balance --url devnet"

echo ""
echo "4️⃣  FRONTEND TESTING STEPS:"
echo "   ✅ Connect Solana wallet (Phantom/Solflare)"
echo "   ✅ Switch to Testnet mode in header"
echo "   ✅ Go to 'Demo & Features' tab"
echo "   ✅ Click 'Test Solana Connection'"
echo "   ✅ Click 'Load Sample NFTs'"
echo "   ✅ Go to 'My NFTs' tab to see loaded NFTs"
echo "   ✅ Try 'Mint Universal NFT' tab"

echo ""
echo "5️⃣  PROGRAM VERIFICATION:"
echo "   🔍 Check debug panels (bottom right)"
echo "   🔍 Open browser console for logs"
echo "   🔍 Verify program state in Universal NFT Debug"

echo ""
echo "🎯 DEMO FLOW FOR HACKATHON:"
echo "=========================="
echo "1. Show wallet connection"
echo "2. Demonstrate Devnet connection test"
echo "3. Load sample Universal NFTs"
echo "4. Show cross-chain transfer interface"
echo "5. Explain Universal Token IDs"
echo "6. Show program deployment on Solana Explorer"

echo ""
echo "🔗 USEFUL LINKS:"
echo "==============="
echo "Frontend: http://localhost:3000"
echo "Program Explorer: https://explorer.solana.com/address/6r7tAq8XqdAs5TZtpWEJejjdG7vC2iYQVuGkqJ1uGTG2?cluster=devnet"
echo "Devnet Faucet: https://faucet.solana.com/"

echo ""
echo "🚀 Ready to test! Run the commands above step by step."