# Backend Architecture – Founder Decision Engine

## 🎯 Goal

AI-powered backend jo:

* user input ko process kare
* commitments extract kare
* risks detect kare

---

## 🧱 Tech Stack

* FastAPI
* PostgreSQL
* SQLAlchemy
* Pydantic

---

## 📁 Folder Structure

```
backend/
│
├── main.py
├── routes/
│     ├── commitments.py
│     ├── ai.py
│
├── services/
│     ├── ai_service.py
│     ├── decision_engine.py
│
├── models/
│     ├── commitment.py
│
├── db/
│     ├── session.py
```

---

## 🗄️ Database Schema

### Table: commitments

| Field      | Type      | Description         |
| ---------- | --------- | ------------------- |
| id         | UUID      | Primary key         |
| content    | TEXT      | original input      |
| task       | TEXT      | extracted task      |
| owner      | TEXT      | paul/sam            |
| deadline   | TIMESTAMP | due date            |
| priority   | TEXT      | low/medium/high     |
| status     | TEXT      | pending/done/missed |
| created_at | TIMESTAMP | created time        |

---

### Table: actions

| Field         | Type | Description   |
| ------------- | ---- | ------------- |
| id            | UUID | Primary key   |
| commitment_id | UUID | relation      |
| action_text   | TEXT | AI suggestion |
| status        | TEXT | pending/done  |

---

## 🔌 APIs

### 1. Add Commitment

POST /commitment/add

Input:

```
{
  "text": "Send MRR to investor tomorrow"
}
```

---

### 2. Get Commitments

GET /commitments

---

### 3. Get Risks

GET /risks

---

## ⚙️ Backend Flow

1. User sends input
2. API receives data
3. AI processes it
4. structured data save hota hai
5. response return hota hai

---

## 🧠 Decision Engine Logic

* overdue → risk
* high priority → alert
* near deadline → warning

---

## 🚀 Key Features

* lightweight APIs
* fast response
* scalable structure

---
