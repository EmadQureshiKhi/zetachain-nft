import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: number, decimals = 4): string {
  return balance.toFixed(decimals);
}

export function getChainColor(chain: string): string {
  const colors = {
    solana: '#9945FF',
    ethereum: '#627EEA',
    bnb: '#F3BA2F',
    zetachain: '#00D4AA',
  };
  return colors[chain as keyof typeof colors] || '#6B7280';
}

export function getChainIcon(chain: string): string {
  const icons = {
    solana: '🟣',
    ethereum: '🔵',
    bnb: '🟡',
    zetachain: '🟢',
  };
  return icons[chain as keyof typeof icons] || '⚪';
}