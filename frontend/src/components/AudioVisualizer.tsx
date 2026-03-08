'use client';

import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isActive: boolean;
}

export function AudioVisualizer({ isActive }: AudioVisualizerProps) {
  const bars = 5;

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-400"
          animate={
            isActive
              ? {
                  height: [12, 32 + Math.random() * 24, 12],
                  opacity: [0.6, 1, 0.6],
                }
              : { height: 12, opacity: 0.3 }
          }
          transition={
            isActive
              ? {
                  duration: 0.6 + i * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: i * 0.08,
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}
