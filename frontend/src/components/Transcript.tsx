'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptProps {
  text: string;
}

export function Transcript({ text }: TranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur scrollbar-thin scrollbar-thumb-white/10"
    >
      <AnimatePresence>
        {text ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap break-words"
          >
            {text}
          </motion.p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="text-sm italic text-zinc-500"
          >
            Transcript will appear here…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
