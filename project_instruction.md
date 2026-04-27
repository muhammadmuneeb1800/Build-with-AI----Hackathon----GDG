# PROJECT_REQUIREMENTS.md – Founder Decision Engine (Autopilot AI)

## 🎯 Project Overview

**Product Name:** Founder Decision Engine (Autopilot AI)
**Goal:** Reduce founder operational overhead by capturing commitments, tracking them, and using AI to detect risks and suggest actions automatically.

---

## 🧠 Problem Being Solved

Early-stage founders lose:

* time in context switching
* decisions across tools
* follow-ups and commitments

👉 Result: missed opportunities, delays, misalignment

---

## 💡 Solution Summary

This system acts as an **AI-powered operational brain**:

1. Founder inputs raw text (notes, messages, tasks)
2. AI converts it into structured commitments
3. System tracks deadlines and priorities
4. AI detects risks and suggests actions

---

# 🧩 Core Features

## 🟢 1. Commitment Capture

* User inputs free text
* AI extracts:

  * task
  * deadline
  * priority

---

## 🟢 2. Commitment Tracking

* Store commitments in database
* Track:

  * pending
  * completed
  * missed

---

## 🟢 3. Risk Detection

* Detect overdue tasks
* Detect ignored follow-ups
* Highlight urgent issues

---

## 🟢 4. AI Decision Engine

* Suggest actions
* Prioritize work
* Generate daily brief

---

# 🧱 System Architecture

```id="l4xqhc"
Frontend (Next.js)
        ↓
Backend API (FastAPI)
        ↓
AI Engine (Gemini API)
        ↓
PostgreSQL Database
```

---

# 🎨 Frontend Requirements

## 🧱 Responsibilities

Frontend will:

* collect user input
* display commitments
* show AI insights
* visualize risks

---

## 🖥️ Main UI Sections

### 1. Dashboard

* commitments list
* risk alerts
* AI suggestions

### 2. Input Panel

* textarea input
* submit button

### 3. AI Insights Panel

* “What to do today”
* priority tasks

---

## 🔁 Frontend Flow

```id="g5c96p"
User Input → API Call → Backend → Response → UI Update
```

---

# ⚙️ Backend Requirements

## 🧱 Responsibilities

Backend will:

* handle API requests
* call Gemini AI
* process responses
* store structured data
* run decision logic

---

## 🔌 Core APIs

### POST /commitment/add

* input: raw text
* output: structured commitment

---

### GET /commitments

* return all commitments

---

### GET /risks

* return detected risks

---

### GET /daily-brief

* AI-generated insights

---

## 🔁 Backend Flow

```id="o28zqs"
Request → Validate → AI Call → Process → Save → Response
```

---

# 🗄️ Database Requirements

## Table: commitments

* id
* content
* task
* deadline
* priority
* status
* created_at

---

## Table: actions

* id
* commitment_id
* action_text
* status

---

# 🤖 Gemini AI Integration

## 🎯 Role of Gemini

Gemini is used as the **core intelligence layer**

---

## 🧠 Responsibilities

### 1. Text Understanding

Convert raw text into structured data

---

### 2. Decision Making

Determine:

* urgency
* risk
* action

---

### 3. Insight Generation

Generate:

* daily priorities
* alerts
* recommendations

---

# 🔥 AI Agent Workflow

```id="6m9n8n"
User Input
   ↓
Gemini API (Prompt)
   ↓
Structured JSON Output
   ↓
Backend Processing
   ↓
Database Storage
   ↓
Frontend Display
```

---

# 🧠 AI Prompt Design

## Prompt 1: Extraction

```id="3j8j9d"
Extract the following from text:
- task
- deadline
- priority
Return JSON.
```

---

## Prompt 2: Decision Engine

```id="9q2z8k"
Analyze this commitment:
- is it urgent?
- is there risk?
- what action is needed?
```

---

## Prompt 3: Daily Brief

```id="k2m5zv"
From all commitments:
- list top priorities
- identify risks
- suggest actions
```

---

# ⚡ Decision Logic (Backend + AI Hybrid)

## Rule-based + AI

### Rule-based:

* deadline passed → missed
* high priority → alert

---

### AI-based:

* detect importance
* suggest actions
* analyze context

---

# 🔄 End-to-End Flow

```id="eq6n0g"
1. User adds input
2. Backend sends to Gemini
3. Gemini returns structured data
4. Backend stores in DB
5. Decision engine evaluates
6. Frontend displays results
```

---

# 🚀 Deployment Requirements

* Backend: FastAPI (deploy on Cloud Run / Render)
* Frontend: Next.js (deploy on Vercel)
* Database: PostgreSQL (Supabase / Neon)

---

# 🧪 Demo Requirements

## Scenario:

1. Add commitment:
   “Send MRR to investor tomorrow”

2. AI extracts and stores

3. Dashboard shows:

   * pending task
   * upcoming deadline

4. Simulate delay → show risk

---

# 🏁 Final Goal

> Build a system that does not wait for instructions
> but actively helps founders make decisions

---

# 🔥 Key Principle

**“From input → intelligence → action”**

---
