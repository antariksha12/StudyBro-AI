# StudyBro AI

An AI-powered study assistant that turns notes, PDFs, and textbook photos into summaries, flashcards, MCQs, quizzes, and revision notes in seconds.

## Run & Operate

- `pnpm --filter @workspace/studybro run dev` — run the React frontend (port 23624, preview at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the Express API server (port 8080, preview at `/api`)
- `pnpm install` — install all workspace dependencies

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Firebase Auth + react-router-dom v6
- **Backend**: Express 4 + Firebase Admin SDK + Groq SDK (llama-3.3-70b & llama-4-scout vision)
- **Auth**: Firebase Authentication (email/password + Google OAuth)
- **AI**: Groq API — text, PDF, and image inputs supported
- **DB**: Replit PostgreSQL (provisioned, schema via Drizzle ORM in `lib/db/`) + Firebase Firestore for conversation history
- pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/studybro/` — React frontend (pages, components, Firebase client)
- `artifacts/api-server/src/` — Express server (routes, controllers, services)
- `artifacts/api-server/src/services/geminiService.js` — Groq AI service (explain, summarize, MCQ, flashcards, quiz, translate, revision, chat)
- `artifacts/api-server/src/config/firebaseAdmin.js` — Firebase Admin SDK init
- `artifacts/api-server/src/middleware/authMiddleware.js` — Firebase token verification
- `lib/db/src/schema/` — Drizzle ORM schema (PostgreSQL)
- `artifacts/studybro/src/firebase.js` — Firebase client config
- `artifacts/studybro/src/services/api.js` — Axios client (attaches Firebase ID token)

## Architecture decisions

- Auth is handled entirely by Firebase — the backend verifies ID tokens on every protected request via `authMiddleware.js`
- AI uses Groq (not Gemini despite the file name `geminiService.js`) — model is `llama-3.3-70b-versatile` for text, `meta-llama/llama-4-scout-17b-16e-instruct` for vision/images
- Conversation history is stored in Firebase Firestore (not PostgreSQL) — the PostgreSQL database is available for future use via Drizzle ORM
- Frontend uses axios with a request interceptor to attach Firebase ID tokens automatically

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web client |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web client |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web client |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web client |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web client |
| `VITE_FIREBASE_APP_ID` | Firebase web client |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin (backend token verification) |
| `GROQ_API_KEY` | Groq AI API |

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `artifacts/api-server/src/services/geminiService.js` is named for Gemini but actually uses the Groq SDK — don't rename without updating imports
- Firebase Firestore is used for conversation history; the Drizzle/PostgreSQL `lib/db/` schema is currently empty
- The `FIREBASE_SERVICE_ACCOUNT_JSON` must be a single-line JSON string (no newlines)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
