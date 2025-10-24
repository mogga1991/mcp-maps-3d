# API Keys & Configuration Guide

Complete reference for all API keys and credentials used in the MCP Maps 3D project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Frontend Configuration](#frontend-configuration)
- [Backend Configuration](#backend-configuration)
- [How to Obtain API Keys](#how-to-obtain-api-keys)
- [Configuration Steps](#configuration-steps)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

This application requires several API keys and credentials to function:

| Service | Purpose | Required? | Location |
|---------|---------|-----------|----------|
| **Gemini AI** | AI chat agent & PDF processing | ✅ Yes | Frontend & Backend |
| **Google Maps** | 3D map rendering | ✅ Yes | Frontend only |
| **Supabase** | RLP document storage | ⚠️ Optional | Backend only |
| **Neon Database** | RLP metadata storage | ⚠️ Optional | Backend only |

**Note:** The app works without Supabase/Neon but will use in-memory storage instead.

---

## Frontend Configuration

Location: **`.env.local`** (project root)

### Required Keys

#### 1. GEMINI_API_KEY
```bash
GEMINI_API_KEY=AIzaSy...your_key_here
```
- **Purpose:** Powers the Scout AI agent for property search and chat
- **Used by:** Main chat interface, property recommendations
- **Model:** Gemini 2.5 Flash

#### 2. GOOGLE_MAPS_API_KEY
```bash
GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
```
- **Purpose:** Enables Google Photorealistic 3D Maps
- **APIs Required:**
  - Maps JavaScript API
  - Geocoding API
  - Directions API
  - Maps 3D API (beta)

### Example `.env.local` File

```bash
# Google Gemini AI (Required)
GEMINI_API_KEY=AIzaSyCIjGXkbOpwdNSyzbnzC-C06VmEbY7H39k

# Google Maps API (Required)
GOOGLE_MAPS_API_KEY=AIzaSyA4-DN2BbbDWnBAwrjCDzgNIGEE0M0mhHU
```

---

## Backend Configuration

Location: **`backend/.env`**

### Server Configuration

#### PORT
```bash
PORT=3003
```
- **Purpose:** Port number for the Express backend server
- **Default:** 3003
- **Note:** Make sure this port is available

### AI Processing

#### GEMINI_API_KEY
```bash
GEMINI_API_KEY=AIzaSy...your_key_here
```
- **Purpose:** Processes uploaded RLP PDF documents
- **Used by:** PDF processor service
- **Model:** Gemini 2.0 Flash (with multimodal support)

### Cloud Storage (Optional)

#### SUPABASE_URL
```bash
SUPABASE_URL=https://xfrauodnzmqplatxpiyi.supabase.co
```
- **Purpose:** Supabase project URL for file storage
- **Used by:** RLP document upload endpoint
- **Optional:** App works without it (files stored locally)

#### SUPABASE_ANON_KEY
```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Purpose:** Anonymous authentication key for Supabase
- **Used by:** Storage bucket access
- **Security:** This is the public "anon" key (safe to use in backend)

### Database (Optional)

#### DATABASE_URL
```bash
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
```
- **Purpose:** Neon PostgreSQL connection string
- **Used by:** Storing RLP metadata and text chunks
- **Format:** `postgresql://[user]:[password]@[host]/[database]?sslmode=require`
- **Optional:** App works without it (in-memory storage fallback)

### Example `backend/.env` File

```bash
# Server Configuration
PORT=3003

# Google Gemini AI (Required for PDF processing)
GEMINI_API_KEY=AIzaSyA4-DN2BbbDWnBAwrjCDzgNIGEE0M0mhHU

# Supabase Storage (Optional - for cloud file storage)
SUPABASE_URL=https://xfrauodnzmqplatxpiyi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcmF1b2Ruem1xcGxhdHhwaXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTAxNzcsImV4cCI6MjA3NjcyNjE3N30.2y3n5p2mwZyTcdog9237lNMr-UR8v5l0VepA7uwkmZY

# Neon Database (Optional - for persistent RLP metadata)
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## How to Obtain API Keys

### 1. Gemini API Key

**Where:** [Google AI Studio](https://aistudio.google.com/app/apikey)

**Steps:**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Paste into both `.env.local` and `backend/.env`

**Note:** The same key can be used in both frontend and backend.

**Pricing:** Free tier includes generous quotas for development.

---

### 2. Google Maps API Key

**Where:** [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)

**Steps:**
1. Go to https://console.cloud.google.com/google/maps-apis/credentials
2. Create a new project (if you don't have one)
3. Click "Create Credentials" → "API Key"
4. **Enable Required APIs:**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - Maps JavaScript API
     - Geocoding API
     - Directions API
     - Places API (optional)
5. **Add API Restrictions** (recommended):
   - Edit your API key
   - Under "API restrictions", select "Restrict key"
   - Choose the APIs you enabled above
6. **Add Website Restrictions** (for production):
   - Under "Application restrictions"
   - Select "HTTP referrers"
   - Add your domain(s)
7. Copy the API key
8. Paste into `.env.local`

**Important:** For development, you can leave restrictions off, but **always restrict in production**.

**Pricing:**
- $200 free credit per month
- Pay-as-you-go after that
- Monitor usage in Cloud Console

---

### 3. Supabase Configuration

**Where:** [Supabase Dashboard](https://supabase.com/dashboard)

**Steps:**
1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Go to "Project Settings" → "API"
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
5. Paste into `backend/.env`

**Setup Storage Bucket:**
```bash
cd backend
node setup-storage.js
```
This creates the `rlp-documents` bucket automatically.

**Pricing:** Free tier includes 500MB storage (plenty for RLP PDFs).

---

### 4. Neon Database Connection

**Where:** [Neon Console](https://console.neon.tech)

**Steps:**
1. Go to https://console.neon.tech
2. Create a new project
3. After creation, go to "Connection Details"
4. Copy the "Connection string" (PostgreSQL format)
5. Paste into `backend/.env` as `DATABASE_URL`

**Format Example:**
```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Initialize Database Schema:**
The schema auto-creates on first run, or manually:
```bash
cd backend
npm run start
# Tables will be created automatically
```

**Pricing:** Free tier includes:
- 0.5GB storage
- 1 compute unit
- 100 hours compute time per month

---

## Configuration Steps

### Initial Setup

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd mcp-maps-3d
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Create environment files**
   ```bash
   # Frontend
   cp .env.example .env.local

   # Backend
   cp backend/.env.example backend/.env
   ```

4. **Fill in API keys**
   - Edit `.env.local` with your Gemini and Maps keys
   - Edit `backend/.env` with all backend keys

5. **Setup Supabase storage** (if using)
   ```bash
   cd backend
   node setup-storage.js
   ```

6. **Verify configuration**
   ```bash
   # Run tests (see Testing section below)
   ```

---

## Testing Your Setup

### Frontend Test

```bash
npm run dev
```

**What to verify:**
- ✅ Vite dev server starts (usually http://localhost:5173)
- ✅ No errors in browser console
- ✅ Map loads and displays correctly
- ✅ Chat interface appears
- ✅ You can type a message (don't need to send yet)

**Common Issues:**
- **Map shows error:** Check `GOOGLE_MAPS_API_KEY` in `.env.local`
- **Blank screen:** Check browser console for errors
- **"API key not configured":** Edit `map_app.ts` or check `.env.local`

---

### Backend Test

```bash
cd backend
npm run dev
```

**What to verify:**
- ✅ Server starts on port 3003
- ✅ See message: `🚀 Server running on http://localhost:3003`
- ✅ No database/Supabase warnings (unless you skipped those)

**Test health endpoint:**
```bash
curl http://localhost:3003/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "MCP Maps Backend API is running"
}
```

---

### End-to-End Test

1. **Start both servers:**
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   cd backend
   npm run dev
   ```

2. **Open app in browser:** http://localhost:5173

3. **Test RLP upload:**
   - Click "Upload your RLP document"
   - Select a PDF file
   - Verify it processes successfully
   - Check backend terminal for processing logs

4. **Test property search:**
   - Type: "Find office space in downtown Chicago"
   - Verify AI responds
   - Check that properties appear on map
   - Click a marker to see details

5. **Test save property:**
   - Click heart icon on a property
   - Go to "Saved Properties" tab
   - Verify property appears with RLP info

---

## Troubleshooting

### "GEMINI_API_KEY is not set"

**Problem:** Environment variable not loaded

**Solutions:**
1. Check file is named exactly `.env.local` (with the dot)
2. Restart the dev server after editing
3. Verify the key starts with `AIzaSy`
4. Make sure no extra spaces around the `=` sign

---

### "Google Maps API Key is not configured"

**Problem:** Maps API key missing or invalid

**Solutions:**
1. Check `GOOGLE_MAPS_API_KEY` in `.env.local`
2. Verify all required APIs are enabled in Google Cloud Console
3. Check for API restrictions that might block localhost
4. Wait 5 minutes after creating key (propagation time)

---

### "Could not load Google Maps"

**Problem:** Network issue or API restrictions

**Solutions:**
1. Check browser console for specific error
2. Verify internet connection
3. Try removing API restrictions temporarily
4. Check Google Cloud Console for quota limits
5. Verify billing is enabled (required for Maps)

---

### Backend "Upload failed" or "Processing error"

**Problem:** Backend can't process PDF or store data

**Solutions:**
1. Check backend terminal for detailed errors
2. Verify `GEMINI_API_KEY` is set in `backend/.env`
3. Check Supabase credentials (if using cloud storage)
4. Try uploading a smaller PDF (< 10MB)
5. Check file format is actually PDF

---

### "Database not configured" warning

**Problem:** `DATABASE_URL` not set

**Solution:** This is **optional**. The app works without Neon database. If you want persistence:
1. Get Neon connection string
2. Add to `backend/.env` as `DATABASE_URL`
3. Restart backend server

---

### Rate Limiting / Quota Exceeded

**Problem:** Too many API calls

**Solutions:**
1. **Gemini:** Check https://aistudio.google.com/app/apikey for quotas
2. **Google Maps:** Check Cloud Console for usage
3. Consider upgrading to paid tier
4. Implement caching in your code

---

### MCP Server Connection Issues

See [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md) for MCP-specific troubleshooting.

---

## Security Reminders

⚠️ **NEVER commit `.env.local` or `backend/.env` to git**

✅ **Only commit `.env.example` files** (without real keys)

🔒 **Rotate keys periodically** (every 3-6 months)

🛡️ **Use API restrictions** in production

📊 **Monitor API usage** in respective dashboards

---

## Quick Reference Links

| Service | Dashboard | Documentation |
|---------|-----------|---------------|
| **Gemini AI** | [AI Studio](https://aistudio.google.com) | [Docs](https://ai.google.dev/docs) |
| **Google Maps** | [Cloud Console](https://console.cloud.google.com/google/maps-apis) | [Docs](https://developers.google.com/maps/documentation) |
| **Supabase** | [Dashboard](https://supabase.com/dashboard) | [Docs](https://supabase.com/docs) |
| **Neon** | [Console](https://console.neon.tech) | [Docs](https://neon.tech/docs) |

---

## Need Help?

- Check [SECURITY.md](./SECURITY.md) for security best practices
- See [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md) for MCP server setup
- Review code comments in `map_app.ts` and `backend/src/`
- Check API provider documentation (links above)

---

**Last Updated:** 2025-10-23
