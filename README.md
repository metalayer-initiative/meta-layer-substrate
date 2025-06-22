# Human-Agent Interaction Prototype

This repository contains a working prototype of a Metaweb-inspired coordination layer that enables human-avatar (agent) interaction with community-aware policies, messaging, and presence tracking.

---

## 🧠 Project Overview

This is a full-stack prototype for interacting with digital avatars (agents) across shared communities with policy-aware actions and Proof-of-Humanity (PoH) verification.

The backend exposes APIs to:

* Log in a user avatar
* Check PoH (simulated)
* Retrieve and select communities
* Send and fetch chat messages
* Log interactions (e.g. to blockchain)
* Evaluate actions against OPA-like community rules

The frontend (WIP) is designed to:

* Trigger Canopi overlays
* Select communities
* Display avatars and chat in context

---

## 🧱 Stack

### Backend

* Node.js (Express)
* In-memory store (no DB yet)
* Simulated blockchain + policy enforcement

### Frontend (coming next)

* React + Tailwind (Canopi UI)

---

## 📂 Folder Structure

```
/server
  routes/          → Express route handlers
  controllers/     → API controllers (auth, poh, chat, etc.)
  services/        → Business logic and mock blockchain
  agents/          → Placeholder for agent logic (ElizaOS)

/client            → React frontend (Canopi overlay shell)
  components/      → UI parts (ChatBox, UserList, etc.)
  pages/           → Entry views
  hooks/           → Data & state logic
  utils/           → Helpers (auth, formatting)

/config            → API keys, network info
/scripts           → Future: agent runners, mock data
```

---

## 📦 API Endpoints

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| POST   | `/auth/login`         | Simulates login session       |
| GET    | `/auth/me`            | Returns session info          |
| POST   | `/poh/check`          | Simulates PoH check           |
| GET    | `/communities`        | Lists communities             |
| POST   | `/communities/select` | Set active community          |
| GET    | `/avatars/active`     | Active avatars in a community |
| POST   | `/chat/message`       | Send message                  |
| GET    | `/chat/history`       | Fetch chat messages           |
| POST   | `/interaction/log`    | Log interaction to chain + DB |
| POST   | `/policy/enforce`     | Evaluate policy via ruleset   |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run server
node app.js

# 3. Test API (use Postman, Curl, or PowerShell)
```

---


## 🤝 Contributing

You're welcome to fork, PR, or build alongside this prototype.
Want to contribute to the Meta-Layer Initiative?

* General input: [Call for Input](https://themetalayer.org/call-for-input)
* AI-aligned work: [AI Call](https://themetalayer.org/ai-call-for-input)
* Project contribution: [Submit Work](https://themetalayer.org/contribute#bridgit)

---
