# Testing News Scraping

## Local Testing (Development)

### Step 1: Start Development Server

```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile
bun run dev
```

The dev server will start on `http://localhost:4321`

### Step 2: Test News Fetch (New Terminal)

In a new terminal window:

```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile
./scripts/test-news-fetch.ts
```

### Step 3: Test Health Check

```bash
cd /Users/antoniosmith/Projects/ProtectMyMobile
./scripts/health-check.ts
```

---

## Production Testing (Deployed)

### Test Against Production Site

Set `SITE_URL` environment variable to test against production:

```bash
# Test news fetch
SITE_URL=https://protectmymobile.xyz ./scripts/test-news-fetch.ts

# Test health check
SITE_URL=https://protectmymobile.xyz ./scripts/health-check.ts
```

### Using cURL Directly

```bash
# Test health endpoint
curl https://protectmymobile.xyz/api/health

# Test news fetch (requires your CRON_SECRET)
curl https://protectmymobile.xyz/api/cron/fetch-news \
  -H "x-api-key: YOUR_CRON_SECRET"
```

---

## Environment Variables

### For Local Testing

- `SITE_URL` (optional): Defaults to `http://localhost:4321`
- `CRON_SECRET` (optional): Defaults to `dev-secret-key`

### For Production Testing

- `SITE_URL`: Your production site URL (e.g., `https://protectmymobile.xyz`)
- `CRON_SECRET`: Your actual CRON_SECRET from Netlify

---

## Current Status

The news scraper will work once:

1. ✅ Astro dev server is running (local) OR
2. ✅ Site is deployed to production (production)

3. ✅ Convex is deployed with new schema:

   ```bash
   bunx convex deploy --prod
   ```

4. ✅ Netlify is deployed with updated code

---

## What Was Fixed

### Main Issue

Google News RSS was blocking requests without User-Agent header, returning empty responses.

### Solution Applied

- Added proper User-Agent header with `Mozilla/5.0` string
- Implemented retry logic with exponential backoff
- Added 4 news sources with fallback
- Improved content filtering
- Added comprehensive logging and monitoring

---

## Quick Start (If You Want to Test Now)

```bash
# 1. Deploy Convex schema (in project directory)
bunx convex deploy --prod

# 2. Start dev server (new terminal)
bun run dev

# 3. Test news fetch (another new terminal)
./scripts/test-news-fetch.ts
```

The script should now successfully fetch news from:

1. Google News - UK mobile phone theft (7 days)
2. Google News - Smartphone theft UK (7 days)
3. BBC News UK (filtered)
4. Guardian UK Crime (filtered)
