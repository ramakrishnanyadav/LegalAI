# ⚖️ Lumina Legal AI (V2)

<div align="center">
  <img src="public/favicon.ico" alt="Lumina Legal Logo" width="120" />
  <br/>
  <h3>Next-Generation Legal Intelligence Platform</h3>
  <p>Seamlessly bridging the gap between complex Indian Law (Bharatiya Nyaya Sanhita) and everyday citizens through accessible, real-time AI.</p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## 🌟 Overview

Lumina Legal AI is a comprehensive, production-grade legal consultation platform designed specifically for the Indian judicial ecosystem. It translates the complexities of the **Bharatiya Nyaya Sanhita (BNS)** into actionable, human-readable insights. It features dedicated portals for clients, administrators, and legally verified advocates, ensuring that cases are not only analyzed but actively progressed.

## ✨ Core Features

### 🧠 Legal AI Inference Engine
- **Intelligent Case Mapping:** Automatically cross-references user narratives against the BNS, IPC, and IT Act.
- **Strict JSON Validation:** Powered by Groq/Gemini, forcing hardware-level adherence to structured legal output.
- **Multilingual Support:** Instantaneous English/Hindi translation toggles for FIR (First Information Report) blueprint generation.

### 🛡️ Secure Data Pipeline
- **Firebase JWT Authentication:** The FastAPI backend endpoints (`/analyze`) strictly verify Firebase ID tokens via Google Admin SDK to prevent unauthorized scraping or quota draining.
- **Cloudinary Asset Vault:** Hardened storage handles document and evidentiary media uploads securely.

### ⚖️ Real-Time Advocate Capabilities 
- **Role-Based Portals:** Advocates maintain verified statuses in Firestore, unlocking dedicated dashboards (`/lawyer/dashboard`).
- **Live Syncing:** `onSnapshot` WebSockets ensure that Administrator and Advocate dashboards update instantaneously the moment a new client requests a consultation.
- **Direct Matching:** Clients can filter advocates by Practice Area, Fee, and Location, booking consultations directly attached to their AI-analyzed cases.

## 🏗️ Architecture Stack

**Frontend (Client)**
* Vite + React 18
* TailwindCSS & Framer Motion (Glassmorphism UI)
* Lucide React (Iconography)
* Firebase Web SDK (Auth, Firestore, Storage)

**Backend (Server)**
* Python 3 + FastAPI
* Google GenAI / Groq API (LLM Inference)
* Firebase Admin SDK (Route JWT Protection)
* Pydantic (Strict Type Validation)

---

## 🚀 Quick Setup & Deployment

### 1. Backend Initialization (FastAPI)
Navigate to the backend directory and supply your environment credentials:
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `/backend` folder:
```env
GEMINI_API_KEY=your_gemini_key
# The backend will default to ApplicationDefault() for Firebase Admin Auth locally.
```
Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Initialization (Vite)
Navigate to the frontend directory:
```bash
npm install
```
Create a `.env.local` file in the root folder bridging to your Firebase and Cloudinary properties:
```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=***
VITE_FIREBASE_AUTH_DOMAIN=***
VITE_FIREBASE_PROJECT_ID=***
VITE_FIREBASE_STORAGE_BUCKET=***
VITE_FIREBASE_MESSAGING_SENDER_ID=***
VITE_FIREBASE_APP_ID=***
VITE_CLOUDINARY_CLOUD_NAME=***
VITE_CLOUDINARY_UPLOAD_PRESET=***
```
Start the development server:
```bash
npm run dev
```

---

## 🔒 Deployment Strategy
- **Frontend:** Push to Vercel configuring the build command as `npm run build` and route fallbacks.
- **Backend:** Deploy to Render/Railway setting the build command to `pip install -r requirements.txt` and start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.

## 🤝 Contribution
Architected for scalability. Feel free to open issues or pull requests to expand the legal data matrix or improve prediction heuristics. All advocates must be manually verified (`verified: true`) in the database instance to access the portal.

---
*Disclaimer: AI predictions outputted by Lumina Legal are for informational and preparatory assistance only and do not replace formal legal counsel.*
