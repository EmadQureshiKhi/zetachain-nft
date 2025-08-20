'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

export function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const { disconnect, connected, publicKey } = useWallet();

    const handleLogout = async () => {
        try {
            await disconnect();
            toast.success('Wallet disconnected successfully!');
            setShowConfirm(false);
        } catch (error) {
            toast.error('Failed to disconnect wallet');
            console.error('Logout error:', error);
        }
    };

    if (!connected) return null;

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:border-red-400"
            >
                🚪 Logout
            </Button>

            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute right-0 top-full mt-2 bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl z-50 min-w-[280px]"
                    >
                        <div className="text-center">
                            <div className="text-2xl mb-2">⚠️</div>
                            <h3 className="text-white font-semibold mb-2">Disconnect Wallet?</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                You'll need to reconnect to view your NFTs and make transfers.
                            </p>

                            {publicKey && (
                                <div className="bg-gray-800/50 rounded-lg p-2 mb-4">
                                    <p className="text-gray-400 text-xs">Disconnecting:</p>
                                    <p className="text-white font-mono text-sm">
                                        {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setShowConfirm(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}