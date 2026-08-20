# 🌟 AstroGPT — AI-Powered Vedic Astrology

> Discover your cosmic blueprint with precision Jyotish calculations and AI-powered interpretations.

[![CI/CD](https://github.com/yourusername/astrogpt/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/astrogpt/actions)
[![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.io)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green)](https://spring.io/projects/spring-boot)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue)](https://ai.google.dev)

## 🏗️ Architecture

```
AstroGPT/
├── backend/          # Spring Boot 3.3 + WebFlux (Java 21)
│   ├── VedicMathService    → Swiss Ephemeris (Lahiri Ayanamsa)
│   ├── LLMPipelineService  → Google Gemini 2.5 Flash via Spring AI
│   ├── GeocodingService    → Open-Meteo (free, timezone-aware)
│   └── FirestoreService    → Firebase Admin SDK
├── frontend/         # Angular 18 (Standalone + Signals)
│   ├── KundaliViewer       → Pure SVG North Indian chart
│   ├── ChatInterface       → SSE streaming with fetch-event-source
│   └── BirthForm           → Geocoding autocomplete
├── qa/               # Selenium 4 + Cucumber 7 BDD
└── .github/          # CI/CD (GitHub Actions → Koyeb + Vercel)
```

## ⚡ Quick Start

### Prerequisites
- Java 21 (Temurin recommended)
- Node.js 20+
- Maven 3.9+
- Angular CLI 18: `npm install -g @angular/cli@18`

### 1. Backend Setup

```bash
cd backend

# Copy env template and fill in your keys
cp .env.example .env

# Run locally
./mvnw spring-boot:run
# OR with Docker:
docker-compose up
```

Backend starts at `http://localhost:8080`

### 2. Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Frontend starts at `http://localhost:4200`

### 3. Environment Variables Required

See [`.env.example`](backend/.env.example):

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ **Required** | Google AI Studio API key |
| `FIREBASE_CREDENTIALS_JSON` | ⚠️ Optional | Firebase service account JSON (for session persistence) |
| `CORS_ALLOWED_ORIGINS` | ✅ Required | Comma-separated allowed origins |

> **Tip**: Without `FIREBASE_CREDENTIALS_JSON`, the app works fully — sessions are just in-memory.

## 🚀 Deployment

### Backend → Koyeb (free, always-on)

1. Push image to Docker Hub / GHCR
2. Create service on [koyeb.com](https://koyeb.com) using `koyeb.yaml`
3. Set environment secrets: `gemini-api-key`, `firebase-credentials-json`

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Update `vercel.json` with your Koyeb backend URL.

### Firebase Setup

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Deploy security rules: `firebase deploy --only firestore:rules`
4. Generate Service Account key → use as `FIREBASE_CREDENTIALS_JSON`

## 🧪 Testing

```bash
# Backend unit tests
cd backend && ./mvnw test

# Frontend unit tests
cd frontend && ng test --watch=false

# E2E Cucumber tests (requires running app)
cd qa && ./mvnw test -Dapp.url=http://localhost:4200

# Run with headless Chrome (CI)
cd qa && ./mvnw test -Dapp.url=http://localhost:4200 -Dheadless=true
```

## 🪐 Vedic Astrology Engine

| Feature | Implementation |
|---------|----------------|
| **Ayanamsa** | Lahiri (Chitra Paksha) — `SE_SIDM_LAHIRI` |
| **Planets** | 9 Grahas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu |
| **House System** | Whole Sign (Vedic standard) |
| **Nakshatras** | All 27 with Pada (1-4) |
| **Dasha System** | Vimshottari (120-year cycle) with Mahadasha + Antardasha |
| **Ephemeris Engine** | Moshier analytical model (no data files needed, ~1 arcsecond accuracy) |

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chart/calculate` | Calculate full natal chart |
| `GET` | `/api/geocoding/search?city=Mumbai` | City geocoding with timezone |
| `POST` | `/api/chat/stream` | SSE streaming AI chat |
| `POST` | `/api/session/save` | Persist chart to Firestore |
| `GET` | `/api/session/{id}` | Load session |
| `GET` | `/actuator/health` | Health check |

## 📜 License

This project uses the Swiss Ephemeris under the AGPL-3.0 license.
For commercial use, obtain a license from [Astrodienst](https://www.astro.com/swisseph/).

---

*Built with ❤️ and cosmic precision*
