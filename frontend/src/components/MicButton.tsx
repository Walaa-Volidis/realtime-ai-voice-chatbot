'use client';

import { motion } from 'framer-motion';

interface MicButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MicButton({ isActive, onClick, disabled }: MicButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple rings when active */}
      {isActive && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full border border-violet-400/30"
              initial={{ width: 80, height: 80, opacity: 0.6 }}
              animate={{
                width: 140 + i * 30,
                height: 140 + i * 30,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed ${
          isActive
            ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'
            : 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/30'
        }`}
      >
        {isActive ? (
          /* Stop icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Mic icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
