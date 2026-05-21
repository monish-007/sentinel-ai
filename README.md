# SentinelOps AI 🛡️

**Enterprise Decision Intelligence & AI Governance Platform**

SentinelOps AI is a full-stack, enterprise-grade platform designed to act as an operational advisor for enterprise leaders, auditors, and governance teams. It moves beyond generic chatbots by providing highly analytical, structured decision intelligence with strict governance, cost optimization, and persistent memory.

---

## 🎯 The Real-World Problem It Solves

Modern enterprises face several critical challenges when adopting AI for operational decisions:
1. **Cost Inefficiency**: Routing every simple query through expensive, state-of-the-art AI models results in massive, unnecessary inference costs.
2. **Lack of Governance**: Generic AI chatbots do not inherently understand regulatory frameworks (e.g., HIPAA, SOC2, GDPR) and may provide advice that violates compliance policies.
3. **No Organizational Memory**: Traditional LLM interactions are stateless. If an AI solves a complex incident on Tuesday, it has forgotten it by Wednesday, leading to repeated work.
4. **Poor Executive UX**: Business leaders and auditors need structured intelligence (*What is the risk? What is the cost? What are the tradeoffs?*), not verbose chat logs.

---

## 🚀 How SentinelOps AI Works

### 1. CascadeFlow Intelligent Routing Engine
To solve the **cost inefficiency** problem, SentinelOps implements an intelligent model router. 
- A fast, ultra-cheap "Classifier" model first analyzes the user's query complexity.
- Simple queries (e.g., documentation lookups) route to cheaper models (e.g., Llama-3-8b).
- Complex queries (critical infrastructure, compliance) escalate to powerful "Reasoning" models (e.g., GPT-4o / Gemini 1.5 Pro).
- **Impact**: Up to 65% reduction in inference costs.

### 2. Hindsight Semantic Memory System
To solve the **lack of organizational memory**, SentinelOps features a persistent vector-database-backed memory system.
- Critical decisions and facts are extracted and embedded into a vector database (Hindsight).
- Future queries perform a similarity search to inject relevant historical context into the AI's prompt.
- **Impact**: The AI learns from past incidents and organizational history.

### 3. Real-time Governance & Incident Engine
To solve the **lack of governance**, the platform includes an automated compliance monitor.
- Queries and responses are scanned for regulatory risks, data privacy leaks (PII/PHI), and policy violations.
- High-risk interactions trigger "Incidents" in the Governance dashboard for human review.
- **Impact**: Complete auditability and safety guardrails.

### 4. Executive Decision Interface
To solve the **poor executive UX**, the frontend acts as an Enterprise Decision Dashboard.
- Designed in a crisp, high-contrast light mode tailored for professional environments.
- Responses are forced into a strict JSON schema and rendered as beautiful **Decision Cards** detailing Risk Level, Confidence Scores, Tradeoffs, and Governance Concerns.
- Fully centralized chat with collapsible history and metadata sidebars.

---

## 🏗 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│  Dashboard │ Agent │ Governance │ Audit │ Analytics │ Memory│
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                   Express Backend (:3001)                   │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Routing  │  │ LLM Service  │  │ Incident Detection   │   │
│  │ Engine   │  │ (Groq/Gemini)│  │ Service              │   │
│  └──────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────┐                ┌──────────────────────┐   │
│  │ Memory Svc   │                │ Analytics Service    │   │
│  │ (Hindsight)  │                └──────────────────────┘   │
│  └──────────────┘                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        MongoDB Atlas   LLM APIs    Hindsight
```

---

## 🛠 Quick Start

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

```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sentinelops
GROQ_API_KEY=gsk_your_key_here
HINDSIGHT_URL=http://localhost:8888
CASCADEFLOW_API_KEY=
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173  
- **Backend**: http://localhost:3001  
- **Health**: http://localhost:3001/api/health

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite 8, TailwindCSS 3 (Light Mode UI), Recharts, Lucide Icons
- **Backend**: Node.js, Express 5, Mongoose 9
- **AI**: Groq SDK (Llama 3.3 70B + Llama 3.1 8B)
- **Routing**: @cascadeflow/core
- **Memory**: @vectorize-io/hindsight-client
- **Database**: MongoDB Atlas

---

## 📜 License
MIT
