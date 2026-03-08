<div align="center">

# 🎙️ Real-Time AI Voice Chatbot

**Talk to an AI that talks back — instantly.**

A full-duplex, real-time voice conversation app powered by Moshi, served on serverless GPUs via Modal, with a buttery-smooth Next.js frontend.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Modal](https://img.shields.io/badge/Deployed%20on-Modal-black?logo=modal&logoColor=white)](https://modal.com)
[![Hugging Face](https://img.shields.io/badge/Models-Hugging%20Face-yellow?logo=huggingface)](https://huggingface.co/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://python.org)

</div>

---

## ✨ Features

|     | Feature                       | What it means                                                                                                      |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ⚡  | **Zero-Latency Duplex Audio** | Speak and listen simultaneously — Moshi handles full-duplex conversation, no turn-taking required                  |
| ☁️  | **Serverless GPU Scaling**    | Runs on NVIDIA A10G GPUs via Modal — scales to zero when idle, spins up on demand. Pay only for what you use       |
| 🚀  | **Edge-Ready Frontend**       | Static-exported Next.js 16 app — globally fast, no Node.js server needed in production                             |
| 🧠  | **Hugging Face Model Hub**    | Pre-trained Moshi weights (Mimi codec + LM + tokenizer) pulled directly from Hugging Face, cached in Modal Volumes |
| 🎨  | **Polished UI**               | Dark theme with Tailwind CSS 4, smooth Framer Motion animations — mic ripples, audio visualizer, live transcript   |
| 🎶  | **Opus Audio Pipeline**       | Browser-native Opus encoding/decoding via Web Workers for crystal-clear, low-bandwidth voice streaming             |

---

### WebSocket Protocol

```
Client → Server:   raw Opus-encoded audio bytes
Server → Client:   [0x01] + Opus audio bytes   (AI voice response)
                   [0x02] + UTF-8 text bytes    (live transcript)
```

---

## 🔄 Under the Hood — The Moshi + Modal Synergy

This isn't your typical chatbot. Here's what makes it different:

### Full-Duplex Conversation

Most voice assistants follow a **listen → think → respond** cycle. Moshi breaks that pattern — it can **listen and speak at the same time**, just like a real human conversation. There's no wake word, no "processing..." spinner, no awkward silence.

### How the Audio Pipeline Works

1. **🎤 Capture** — Your browser grabs mic input, encodes it as Opus in a Web Worker, and streams tiny frames over WebSocket
2. **📥 Decode** — The Modal backend receives Opus bytes and decodes them to raw PCM audio using `sphn`
3. **🧠 Infer** — PCM frames are fed through **Mimi** (neural audio codec from Hugging Face) to produce tokens, then the **Moshi language model** generates response tokens — all in real-time on an A10G GPU
4. **📤 Encode** — Response audio tokens are decoded back to waveforms via Mimi, re-encoded as Opus, and streamed back with text tokens
5. **🔊 Play** — The frontend decodes Opus audio and schedules gapless playback via Web Audio API while the transcript renders live

### Why Modal?

- **Zero infrastructure** — No Docker, no Kubernetes, no EC2 instances to manage
- **GPU on demand** — A10G GPUs spin up in seconds, scale to zero when nobody's talking
- **Persistent volumes** — Hugging Face model weights are downloaded once and cached forever
- **Two-function split** — Frontend serves on cheap CPU, model runs on expensive GPU — cost-optimized by design

### Hugging Face Integration

All model weights are hosted on and downloaded from **Hugging Face Hub** at container startup:

| Component          | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Mimi**           | Neural audio codec — encodes waveforms into discrete tokens and decodes them back  |
| **Moshi LM**       | The core language model — generates intelligent response tokens from audio input   |
| **Text Tokenizer** | SentencePiece model — converts token IDs to human-readable text for the transcript |

Weights are cached in a **Modal Volume** (`model_cache`), so subsequent cold starts skip the download entirely.

---

## 🛠️ Tech Stack

### Backend

| Technology                                                   | Role                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| **[Modal](https://modal.com)**                               | Serverless GPU cloud — NVIDIA A10G, auto-scaling, zero config |
| **[Moshi](https://github.com/kyutai-labs/moshi)**            | Full-duplex speech-to-speech model by Kyutai                  |
| **[Hugging Face Hub](https://huggingface.co/)**              | Model weight hosting & download via `hf_hub_download`         |
| **[FastAPI](https://fastapi.tiangolo.com/)**                 | Async WebSocket server + static file serving                  |
| **[PyTorch](https://pytorch.org/)**                          | GPU-accelerated model inference                               |
| **[sphn](https://pypi.org/project/sphn/)**                   | Opus audio stream encoding/decoding                           |
| **[SentencePiece](https://github.com/google/sentencepiece)** | Text tokenization for transcript output                       |
| **[NumPy](https://numpy.org/)**                              | PCM audio buffer processing                                   |
| **Python 3.11**                                              | Runtime                                                       |

### Frontend

| Technology                                                                 | Role                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------- |
| **[Next.js 16](https://nextjs.org/)**                                      | React framework — static export for edge delivery    |
| **[React 19](https://react.dev/)**                                         | UI with hooks for state & lifecycle                  |
| **[TypeScript](https://www.typescriptlang.org/)**                          | End-to-end type safety                               |
| **[Tailwind CSS 4](https://tailwindcss.com/)**                             | Utility-first dark theme styling                     |
| **[Framer Motion](https://www.framer.com/motion/)**                        | Smooth animations — ripples, visualizer, transitions |
| **[Opus Recorder](https://github.com/niclasmattsson/opus-recorder)**       | Mic capture → Opus encoding in a Web Worker          |
| **[ogg-opus-decoder](https://github.com/niclasmattsson/ogg-opus-decoder)** | Decode AI audio for real-time playback               |

---

## 📁 Project Structure

```
realtime-ai-voice-chatbot/
├── backend/
│   ├── app.py                  # Modal function — serves static frontend via FastAPI
│   ├── common.py               # Shared Modal App instance
│   ├── moshi_service.py        # GPU class — model loading, WebSocket audio pipeline
│   ├── requirements.txt        # Python dependencies
│   └── pyproject.toml          # Project metadata
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Main voice chat page
│   │   │   ├── layout.tsx          # Root layout + fonts
│   │   │   └── globals.css         # Global styles, dark theme, scrollbar
│   │   ├── components/
│   │   │   ├── MicButton.tsx           # Animated mic toggle + ripple rings
│   │   │   ├── AudioVisualizer.tsx     # Equalizer bar animation
│   │   │   ├── StatusBadge.tsx         # Connection status with pulse dot
│   │   │   └── Transcript.tsx          # Auto-scrolling live transcript
│   │   └── hooks/
│   │       └── useVoiceChat.ts         # Core hook — WS, audio, state management
│   ├── next.config.ts          # Static export configuration
│   ├── package.json            # Node.js dependencies
│   └── out/                    # Built static files (served by Modal)
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11** via [pyenv](https://github.com/pyenv-win/pyenv-win) (Windows) or [pyenv](https://github.com/pyenv/pyenv) (macOS/Linux)
- **Node.js 20+**
- **[Modal account](https://modal.com)** — free tier includes $30/month in credits

### 1. Clone & setup backend

```bash
git clone https://github.com/Walaa-Volidis/realtime-ai-voice-chatbot.git
cd realtime-ai-voice-chatbot/backend

python -m venv venv
venv\Scripts\Activate.ps1          # Windows
# source venv/bin/activate         # macOS / Linux

pip install -r requirements.txt
python -m modal setup              # Authenticate (opens browser)
```

### 2. Build the frontend

```bash
cd ../frontend
npm install
npm run build
```

### 3. Deploy

```bash
cd ../backend
modal deploy app.py
```

That's it. Modal prints your live URLs:

```
✓ Created web       => https://<you>--testproject-web.modal.run
✓ Created Moshi.web => https://<you>--testproject-moshi-web.modal.run
```

Open the **first URL**, allow mic access, and start talking. 🎤

---

## 💻 Development

**Frontend dev server** (hot reload):

```bash
cd frontend
npm run dev
```

**Backend with live reload** (temporary Modal deployment):

```bash
cd backend
modal serve app.py
```

---

## 💫 The UI

Built with **Tailwind CSS 4** and **Framer Motion** for a premium feel:

- **Ambient glow** — Violet/fuchsia gradients in the background
- **Mic button** — Gradient toggle with expanding ripple rings when recording
- **Audio visualizer** — Animated equalizer bars that pulse with the conversation
- **Status badge** — Live connection indicator with a pulsing dot
- **Transcript panel** — Auto-scrolling with smooth fade-in text
- **Dark theme** — Easy on the eyes, designed for focus
