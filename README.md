# NyayaNet

NyayaNet is an AI-powered welfare resource allocation web app for India that helps verify beneficiaries, predict ration stock needs, and alert district officers to fraud risk. It is built for Google Solution Challenge 2026 with demo-first fallbacks so judges can run it even without Firebase, Gemini, or Maps keys.

**Live demo:** https://your-nyayanet-demo-link.example

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- Firebase Auth + Firestore
- Google Gemini API via `@google/generative-ai`
- Google Maps via `@react-google-maps/api`
- React Router DOM v6
- Recharts
- Web Speech API

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite. The app works in demo mode without filling the `.env` file.

## Environment Variables

| Variable | Purpose | Required for demo |
| --- | --- | --- |
| `VITE_GEMINI_KEY` | Gemini API key for live AI responses | No |
| `VITE_MAPS_KEY` | Google Maps browser key | No |
| `VITE_FIREBASE_API_KEY` | Firebase web API key | No |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | No |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | No |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | No |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | No |

## Features

- Role-based portals for beneficiaries, shop owners, and district officers
- Voice identity verification in Hindi, Odia, Bengali, Tamil, and Telugu
- Gemini-powered name extraction, stock prediction, and district briefing
- Demo authentication and mock data fallback without Firebase setup
- Beneficiary entitlement lookup and collection history
- Firestore-backed transaction and alert writes when configured
- Shop stock dashboard with critical stock warning and resupply modal
- District map dashboard with color-coded shop markers and fraud anomaly workflow

## SDG Alignment

NyayaNet supports **SDG 1: No Poverty** by improving welfare delivery accuracy, **SDG 2: Zero Hunger** by protecting food ration access, and **SDG 10: Reduced Inequalities** by making voice-first verification accessible to more citizens across languages.

## Team

- Team Name: NyayaNet
- Members: Add team members here
- Institution: Add institution here

## License

MIT
