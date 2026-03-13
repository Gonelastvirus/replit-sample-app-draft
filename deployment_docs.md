# Deployment Guide

This guide covers deploying the full stack:

- **PostgreSQL database** → [Neon](https://neon.tech) (free, never sleeps)
- **API server** → [Railway](https://railway.app) (no cold starts) or [Render](https://render.com) (free with cold starts)
- **Expo web frontend** → [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com)

---

## Understanding the sleep/data concern

> "When Render sleeps, does the database data vanish?"

**No.** Your data is safe. Here is what actually happens:

| What sleeps | What happens to data |
|---|---|
| Render free API server | Shuts down after 15 min idle. **Next request takes ~30–50 sec to wake up.** |
| PostgreSQL database | **Never sleeps.** It runs on a separate managed host. All data is always there. |

The cold start delay is the only real downside of Render's free tier. If you need your API to respond instantly at all times, use **Railway** instead — it does not sleep within its free $5/month credit (enough for a small app).

---

## Overview of what we are deploying

```
GitHub repo
    │
    ├── Database → Neon (managed PostgreSQL, always on, free)
    │
    ├── API server (artifacts/api-server)
    │       Build: pnpm install && pnpm --filter @workspace/api-server run build
    │       Start: node artifacts/api-server/dist/index.cjs
    │       → Railway or Render
    │
    └── Expo web frontend (artifacts/sl-marketplace)
            Build: cd artifacts/sl-marketplace && npx expo export -p web
            Output folder: artifacts/sl-marketplace/dist
            → Vercel or Cloudflare Pages
```

---

## Step 1 — Push the code to GitHub

Both Railway and Render deploy directly from a GitHub repository.

1. Go to [github.com](https://github.com) and create a new repository
2. From your project root, run:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2 — Set up the database on Neon

Neon gives you a free PostgreSQL database that never sleeps and never loses data.

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click **New Project**, give it a name, choose a region close to you
3. After it is created, go to **Dashboard → Connection Details**
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Keep this string — you will use it as `DATABASE_URL` in both the API server and the migration step below

### Push the schema to Neon

Run this once from your local machine to create all the tables in Neon:

```bash
# Set DATABASE_URL to your Neon connection string temporarily
export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

pnpm --filter @workspace/db run push
```

You should see:
```
[✓] Pulling schema from database...
[✓] Changes applied
```

---

## Step 3 — Deploy the API server

### Option A — Railway (recommended, no cold starts)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository
4. Railway will detect it as a Node.js project. Click **Add variables** and set these:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Any long random string (e.g. `openssl rand -hex 32` in your terminal) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

5. Go to **Settings → Build & Deploy** and set:

| Setting | Value |
|---|---|
| **Build command** | `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| **Start command** | `node artifacts/api-server/dist/index.cjs` |

6. Click **Deploy**. Railway will build and start the server.
7. Go to **Settings → Networking → Generate Domain** to get your public API URL.
   It will look like: `https://your-app.up.railway.app`

---

### Option B — Render (free tier, 50-second cold start after idle)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | `sl-marketplace-api` (or any name) |
| **Region** | Closest to your users |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build command** | `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| **Start command** | `node artifacts/api-server/dist/index.cjs` |
| **Instance type** | Free |

5. Scroll to **Environment Variables** and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Any long random string |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

6. Click **Create Web Service**
7. After it deploys, your API URL will be: `https://sl-marketplace-api.onrender.com`

---

## Step 4 — Update CORS for production

Right now the API allows requests from anywhere. Before deploying, update it to only allow requests from your frontend domain.

This is already applied in the codebase. The API uses open CORS in development and restricts it in production based on `NODE_ENV`. You just need to add the `ALLOWED_ORIGINS` environment variable to your Railway/Render service after you know your Vercel URL (Step 5):

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (add your Vercel URL here) |

---

## Step 5 — Deploy the frontend

### Build the Expo web app

The frontend is built using Expo's web export. First, make sure you have the API URL from Step 3 ready.

### Option A — Vercel (easiest)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** and import your repository
3. Configure the project:

| Setting | Value |
|---|---|
| **Framework Preset** | `Other` |
| **Root Directory** | `artifacts/sl-marketplace` |
| **Build command** | `npx expo export -p web` |
| **Output directory** | `dist` |
| **Install command** | `cd ../.. && pnpm install --frozen-lockfile` |

4. Click **Environment Variables** and add:

| Key | Value |
|---|---|
| `EXPO_PUBLIC_DOMAIN` | Your Railway/Render API URL **without** `https://`<br>e.g. `your-app.up.railway.app` |

5. Click **Deploy**
6. Your frontend will be live at `https://your-app.vercel.app`

> After you have the Vercel URL, go back to Railway/Render and add it to `ALLOWED_ORIGINS` as described in Step 4.

---

### Option B — Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and log in
2. Click **Create a project → Connect to Git** and select your repository
3. Set build settings:

| Setting | Value |
|---|---|
| **Project name** | `sl-marketplace` |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | `cd artifacts/sl-marketplace && npx expo export -p web` |
| **Build output directory** | `artifacts/sl-marketplace/dist` |

4. Click **Environment variables (advanced)** and add:

| Key | Value |
|---|---|
| `EXPO_PUBLIC_DOMAIN` | Your Railway/Render API URL **without** `https://`<br>e.g. `your-app.up.railway.app` |

5. Click **Save and Deploy**
6. Your site will be at `https://sl-marketplace.pages.dev`

---

## Step 6 — Verify the deployment

Once both services are up, test the API directly:

```bash
# Replace with your actual API URL

# Health check
curl https://your-app.up.railway.app/api/health

# Test register
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234"}'

# Test login
curl -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

Then open your Vercel/Cloudflare URL in a browser and try logging in through the app.

---

## Environment variable summary

### API server (Railway or Render)

| Variable | Example value | Required |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Yes |
| `JWT_SECRET` | `a3f9...` (long random string) | Yes |
| `NODE_ENV` | `production` | Yes |
| `PORT` | `3000` | Yes |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Yes (after CORS fix) |

### Frontend (Vercel or Cloudflare Pages)

| Variable | Example value | Required |
|---|---|---|
| `EXPO_PUBLIC_DOMAIN` | `your-app.up.railway.app` | Yes |

---

## Recommended setup at a glance

```
Neon          → Free PostgreSQL, never sleeps, no data loss ever
Railway       → API server, $5/month free credit, no cold starts
Vercel        → Expo web frontend, free forever, free custom domain
```

This combination gives you a fully free stack with no cold starts and no data loss.

---

## Updating after code changes

Every time you push to `main` on GitHub, both Railway/Render and Vercel/Cloudflare Pages will automatically rebuild and redeploy. No manual steps needed after the initial setup.

```bash
git add .
git commit -m "your change description"
git push origin main
# → deploys automatically
```

If you make database schema changes (added a column, new table, etc.), run the push command again against your Neon database:

```bash
export DATABASE_URL="your-neon-connection-string"
pnpm --filter @workspace/db run push
```

