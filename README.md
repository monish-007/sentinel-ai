# SentinelOps AI

**Enterprise AI Governance & Incident Intelligence Platform**

SentinelOps AI is a full-stack platform that governs AI model usage with intelligent routing, incident detection, memory-enhanced learning, and comprehensive audit analytics.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                     │
│  Dashboard │ Chat │ Incidents │ Audit │ Analytics │ Memory   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                   Express Backend (:3001)                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Routing   │  │ Groq Service │  │ Incident Detection   │   │
│  │ (cascade  │  │ (groq-sdk)   │  │ Service              │   │
│  │  flow)    │  └──────────────┘  └──────────────────────┘   │
│  └──────────┘  ┌──────────────┐  ┌──────────────────────┐   │
│                │ Memory Svc   │  │ Analytics Service    │   │
│                │ (Hindsight)  │  └──────────────────────┘   │
│                └──────────────┘                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        MongoDB Atlas   Groq API    Hindsight
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free M0 cluster) OR local MongoDB
- Groq API key (free at [console.groq.com](https://console.groq.com))
- (Optional) Hindsight daemon for memory features

### 1. Clone & Setup Environment

```bash
cd sentinelops-ai

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sentinelops
GROQ_API_KEY=gsk_your_key_here
HINDSIGHT_URL=http://localhost:8888
CASCADEFLOW_API_KEY=
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001  
Health: http://localhost:3001/api/health

## Features

| Feature | Description |
|---------|-------------|
| **AI Chat** | Intelligent chat with automatic model routing |
| **Smart Routing** | CascadeFlow-based complexity detection routes to optimal model |
| **Incident Detection** | Automatic detection of hallucinations, refusals, high latency |
| **Memory System** | Hindsight integration for context-aware responses |
| **Audit Dashboard** | Full audit trail of all AI interactions |
| **Cost Analytics** | Token cost tracking and savings estimation |
| **Routing Timeline** | Historical view of all routing decisions |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat` | Submit AI query |
| GET | `/api/interactions` | List interactions (paginated) |
| GET | `/api/interactions/:id` | Get interaction detail |
| GET | `/api/incidents` | List incidents |
| GET | `/api/incidents/stats` | Incident statistics |
| PATCH | `/api/incidents/:id/resolve` | Resolve incident |
| GET | `/api/analytics/overview` | Dashboard overview |
| GET | `/api/analytics/costs` | Cost breakdown |
| GET | `/api/analytics/routing` | Routing timeline |
| GET | `/api/analytics/models` | Model distribution |
| GET | `/api/analytics/latency` | Latency stats |
| GET | `/api/memory/history` | Memory operation history |
| POST | `/api/memory/recall` | Manual memory recall |
| GET | `/api/memory/status` | Hindsight connection status |
| GET | `/api/health` | Server health check |

## Tech Stack

- **Frontend**: React 19, Vite 8, TailwindCSS 3, Recharts, Lucide Icons
- **Backend**: Node.js, Express 5, Mongoose 9
- **AI**: Groq SDK (Llama 3.3 70B + Llama 3.1 8B)
- **Routing**: @cascadeflow/core
- **Memory**: @vectorize-io/hindsight-client
- **Database**: MongoDB Atlas

## Deployment

### Backend (Render / Railway)
1. Set environment variables
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` to backend URL

## License

MIT
