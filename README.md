# 🎂 Birthday Surprise — Sakshi's Birthday Website

A playful interactive birthday surprise website from Mrinal to Sakshi, built with **Vite + React + TailwindCSS** and deployed on **Vercel**.

---

## Features

- 🎉 Interactive "Yes / No" question with a growing Yes button
- ✨ AI-powered "Need a reason to smile?" button (Gemini)
- 🗺️ AI birthday day planner for Noida (Gemini)
- 🖼️ Birthday reveal screen with photo and personal message
- 📱 Fully mobile-responsive

---

## Project Structure

```
├── api/
│   └── gemini.js        ← Vercel Serverless Function (server-side Gemini proxy)
├── public/
│   └── Mri.jpeg         ← Reveal photo (already present)
├── src/
│   └── App.jsx          ← Main React component
├── .env.local.example   ← Template for local env vars
└── index.html
```

---

## Local Development

> **Use `vercel dev` instead of `npm run dev`** so the `/api/gemini` serverless function works locally.

### One-time setup

```bash
npm install -g vercel    # install Vercel CLI
vercel login             # authenticate
```

### Running locally

```bash
# 1. Copy env template and fill in your key
cp .env.local.example .env.local
# Edit .env.local → set GEMINI_API_KEY=AIzaSy...

# 2. Start dev server (runs both Vite + the /api/* functions)
vercel dev
```

The app will be available at `http://localhost:3000`.

---

## Deploying to Vercel

### 1. Push to GitHub / GitLab / Bitbucket

```bash
git add .
git commit -m "chore: birthday surprise site"
git push
```

### 2. Import project on Vercel

Go to [vercel.com/new](https://vercel.com/new) → Import your repo → framework will be auto-detected as **Vite**.

### 3. Add Environment Variable in Vercel Dashboard

**Settings → Environment Variables → Add New:**

| Name | Value | Environments |
|------|-------|--------------|
| `GEMINI_API_KEY` | `AIzaSy...your-real-key...` | ✅ Production ✅ Preview ✅ Development |

Then click **Save** and **Redeploy**.

---

## Security Notes

- The `GEMINI_API_KEY` is **never** in the client bundle — it only lives in `process.env` inside the `api/gemini.js` serverless function.
- `.env.local` is gitignored. Never commit it.
- Do **not** use `VITE_` prefix on the key — that would expose it in the client bundle.
