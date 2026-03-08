'use client';

import { motion } from 'framer-motion';
import type { ConnectionStatus } from '@/hooks/useVoiceChat';

interface StatusBadgeProps {
  status: ConnectionStatus;
}

const config: Record<
  ConnectionStatus,
  { label: string; color: string; pulse: boolean }
> = {
  idle: { label: 'Ready', color: 'bg-zinc-500', pulse: false },
  connecting: { label: 'Connecting…', color: 'bg-amber-400', pulse: true },
  connected: { label: 'Live', color: 'bg-emerald-400', pulse: true },
  error: { label: 'Error', color: 'bg-red-500', pulse: false },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color, pulse } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur"
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${color}`}
        />
      </span>
      {label}
    </motion.div>
  );
}
