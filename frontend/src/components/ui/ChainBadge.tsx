import React from 'react';
import { motion } from 'framer-motion';
import { getChainColor, getChainIcon } from '@/lib/utils';
import { CHAIN_CONFIG } from '@/lib/config';

interface ChainBadgeProps {
  chain: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function ChainBadge({ chain, size = 'md', showName = true }: ChainBadgeProps) {
  const config = CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG];
  
  if (!config) return null;
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center rounded-full font-medium ${sizes[size]}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span className="mr-1">{config.icon}</span>
      {showName && <span>{config.name}</span>}
    </motion.div>
  );
}