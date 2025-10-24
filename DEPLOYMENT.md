# Deployment Guide

This guide covers deploying MCP Maps 3D to production using Vercel (frontend) and your choice of backend hosting.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment](#backend-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

MCP Maps 3D consists of two separate services:

1. **Frontend** (Vite + Lit + React)
   - Static site deployed to Vercel
   - Handles 3D Google Maps, chat UI, authentication
   - Communicates with backend API

2. **Backend** (Express.js)
   - API server for RLP processing and property search
   - Can be deployed to Render, Railway, Fly.io, or any Node.js hosting
   - Handles PDF processing, database, file storage

## Prerequisites

Before deploying, ensure you have:

- [ ] All required API keys obtained (see [docs/API_KEYS_GUIDE.md](docs/API_KEYS_GUIDE.md))
- [ ] GitHub repository set up
- [ ] Vercel account (free tier works)
- [ ] Backend hosting account (Render, Railway, etc.)
- [ ] Domain name (optional but recommended for production)

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables (see [Environment Variables](#environment-variables) below)
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set root directory to: frontend
# - Confirm build settings
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SUPABASE_URL=your_supabase_url (optional)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
```

**Important**:
- Add these to **Production**, **Preview**, and **Development** environments
- Never commit these values to git
- Use different keys for production vs development if possible

### Step 4: Update API Endpoint

Once backend is deployed, update the API endpoint in your frontend:

```bash
# Edit vercel.json
# Update the backend URL in the routes section
```

## Backend Deployment

### Option 1: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: mcp-maps-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for production)

5. Add environment variables:
   ```
   PORT=3003
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_neon_database_url
   APIFY_API_KEY=your_apify_key (optional)
   ```

6. Click "Create Web Service"
7. Copy the deployed URL (e.g., `https://mcp-maps-backend.onrender.com`)

### Option 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - Add environment variables (same as Render above)

5. Deploy and copy the URL

### Option 3: Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Navigate to backend directory
cd backend

# Create and deploy app
fly launch --name mcp-maps-backend
fly secrets set GEMINI_API_KEY=your_key
fly secrets set DATABASE_URL=your_neon_url
# ... add other secrets

fly deploy
```

## Environment Variables

### Frontend (.env.local in frontend/)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_GEMINI_API_KEY` | Yes | Gemini AI for chat | AIzaSy... |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps 3D | AIzaSy... |
| `VITE_SUPABASE_URL` | No | Authentication | https://xxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | No | Authentication | eyJhbG... |

### Backend (.env in backend/)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `PORT` | Yes | Server port | 3003 |
| `GEMINI_API_KEY` | Yes | PDF processing | AIzaSy... |
| `DATABASE_URL` | Recommended | Neon database | postgresql://... |
| `SUPABASE_URL` | Recommended | File storage | https://xxx.supabase.co |
| `SUPABASE_ANON_KEY` | Recommended | File storage | eyJhbG... |
| `APIFY_API_KEY` | Optional | Property scraping | apify_api_... |

## Post-Deployment

### 1. Update CORS Settings

In your backend code (`backend/src/index.js`), update CORS to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000' // Keep for local development
  ]
}));
```

### 2. Configure Google Maps API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Edit your Maps API key
3. Add application restrictions:
   - **HTTP referrers**: `https://your-app.vercel.app/*`
4. Save changes

### 3. Test Deployed Application

1. Visit your Vercel URL
2. Test chat functionality
3. Upload a sample RLP PDF
4. Search for properties
5. Test authentication (if enabled)

### 4. Monitor and Debug

- **Vercel Logs**: Dashboard → Deployments → View Function Logs
- **Backend Logs**: Check your backend hosting dashboard
- **Browser Console**: F12 → Console for frontend errors

## Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
```bash
# Check build locally first
cd frontend
npm run build

# If successful, verify vercel.json configuration
```

**"API key not found" error:**
- Verify environment variables in Vercel dashboard
- Ensure VITE_ prefix is used
- Check browser console for actual env var values
- Redeploy after adding env vars

**Maps not loading:**
- Check VITE_GOOGLE_MAPS_API_KEY is set correctly
- Verify API key restrictions in Google Cloud Console
- Check browser console for specific errors

### Backend Issues

**API requests failing:**
- Verify backend URL in vercel.json
- Check CORS configuration
- Ensure backend is running and healthy
- Test backend health endpoint: `https://your-backend.com/health`

**Database connection errors:**
- Verify DATABASE_URL is correctly formatted
- Check Neon database is accessible from backend host
- Review backend logs for specific error messages

**File upload errors:**
- Verify Supabase credentials
- Check storage bucket exists and is accessible
- Review backend logs for Supabase errors

### General Tips

1. **Check all environment variables** - Most issues are from missing/incorrect env vars
2. **Use different API keys** for development vs production
3. **Monitor API usage** to avoid unexpected charges
4. **Keep logs** for at least 7 days for debugging
5. **Set up error tracking** (e.g., Sentry) for production

## Security Checklist

Before going live, verify:

- [ ] All .env files are in .gitignore
- [ ] No API keys in source code
- [ ] Google Maps API key has domain restrictions
- [ ] CORS properly configured for your domain only
- [ ] Supabase RLS (Row Level Security) enabled if using auth
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Rate limiting enabled on backend
- [ ] Database backups configured

## Updating Deployment

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys on push
```

### Backend Updates
```bash
# Push changes
git push origin main

# Render/Railway auto-deploy
# Or manually trigger deploy in dashboard
```

## Rolling Back

### Vercel (Frontend)
1. Go to Deployments
2. Find previous working deployment
3. Click three dots → "Promote to Production"

### Backend
- Use your hosting provider's rollback feature
- Or redeploy previous git commit

## Support

For issues:
1. Check [docs/](docs/) folder for detailed guides
2. Review error logs in hosting dashboards
3. Open issue on GitHub repository

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure analytics (optional)
3. Set up monitoring/alerts
4. Plan for scaling if needed
5. Document any custom configurations
