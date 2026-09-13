## 🏛️ Platform Architecture & Unified Feature Suite

`LandGov-Platform` is an AI-powered national digital ecosystem combining geospatial intelligence, legal knowledge graphs, econometric policy simulations, and multi-modal citizen interfaces into a single unified dashboard.

### 🌟 Core Modules:
1. 📊 **National Overview Dashboard (`/`)**: Real-time monitoring of DILRMP cadastral computerization, SVAMITVA village property card coverage, and state-wise performance rankings.
2. 🗺️ **GIS & Cadastral Mapping Studio (`/gis`)**: Sub-meter cadastral parcel (Khasra) viewer, dispute density heatmaps, and climate risk overlays.
3. 🕸️ **Land Knowledge Graph Explorer (`/graph`)**: Interactive Neo4j graph network mapping Land Parcels ↔ Ownership Chains ↔ Legal Litigations ↔ Revenue Courts.
4. 🤖 **AI Policy Synthesizer & Legal RAG (`/ai-rag`)**: Semantic search and instant Q&A across Land Revenue Acts, Gazettes, and Supreme Court title precedents.
5. 🧪 **Policy Reform "What-If" Simulation Sandbox (`/simulation`)**: Mathematical scenario modeling testing how policy levers (drone coverage, fast-track courts, auto-mutation) impact dispute reduction and rural credit collateral.
6. 📁 **Research & Gazette Archive (`/repository`)**: Centralized catalog of academic publications, policy briefs, and state gazettes with one-click PDF downloads.
7. 💡 **National Innovation Portal (`/innovation`)**: Hackathons (SIH 26019), competitive research grants, and pilot project registries.
8. 🎙️ **Citizen Voice & WhatsApp Bhu-Seva Bot (`/citizen`)**: Multilingual voice assistant and interactive WhatsApp conversational bot for checking title records and dispute statuses.
9. 👥 **1-Click Role Switcher Toolbar**: Instant persona switching between *Super Admin, Ministry Official, State Secretary, District Magistrate, Revenue Officer, Researcher,* and *Citizen*.

---

## 🚀 Quick Start Guide

### 1. Start Backend API Server
```bash
cd LandGov-Platform/backend
.venv/bin/uvicorn app.main:app --port 8001 --reload
```
- **API Base:** `http://localhost:8001`
- **Interactive Swagger Docs:** `http://localhost:8001/docs`

### 2. Start Frontend Next.js Application
```bash
cd LandGov-Platform/frontend
npm run dev -- -p 3001
```
- **Web Portal:** `http://localhost:3001` (or `http://localhost:3000`)

---

## 🔐 Demo Credentials List

All demo persona accounts use the universal password: **`123456`** (or can be switched instantly via the topbar role switcher).

| Role | Email |
| :--- | :--- |
| **National Super Admin** | `superadmin@landgov.gov.in` |
| **Ministry of Rural Development** | `mord.secretary@landgov.gov.in` |
| **Delhi State Revenue Secretary** | `state.delhi@landgov.gov.in` |
| **District Magistrate (DM)** | `dm.newdelhi@landgov.gov.in` |
| **Revenue Officer (Tehsildar)** | `revenue.officer@landgov.gov.in` |
| **Lead Academic Researcher** | `researcher@iitd.ac.in` |
| **Citizen / Landholder** | `citizen@bharatmail.in` |
