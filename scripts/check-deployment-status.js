import { ethers } from 'ethers';
import 'dotenv/config';

const ZETACHAIN_CONFIG = {
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    explorer: 'https://zetachain-athens.blockscout.com'
};

async function checkTransaction(txHash) {
    console.log('🔍 Checking Transaction Status');
    console.log('==============================');
    console.log('Transaction Hash:', txHash);
    
    const provider = new ethers.JsonRpcProvider(ZETACHAIN_CONFIG.rpcUrl);
    
    try {
        // Try to get transaction
        const tx = await provider.getTransaction(txHash);
        if (tx) {
            console.log('✅ Transaction found!');
            console.log('From:', tx.from);
            console.log('To:', tx.to);
            console.log('Gas Limit:', tx.gasLimit?.toString());
            console.log('Gas Price:', tx.gasPrice?.toString());
            console.log('Block Number:', tx.blockNumber);
            
            // Try to get receipt
            try {
                const receipt = await provider.getTransactionReceipt(txHash);
                if (receipt) {
                    console.log('✅ Transaction confirmed!');
                    console.log('Status:', receipt.status === 1 ? 'Success' : 'Failed');
                    console.log('Block Number:', receipt.blockNumber);
                    console.log('Gas Used:', receipt.gasUsed.toString());
                    console.log('Contract Address:', receipt.contractAddress || 'N/A');
                    
                    if (receipt.contractAddress) {
                        console.log('\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!');
                        console.log('Contract Address:', receipt.contractAddress);
                        console.log('Explorer:', `${ZETACHAIN_CONFIG.explorer}/address/${receipt.contractAddress}`);
                        
                        return {
                            success: true,
                            contractAddress: receipt.contractAddress,
                            transactionHash: txHash,
                            blockNumber: receipt.blockNumber,
                            gasUsed: receipt.gasUsed.toString()
                        };
                    }
                } else {
                    console.log('⏳ Transaction pending...');
                }
            } catch (receiptError) {
                console.log('⏳ Receipt not available yet, transaction may be pending');
            }
        } else {
            console.log('❌ Transaction not found');
        }
    } catch (error) {
        console.error('❌ Error checking transaction:', error.message);
    }
    
    return { success: false };
}

async function main() {
    const txHash = '0x842fefbe96f5dba003a236706458b6c2ca90f4c01c0822229e4e86a7e90c0548';
    const result = await checkTransaction(txHash);
    
    if (result.success) {
        console.log('\n📋 Deployment Summary:');
        console.log('Contract Address:', result.contractAddress);
        console.log('Transaction Hash:', result.transactionHash);
        console.log('Block Number:', result.blockNumber);
        console.log('Gas Used:', result.gasUsed);
    } else {
        console.log('\n⚠️ Transaction status unclear. Check explorer manually:');
        console.log(`${ZETACHAIN_CONFIG.explorer}/tx/${txHash}`);
    }
}

main();