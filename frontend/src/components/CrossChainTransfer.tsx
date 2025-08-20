import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { UniversalNFTService } from '../lib/universal-nft-service';
import { CURRENT_RPC_URL } from '../lib/config';

interface NFTInfo {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  isTransferable: boolean;
}

interface TransferFormData {
  nftMint: string;
  destinationChain: number;
  recipientAddress: string;
}

export const CrossChainTransfer: React.FC = () => {
  const [wallet, setWallet] = useState<PublicKey | null>(null);
  const [service, setService] = useState<UniversalNFTService | null>(null);
  const [userNFTs, setUserNFTs] = useState<NFTInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [transferResult, setTransferResult] = useState<{ transaction: string } | null>(null);

  const [formData, setFormData] = useState<TransferFormData>({
    nftMint: '',
    destinationChain: 1, // Ethereum
    recipientAddress: ''
  });

  useEffect(() => {
    initializeService();
  }, []);

  useEffect(() => {
    if (wallet && service) {
      loadUserNFTs();
    }
  }, [wallet, service]);

  const initializeService = async () => {
    try {
      const connection = new Connection(CURRENT_RPC_URL, 'confirmed');
      const nftService = new UniversalNFTService(connection);
      setService(nftService);
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

  const loadUserNFTs = async () => {
    if (!wallet || !service) return;

    try {
      setIsLoading(true);
      setStatus({ message: 'Loading your NFTs...', type: 'info' });

      // This is a simplified version - in a real implementation, you'd query
      // the user's token accounts and filter for NFTs from your program
      const mockNFTs: NFTInfo[] = [
        {
          mint: 'EG9TdGCFHENpKTz7DBHiorYpQWwa74eArCzki8xKwhjq',
          name: 'Universal NFT #1',
          symbol: 'UNFT',
          image: 'https://via.placeholder.com/200x200?text=NFT+1',
          isTransferable: true
        }
      ];

      // Check transferability for each NFT
      for (const nft of mockNFTs) {
        try {
          const mint = new PublicKey(nft.mint);
          nft.isTransferable = await service.isNFTTransferable(mint);
        } catch (error) {
          nft.isTransferable = false;
        }
      }

      setUserNFTs(mockNFTs);
      setStatus({ message: `Found ${mockNFTs.length} NFT(s)`, type: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({ message: `Failed to load NFTs: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const transferNFT = async () => {
    if (!wallet || !service) {
      setStatus({ message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    if (!formData.nftMint || !formData.recipientAddress) {
      setStatus({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ message: 'Creating cross-chain transfer transaction...', type: 'info' });

      const mint = new PublicKey(formData.nftMint);
      
      // Convert recipient address to bytes (simplified - you'd need proper address conversion)
      const recipientBytes = new Uint8Array(32);
      const recipientHex = formData.recipientAddress.replace('0x', '');
      if (recipientHex.length === 40) { // Ethereum address
        const addressBytes = Buffer.from(recipientHex, 'hex');
        recipientBytes.set(addressBytes, 12); // Pad to 32 bytes
      } else {
        throw new Error('Invalid recipient address format');
      }

      const transaction = await service.transferCrossChain(
        wallet,
        mint,
        formData.destinationChain,
        recipientBytes
      );

      setStatus({ message: 'Please sign the transaction in your wallet...', type: 'info' });

      const signature = await window.solana.signAndSendTransaction(transaction);
      
      setStatus({ message: 'Transaction sent! Waiting for confirmation...', type: 'info' });

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      setTransferResult({
        transaction: signature.signature
      });

      setStatus({ message: '🌉 Cross-chain transfer initiated successfully!', type: 'success' });

      // Reset form
      setFormData({
        nftMint: '',
        destinationChain: 1,
        recipientAddress: ''
      });

      // Reload NFTs
      await loadUserNFTs();

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({ message: `Failed to transfer NFT: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const supportedChains = service?.getSupportedChains() || [];

  return (
    <div className="cross-chain-transfer">
      <div className="header">
        <h1>🌉 Cross-Chain NFT Transfer</h1>
        <p>Transfer your Universal NFTs to other blockchains via ZetaChain</p>
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
            <button onClick={loadUserNFTs} disabled={isLoading} className="refresh-btn">
              🔄 Refresh NFTs
            </button>
          </div>
        )}
      </div>

      {/* NFT Selection */}
      {wallet && (
        <div className="transfer-form">
          <h3>🎨 Select NFT to Transfer</h3>
          
          <div className="nft-grid">
            {userNFTs.map((nft) => (
              <div 
                key={nft.mint} 
                className={`nft-card ${formData.nftMint === nft.mint ? 'selected' : ''} ${!nft.isTransferable ? 'disabled' : ''}`}
                onClick={() => nft.isTransferable && setFormData(prev => ({ ...prev, nftMint: nft.mint }))}
              >
                <img src={nft.image} alt={nft.name} />
                <div className="nft-info">
                  <h4>{nft.name}</h4>
                  <p>{nft.symbol}</p>
                  <p className="mint-address">{nft.mint.slice(0, 8)}...</p>
                  {!nft.isTransferable && (
                    <p className="warning">⚠️ Not transferable</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {formData.nftMint && (
            <div className="transfer-details">
              <div className="form-group">
                <label>Destination Chain *</label>
                <select
                  value={formData.destinationChain}
                  onChange={(e) => setFormData(prev => ({ ...prev, destinationChain: parseInt(e.target.value) }))}
                >
                  {supportedChains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name} ({chain.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Recipient Address *</label>
                <input
                  type="text"
                  value={formData.recipientAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))}
                  placeholder="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
                />
                <small>Enter the recipient's address on the destination chain</small>
              </div>

              <button 
                onClick={transferNFT} 
                disabled={isLoading || !formData.recipientAddress}
                className="transfer-btn"
              >
                {isLoading ? 'Transferring...' : '🌉 Transfer Cross-Chain'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* Transfer Result */}
      {transferResult && (
        <div className="transfer-result">
          <h3>🎉 Transfer Initiated!</h3>
          <div className="result-details">
            <p><strong>Transaction:</strong> <code>{transferResult.transaction}</code></p>
            <div className="links">
              <a 
                href={`https://explorer.solana.com/tx/${transferResult.transaction}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction on Solana Explorer
              </a>
            </div>
            <div className="info-box">
              <h4>📋 What happens next?</h4>
              <ol>
                <li>Your NFT has been burned on Solana</li>
                <li>ZetaChain will process the cross-chain message</li>
                <li>The NFT will be minted on the destination chain</li>
                <li>You can track the progress on ZetaChain explorer</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cross-chain-transfer {
          max-width: 1000px;
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

        .wallet-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .connect-btn, .transfer-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }

        .connect-btn:hover, .transfer-btn:hover {
          background: #45a049;
        }

        .connect-btn:disabled, .transfer-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          background: #e8f5e8;
          padding: 10px;
          border-radius: 6px;
          font-family: monospace;
        }

        .refresh-btn {
          background: #2196F3;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .transfer-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .nft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .nft-card {
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nft-card:hover {
          border-color: #4CAF50;
          transform: translateY(-2px);
        }

        .nft-card.selected {
          border-color: #4CAF50;
          background: #e8f5e8;
        }

        .nft-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nft-card img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .nft-info h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .nft-info p {
          margin: 2px 0;
          color: #666;
          font-size: 14px;
        }

        .mint-address {
          font-family: monospace;
          font-size: 12px;
        }

        .warning {
          color: #f44336 !important;
          font-weight: bold;
        }

        .transfer-details {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group small {
          color: #666;
          font-size: 12px;
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

        .transfer-result {
          background: #e8f5e8;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #4CAF50;
        }

        .transfer-result h3 {
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
          margin: 15px 0;
        }

        .links a {
          color: #4CAF50;
          text-decoration: none;
        }

        .links a:hover {
          text-decoration: underline;
        }

        .info-box {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 6px;
          margin-top: 15px;
        }

        .info-box h4 {
          margin-top: 0;
          color: #333;
        }

        .info-box ol {
          margin: 10px 0;
          padding-left: 20px;
        }

        .info-box li {
          margin-bottom: 5px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default CrossChainTransfer;