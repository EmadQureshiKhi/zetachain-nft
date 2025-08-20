'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { useUniversalNFT } from '@/hooks/useUniversalNFT';
import { UniversalNFTMetadata } from '@/lib/universal-nft-service';
import { ProgramStatus } from './ProgramStatus';
import { motion } from 'framer-motion';

export function UniversalNFTMinter() {
  const { connected } = useWallet();
  const { mintNFT, loading } = useUniversalNFT();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    image: '',
    attributes: [{ trait_type: '', value: '' }],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleMint = async () => {
    if (!connected) return;

    // Validate form
    if (!formData.name || !formData.symbol || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const metadata: UniversalNFTMetadata = {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: formData.image || '/placeholder-nft.png',
      attributes: formData.attributes.filter(attr => attr.trait_type && attr.value),
    };

    const result = await mintNFT({ metadata });
    
    if (result) {
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: '',
        attributes: [{ trait_type: '', value: '' }],
      });
      setIsOpen(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🔗</div>
        <h3 className="text-xl font-bold text-white mb-2">Connect Wallet to Mint</h3>
        <p className="text-gray-400">
          Connect your Solana wallet to start minting Universal NFTs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Universal NFT Minter</h2>
        <p className="text-gray-400">
          Create cross-chain compatible NFTs powered by ZetaChain
        </p>
      </div>

      {/* Program Status */}
      <ProgramStatus />

      {/* Mint Button */}
      {!isOpen && (
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            🎨 Create Universal NFT
          </Button>
        </div>
      )}

      {/* Minting Form */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Universal NFT"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbol *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                placeholder="UNFT"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="A unique cross-chain NFT that can travel between blockchains..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/my-nft-image.png"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default placeholder image
            </p>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Attributes
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addAttribute}
                className="text-xs"
              >
                + Add Attribute
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                    placeholder="Trait Type"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  {formData.attributes.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                      className="text-red-400 hover:text-red-300 border-red-400/50 hover:border-red-300"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMint}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Minting...
                </div>
              ) : (
                '🚀 Mint Universal NFT'
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-400 text-lg">🚀</div>
              <div>
                <h4 className="text-green-300 font-medium mb-1">Universal NFT Features (Production Ready)</h4>
                <ul className="text-sm text-green-200/80 space-y-1">
                  <li>• ✅ <strong>Live on Solana Devnet</strong> - Fully deployed and operational</li>
                  <li>• 🌉 <strong>ZetaChain Integration</strong> - Real cross-chain compatibility</li>
                  <li>• 🔑 <strong>Universal Token IDs</strong> - Unique across all chains</li>
                  <li>• 📊 <strong>Origin Tracking</strong> - Complete transfer history</li>
                  <li>• 🔗 <strong>Multi-Chain Support</strong> - Ethereum, BNB, Polygon, Avalanche & more</li>
                  <li>• 📝 <strong>Metaplex Compatible</strong> - Standard NFT metadata</li>
                  <li>• 🛡️ <strong>Production Security</strong> - Comprehensive error handling</li>
                </ul>
                <div className="mt-3 p-2 bg-green-800/30 rounded text-xs">
                  <strong>Program ID:</strong> H39bbzuL3aYxCATxRtzwjitGJ2SiTxYtBB8yyoRt92YC
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}