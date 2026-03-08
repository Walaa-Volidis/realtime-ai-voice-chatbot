'use client';

import { useVoiceChat } from '@/hooks/use-voice-chat';
import { MicButton } from '@/components/MicButton';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { StatusBadge } from '@/components/StatusBadge';
import { Transcript } from '@/components/Transcript';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { useState } from 'react';

export default function Home() {
  const { status, text, isListening, connect, disconnect } = useVoiceChat();
  const [scriptsReady, setScriptsReady] = useState(0);

  const allScriptsLoaded = scriptsReady >= 2;

  const handleToggle = () => {
    if (isListening) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/opus-recorder@latest/dist/recorder.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsReady((c) => c + 1)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/ogg-opus-decoder/dist/ogg-opus-decoder.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsReady((c) => c + 1)}
      />

      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-white">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <motion.h1
              className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Moshi Voice Chat
            </motion.h1>
            <motion.p
              className="text-sm text-zinc-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              Real-time AI voice conversation
            </motion.p>
            <StatusBadge status={status} />
          </div>

          {/* Visualizer */}
          <AudioVisualizer isActive={isListening} />

          {/* Mic button */}
          <MicButton
            isActive={isListening}
            onClick={handleToggle}
            disabled={!allScriptsLoaded || status === 'connecting'}
          />

          {status === 'connecting' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-zinc-500"
            >
              Establishing connection…
            </motion.p>
          )}

          {/* Transcript */}
          <div className="w-full">
            <Transcript text={text} />
          </div>

          {/* Footer hint */}
          <motion.p
            className="text-[11px] text-zinc-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isListening
              ? 'Speak naturally — Moshi is listening'
              : 'Tap the mic to start a conversation'}
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
