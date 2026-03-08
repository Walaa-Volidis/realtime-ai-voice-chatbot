# Real-Time AI Voice Chatbot

A full-stack, real-time voice conversation application that lets you have natural spoken conversations with an AI. Built with [Moshi](https://github.com/kyutai-labs/moshi) (Kyutai's speech-to-speech model), deployed serverlessly on [Modal](https://modal.com) with GPU acceleration, and powered by model weights hosted on [Hugging Face](https://huggingface.co/).

Speak into your microphone and receive instant AI voice responses alongside a live text transcript — all streamed in real-time over WebSockets.

---

## Demo

1. Open the deployed URL in your browser
2. Click the mic button to start a conversation
3. Speak naturally — Moshi listens, understands, and responds with its own voice
4. Watch the live transcript appear as the AI speaks

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **[Modal](https://modal.com)** | Serverless GPU cloud platform — deploys and scales the AI model on **NVIDIA A10G GPUs** with zero infrastructure management |
| **[Moshi](https://github.com/kyutai-labs/moshi)** | Kyutai's real-time, full-duplex speech-to-speech language model — handles simultaneous listening and speaking |
| **[Hugging Face Hub](https://huggingface.co/)** | Hosts and serves the pre-trained Moshi model weights (Mimi encoder, Moshi LM, text tokenizer) — downloaded at container startup via `hf_hub_download` |
| **[FastAPI](https://fastapi.tiangolo.com/)** | High-performance async web framework — serves the frontend and handles WebSocket connections for bidirectional audio streaming |
| **[PyTorch](https://pytorch.org/)** | Deep learning framework powering model inference on GPU |
| **[sphn](https://pypi.org/project/sphn/)** | Low-level Opus audio codec — encodes/decodes audio streams between the browser and model |
| **[SentencePiece](https://github.com/google/sentencepiece)** | Tokenizer for converting model output tokens into readable text |
| **[NumPy](https://numpy.org/)** | Audio buffer manipulation and PCM data processing |
| **Python 3.11** | Runtime environment |

### Frontend
| Technology | Purpose |
|---|---|
| **[Next.js 16](https://nextjs.org/)** | React framework configured for **static export** — generates optimized HTML/JS/CSS served by Modal |
| **[React 19](https://react.dev/)** | Component-based UI with hooks for state and lifecycle management |
| **[TypeScript](https://www.typescriptlang.org/)** | Static type checking for reliability and maintainability |
| **[Tailwind CSS 4](https://tailwindcss.com/)** | Utility-first CSS for rapid, responsive styling with a dark theme |
| **[Framer Motion](https://www.framer.com/motion/)** | Declarative animations — mic button ripples, visualizer bars, fade-in transitions |
| **[Opus Recorder](https://github.com/niclasmattsson/opus-recorder)** | Captures browser microphone input and encodes it as Opus audio in a Web Worker |
| **[ogg-opus-decoder](https://github.com/niclasmattsson/ogg-opus-decoder)** | Decodes incoming Opus audio from the AI for real-time playback via Web Audio API |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                        │
│                                                                 │
│  Mic → Opus Recorder → WebSocket ──────────► Modal (Moshi)     │
│                                                                 │
│  Speaker ◄── Web Audio ◄── ogg-opus-decoder ◄── WebSocket      │
│  Transcript ◄── TextDecoder ◄─────────────────── WebSocket     │
└─────────────────────────────────────────────────────────────────┘

WebSocket Protocol:
  Client → Server:  raw Opus-encoded audio bytes
  Server → Client:  [0x01] + Opus audio bytes  (AI voice)
                    [0x02] + UTF-8 text bytes   (transcript)
```

### Data Flow

1. **Audio Capture** — The browser captures microphone input and encodes it as Opus audio using a Web Worker (opus-recorder), sending small frames over WebSocket
2. **Audio Decoding** — The Modal backend receives Opus bytes, decodes them to PCM using `sphn.OpusStreamReader`, and buffers them into frames
3. **Model Inference** — Each audio frame is fed through the **Mimi encoder** (converts audio → tokens), then the **Moshi language model** generates response tokens in real-time
4. **Response Encoding** — Output tokens are decoded back to audio via Mimi, encoded as Opus with `sphn.OpusStreamWriter`, and streamed back alongside text tokens
5. **Playback** — The frontend decodes Opus audio via ogg-opus-decoder and schedules gapless playback through the Web Audio API while rendering the transcript live

### Hugging Face Integration

The Moshi model consists of three components, all downloaded from Hugging Face at container startup:
- **Mimi** — Neural audio codec (encoder/decoder) that converts between audio waveforms and discrete tokens
- **Moshi LM** — The core language model that generates response tokens given input audio tokens
- **Text Tokenizer** — SentencePiece model for converting token IDs to human-readable text

Weights are cached in a **Modal Volume** (`model_cache`) so they persist across container restarts and don't need to be re-downloaded on every cold start.

### Modal Deployment

The app runs as two serverless functions on Modal:

| Function | Resource | Role |
|---|---|---|
| `web` | CPU | Serves the Next.js static export (HTML/JS/CSS) via FastAPI |
| `Moshi.*` | NVIDIA A10G GPU | Runs Moshi model inference with WebSocket streaming |

Both functions scale to zero when idle and spin up on demand — you only pay for actual usage.

---

## Project Structure

```
├── backend/
│   ├── app.py              # Modal function – serves frontend static files via FastAPI
│   ├── common.py           # Shared Modal App instance
│   ├── moshi_service.py    # Modal GPU class – Moshi model loading, WebSocket audio pipeline
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Project metadata
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main voice chat page with all UI components
│   │   │   ├── layout.tsx      # Root layout with fonts and metadata
│   │   │   └── globals.css     # Global styles, dark theme, custom scrollbar
│   │   ├── components/
│   │   │   ├── MicButton.tsx       # Animated mic toggle with ripple effect
│   │   │   ├── AudioVisualizer.tsx # Animated equalizer bars (framer-motion)
│   │   │   ├── StatusBadge.tsx     # Connection status indicator with pulse
│   │   │   └── Transcript.tsx      # Auto-scrolling live transcript panel
│   │   └── hooks/
│   │       └── useVoiceChat.ts     # Core hook – WebSocket, audio capture/playback, state
│   ├── next.config.ts      # Next.js config (static export mode)
│   ├── package.json        # Node.js dependencies
│   └── out/                # Generated static build (served by Modal)
└── README.md
```

---

## Prerequisites

- **Python 3.11** — recommended via [pyenv](https://github.com/pyenv-win/pyenv-win) (Windows) or [pyenv](https://github.com/pyenv/pyenv) (macOS/Linux)
- **Node.js 20+** — for building the Next.js frontend
- **[Modal](https://modal.com) account** — free tier includes $30/month in credits

---

## Setup & Deployment

### 1. Clone the repo

```bash
git clone https://github.com/Walaa-Volidis/realtime-ai-voice-chatbot.git
cd realtime-ai-voice-chatbot
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
venv\Scripts\Activate.ps1      # Windows PowerShell
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt

# Authenticate with Modal (opens browser for login)
python -m modal setup
```

### 3. Build the frontend

```bash
cd ../frontend
npm install
npm run build       # Generates static export in frontend/out/
```

### 4. Deploy to Modal

```bash
cd ../backend
venv\Scripts\Activate.ps1
modal deploy app.py
```

On success, Modal prints the deployment URL:
```
✓ Created web => https://<your-username>--testproject-web.modal.run
✓ Created Moshi.web => https://<your-username>--testproject-moshi-web.modal.run
```

### 5. Use the app

1. Open the **`web`** URL (not the `moshi-web` one) in your browser
2. Allow microphone access when prompted
3. Click the mic button and start talking
4. The AI will respond with voice and live text transcript

---

## Development

To iterate on the frontend locally:

```bash
cd frontend
npm run dev         # Starts Next.js dev server at http://localhost:3000
```

To test the backend with hot-reloading:

```bash
cd backend
modal serve app.py  # Deploys temporarily with live reload
```

---

## Key Design Decisions

- **Static Export** — The Next.js frontend is pre-built as static HTML/JS and served directly by FastAPI on Modal, avoiding the need for a Node.js server in production
- **WebSocket Streaming** — Enables real-time, bidirectional audio with minimal latency compared to REST polling
- **Opus Codec** — Provides high-quality audio compression at low bitrates, ideal for real-time voice over networks
- **Modal Volumes** — Hugging Face model weights are cached persistently so cold starts only download once
- **Separate Functions** — The lightweight frontend server runs on CPU while the model runs on GPU, optimizing cost

---