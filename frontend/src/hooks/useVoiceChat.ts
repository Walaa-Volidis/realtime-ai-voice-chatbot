'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface RecorderInstance {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  ondataavailable: ((data: ArrayBuffer) => void) | null;
}

declare global {
  interface Window {
    Recorder: new (config: Record<string, unknown>) => RecorderInstance;
    'ogg-opus-decoder': {
      OggOpusDecoder: new () => {
        ready: Promise<void>;
        decode: (data: Uint8Array) => Promise<{
          channelData: Float32Array[];
          samplesDecoded: number;
        }>;
        free: () => void;
      };
    };
  }
}

function getWebSocketURL(): string {
  const url = new URL(window.location.href);
  const hostname = url.hostname.replace('-web', '-moshi-web');
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${hostname}/ws`;
}

export function useVoiceChat() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const decoderRef = useRef<InstanceType<
    Window['ogg-opus-decoder']['OggOpusDecoder']
  > | null>(null);
  const recorderRef = useRef<RecorderInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scheduledEndRef = useRef<number>(0);

  const playAudio = useCallback((audioData: Float32Array) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const buffer = ctx.createBuffer(1, audioData.length, ctx.sampleRate);
    buffer.copyToChannel(new Float32Array(audioData) as unknown as Float32Array<ArrayBuffer>, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(scheduledEndRef.current, ctx.currentTime);
    source.start(startTime);
    scheduledEndRef.current = startTime + buffer.duration;
  }, []);

  const connect = useCallback(async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    setText('');

    try {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )({ sampleRate: 48000 });

      const OggOpusDecoder = window['ogg-opus-decoder'].OggOpusDecoder;
      const decoder = new OggOpusDecoder();
      await decoder.ready;
      decoderRef.current = decoder;

      const socket = new WebSocket(getWebSocketURL());
      socketRef.current = socket;

      socket.onopen = async () => {
        setStatus('connected');
        setIsListening(true);

        const rec = new window.Recorder({
          encoderPath:
            'https://cdn.jsdelivr.net/npm/opus-recorder@latest/dist/encoderWorker.min.js',
          streamPages: true,
          encoderApplication: 2049,
          encoderFrameSize: 80,
          encoderSampleRate: 24000,
          maxFramesPerPage: 1,
          numberOfChannels: 1,
        });

        rec.ondataavailable = (data: ArrayBuffer) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(data);
          }
        };

        recorderRef.current = rec;
        await rec.start();
      };

      socket.onmessage = async (event: MessageEvent) => {
        const buffer = await event.data.arrayBuffer();
        const tag = new Uint8Array(buffer)[0];
        const payload = buffer.slice(1);

        if (tag === 1) {
          const { channelData, samplesDecoded } =
            await decoderRef.current!.decode(new Uint8Array(payload));
          if (samplesDecoded > 0) playAudio(channelData[0]);
        } else if (tag === 2) {
          const newText = new TextDecoder().decode(payload);
          setText((prev) => prev + newText);
        }
      };

      socket.onerror = () => {
        setStatus('error');
        setIsListening(false);
      };

      socket.onclose = () => {
        setStatus('idle');
        setIsListening(false);
      };
    } catch {
      setStatus('error');
      setIsListening(false);
    }
  }, [playAudio]);

  const disconnect = useCallback(async () => {
    if (recorderRef.current) {
      await recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (decoderRef.current) {
      decoderRef.current.free();
      decoderRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setStatus('idle');
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
      decoderRef.current?.free();
      audioContextRef.current?.close();
    };
  }, []);

  return { status, text, isListening, connect, disconnect, setText };
}
