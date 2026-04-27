# Frontend Architecture – Founder Decision Engine

## 🎯 Goal

Ek clean, modern dashboard jahan founder:

* apni commitments dekh sake
* AI alerts samajh sake
* risks identify kar sake

---

## 🧱 Tech Stack

* Next.js (App Router)
* Tailwind CSS
* shadcn/ui (components)
* Axios / Fetch API

---

## 🎨 Design Principles

* Dark mode (default)
* Minimal UI (Linear / Vercel style)
* Focus on clarity, not decoration
* “Action-first interface”

---

## 🖥️ Main Layout

### 3-Column Layout

```
-------------------------------------------------
| Sidebar |   Main Content        | AI Panel     |
-------------------------------------------------
```

---

## 📌 Pages & Components

### 1. Dashboard (Main Page)

#### 🟢 Commitments List

* All extracted commitments
* Status: Pending / Done / Missed

#### 🔴 Risk Panel

* Overdue tasks
* Missed commitments

#### ⚡ AI Alerts

* Smart suggestions
* Priority tasks

---

### 2. Add Input Page

Simple input box:

* textarea
* submit button

Example:

> “Send MRR to investor tomorrow”

---

### 3. AI Panel (Right Side)

* “What should I do today?”
* AI-generated insights

---

## 🎨 UI Components

* Card
* Badge (priority)
* Alert box
* Timeline list

---

## 🔁 Data Flow

1. User enters text
2. Frontend → backend API call
3. Backend → AI processing
4. Response → UI update

---

## 🚀 Key UX Features

* Real-time updates
* Highlight urgent items
* Minimal clicks (1–2 actions max)

---

## 🧠 UX Philosophy

> “User ko sochna na pade — system bataye kya karna hai”

---
