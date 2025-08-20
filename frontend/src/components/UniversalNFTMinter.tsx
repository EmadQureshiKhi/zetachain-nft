import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { UniversalNFTService } from '../lib/universal-nft-service';
import { CURRENT_RPC_URL } from '../lib/config';

interface NFTFormData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

interface ProgramState {
  initialized: boolean;
  totalMinted: string;
  nextTokenId: string;
  authority: string;
  error?: string;
}

export const UniversalNFTMinter: React.FC = () => {
  const [wallet, setWallet] = useState<PublicKey | null>(null);
  const [service, setService] = useState<UniversalNFTService | null>(null);
  const [programState, setProgramState] = useState<ProgramState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [mintResult, setMintResult] = useState<{ mint: string; transaction: string } | null>(null);

  const [formData, setFormData] = useState<NFTFormData>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    attributes: [
      { trait_type: 'Type', value: 'Universal NFT' },
      { trait_type: 'Network', value: 'Solana' }
    ]
  });

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      const connection = new Connection(CURRENT_RPC_URL, 'confirmed');
      const nftService = new UniversalNFTService(connection);
      setService(nftService);

      // Check program state
      const state = await nftService.getProgramState();
      setProgramState({
        initialized: state.initialized,
        totalMinted: state.totalMinted?.toString() || '0',
        nextTokenId: state.nextTokenId?.toString() || '1',
        authority: state.authority?.toString() || 'Unknown',
        error: state.error
      });

      if (state.initialized) {
        setStatus({ message: 'Universal NFT program is ready!', type: 'success' });
      } else {
        setStatus({ message: `Program not initialized: ${state.error}`, type: 'error' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({ message: `Failed to initialize service: ${message}`, type: 'error' });
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        setStatus({ message: 'Please install Phantom wallet', type: 'error' });
        return;
      }

      setIsLoading(true);
      setStatus({ message: 'Connecting to wallet...', type: 'info' });

      const response = await window.solana.connect();
      setWallet(response.publicKey);
      setStatus({ message: `Connected to ${response.publicKey.toString().slice(0, 8)}...`, type: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({ message: `Failed to connect wallet: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFT = async () => {
    if (!wallet || !service) {
      setStatus({ message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    if (!formData.name || !formData.symbol || !formData.description) {
      setStatus({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ message: 'Creating NFT transaction...', type: 'info' });

      const mintParams = {
        metadata: {
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          image: formData.image || 'https://via.placeholder.com/400x400?text=Universal+NFT',
          attributes: formData.attributes.filter(attr => attr.trait_type && attr.value)
        }
      };

      const result = await service.mintNFT(wallet, mintParams);

      setStatus({ message: 'Please sign the transaction in your wallet...', type: 'info' });

      // Sign and send transaction
      const signature = await window.solana.signAndSendTransaction(result.transaction);
      
      setStatus({ message: 'Transaction sent! Waiting for confirmation...', type: 'info' });

      // Wait for confirmation (simplified)
      await new Promise(resolve => setTimeout(resolve, 3000));

      setMintResult({
        mint: result.mint.toString(),
        transaction: signature.signature
      });

      setStatus({ message: '🎉 NFT minted successfully!', type: 'success' });

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: '',
        attributes: [
          { trait_type: 'Type', value: 'Universal NFT' },
          { trait_type: 'Network', value: 'Solana' }
        ]
      });

      // Refresh program state
      await initializeService();

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({ message: `Failed to mint NFT: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  return (
    <div className="universal-nft-minter">
      <div className="header">
        <h1>🎨 Universal NFT Minter</h1>
        <p>Create NFTs with cross-chain capabilities powered by ZetaChain</p>
      </div>

      {/* Program Status */}
      <div className="program-status">
        <h3>📋 Program Status</h3>
        <div className="status-grid">
          <div>Status: {programState?.initialized ? '✅ Ready' : '❌ Not Ready'}</div>
          <div>Total Minted: {programState?.totalMinted || '0'}</div>
          <div>Next Token ID: {programState?.nextTokenId || '1'}</div>
          <div>Network: Solana Devnet</div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="wallet-section">
        {!wallet ? (
          <button onClick={connectWallet} disabled={isLoading} className="connect-btn">
            {isLoading ? 'Connecting...' : 'Connect Phantom Wallet'}
          </button>
        ) : (
          <div className="wallet-info">
            <span>Connected: {wallet.toString().slice(0, 8)}...{wallet.toString().slice(-8)}</span>
          </div>
        )}
      </div>

      {/* NFT Form */}
      {wallet && (
        <div className="nft-form">
          <h3>🖼️ NFT Details</h3>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Awesome NFT"
              maxLength={32}
            />
          </div>

          <div className="form-group">
            <label>Symbol *</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              placeholder="MYNFT"
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A unique NFT with cross-chain capabilities"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/my-nft.png"
            />
          </div>

          <div className="attributes-section">
            <h4>🏷️ Attributes</h4>
            {formData.attributes.map((attr, index) => (
              <div key={index} className="attribute-row">
                <input
                  type="text"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                  placeholder="Trait Type"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                  placeholder="Value"
                />
                <button onClick={() => removeAttribute(index)} className="remove-btn">×</button>
              </div>
            ))}
            <button onClick={addAttribute} className="add-btn">+ Add Attribute</button>
          </div>

          <button 
            onClick={mintNFT} 
            disabled={isLoading || !programState?.initialized}
            className="mint-btn"
          >
            {isLoading ? 'Minting...' : '🎨 Mint NFT'}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* Mint Result */}
      {mintResult && (
        <div className="mint-result">
          <h3>🎉 NFT Minted Successfully!</h3>
          <div className="result-details">
            <p><strong>Mint Address:</strong> <code>{mintResult.mint}</code></p>
            <p><strong>Transaction:</strong> <code>{mintResult.transaction}</code></p>
            <div className="links">
              <a 
                href={`https://explorer.solana.com/address/${mintResult.mint}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View NFT on Solana Explorer
              </a>
              <a 
                href={`https://explorer.solana.com/tx/${mintResult.transaction}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .universal-nft-minter {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #4CAF50;
          margin-bottom: 10px;
        }

        .program-status {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          font-family: monospace;
          font-size: 14px;
        }

        .wallet-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .connect-btn, .mint-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }

        .connect-btn:hover, .mint-btn:hover {
          background: #45a049;
        }

        .connect-btn:disabled, .mint-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .wallet-info {
          background: #e8f5e8;
          padding: 10px;
          border-radius: 6px;
          font-family: monospace;
        }

        .nft-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .attributes-section {
          margin-top: 20px;
        }

        .attribute-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          align-items: center;
        }

        .attribute-row input {
          flex: 1;
        }

        .remove-btn {
          background: #f44336;
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
        }

        .add-btn {
          background: #2196F3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .status-message {
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .status-message.info {
          background: #e3f2fd;
          color: #1976d2;
          border: 1px solid #2196F3;
        }

        .status-message.success {
          background: #e8f5e8;
          color: #2e7d32;
          border: 1px solid #4CAF50;
        }

        .status-message.error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #f44336;
        }

        .mint-result {
          background: #e8f5e8;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #4CAF50;
        }

        .mint-result h3 {
          color: #2e7d32;
          margin-top: 0;
        }

        .result-details code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          word-break: break-all;
        }

        .links {
          margin-top: 15px;
        }

        .links a {
          display: inline-block;
          margin-right: 15px;
          color: #4CAF50;
          text-decoration: none;
        }

        .links a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default UniversalNFTMinter;