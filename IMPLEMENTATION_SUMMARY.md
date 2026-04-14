# News Scraping Robustness Improvements - Summary

## Date

January 2, 2026

## Overview

Complete overhaul of the news scraping system to improve reliability, monitoring, and maintainability.

## Changes Implemented

### 1. ✅ Fixed Google News RSS Blocking Issue

**Problem:** Google News RSS was returning empty responses because requests lacked User-Agent header.

**Solution:**

- Added custom `fetchWithRetry()` function with proper User-Agent header
- Implemented exponential backoff retry logic (1s, 2s, 4s delays)
- Max 3 retries per source before giving up

**Files Modified:**

- `src/pages/api/cron/fetch-news.ts`

### 2. ✅ Added Multiple News Sources (Backup System)

**Problem:** Single point of failure with only Google News RSS.

**Solution:**

- Added 4 news sources with priority-based fetching:
  1. Google News - UK mobile phone theft (7 days)
  2. Google News - Smartphone theft UK (7 days)
  3. BBC News UK (general UK news, filtered)
  4. Guardian UK Crime (crime news, filtered)

**Files Modified:**

- `src/pages/api/cron/fetch-news.ts`

### 3. ✅ Improved Content Filtering

**Problem:** Irrelevant articles (e.g., car theft) were being included.

**Solution:**

- Added `IRRELEVANT_KEYWORDS`: car, vehicle, motorbike, motorcycle, bicycle, bike, van, truck, lorry
- Added `RELEVANT_KEYWORDS`: phone, mobile, smartphone, device, handset, iphone, android, samsung, snatch
- Created `isArticleRelevant()` helper function
- Updated search timeframe from 1 day to 7 days

**Files Modified:**

- `src/pages/api/cron/fetch-news.ts`

### 4. ✅ Comprehensive Monitoring System

**Problem:** No visibility into scraper health or failures.

**Solution:**

- Created `systemLogs` table in Convex schema
- Added `convex/systemLogs.ts` with queries/mutations for logging
- Implemented structured logging with levels: info, warning, error
- All scrapers now log to system logs
- Added health check endpoint at `/api/health`

**New Files:**

- `convex/systemLogs.ts` - Logging functions
- `src/pages/api/health.ts` - Health check endpoint

**Files Modified:**

- `convex/schema.ts` - Added systemLogs table
- `src/pages/api/cron/fetch-news.ts` - Added logging
- `src/pages/api/admin/scrape-wdtk.ts` - Added logging

### 5. ✅ Status Dashboard on News Page

**Problem:** No visibility into scraper status for users/admins.

**Solution:**

- Added "Last updated" timestamp display
- Shows recent errors with count and messages
- Color-coded status indicators:
  - 🟢 Green: Info (success)
  - 🟡 Yellow: Warning
  - 🔴 Red: Error

**Files Modified:**

- `src/pages/news.astro`

### 6. ✅ Rate Limiting & Backoff

**Problem:** Risk of overwhelming sources or getting blocked.

**Solution:**

- 3 second delay between source fetches
- Exponential backoff on failures
- Max 15 articles per run
- Changed from weekly to daily schedule

**Files Modified:**

- `src/pages/api/cron/fetch-news.ts`
- `netlify/functions/fetch-news.mts` - Changed schedule to daily 9 AM UTC

### 7. ✅ Better Error Handling & Alerting

**Problem:** Errors were lost in console logs, no alerting.

**Solution:**

- All errors logged to system logs
- Email notifications include source success/failure info
- Graceful degradation - continues on partial failures
- Enhanced Netlify Functions logging

**Files Modified:**

- `src/pages/api/cron/fetch-news.ts`
- `netlify/functions/fetch-news.mts`

### 8. ✅ Test Scripts for Manual Testing

**Problem:** No easy way to test scrapers manually.

**Solution:**

- Created `scripts/test-news-fetch.ts` - Manually trigger news fetch
- Created `scripts/health-check.ts` - Check system health
- Added npm scripts: `npm run news:fetch`, `npm run health:check`

**New Files:**

- `scripts/test-news-fetch.ts`
- `scripts/health-check.ts`

**Files Modified:**

- `package.json` - Added test scripts

### 9. ✅ Documentation

**Problem:** No documentation for monitoring/maintenance.

**Solution:**

- Created comprehensive `NEWS_SCRAPING.md` documentation
- Includes architecture overview, monitoring guide, maintenance procedures
- Added troubleshooting section
- Documented all environment variables

**New Files:**

- `NEWS_SCRAPING.md`

## Configuration Changes

### Environment Variables

No new environment variables required. Existing ones are used:

- `PUBLIC_CONVEX_URL` - Convex deployment URL
- `CRON_SECRET` - Secret for cron jobs/admin mutations
- `RESEND_API_KEY` - Optional, for email notifications

### Deployment Configuration

**File:** `netlify.toml`

Changes:

- Added `CRON_SECRET` placeholder in production environment
- Scheduled function now runs daily at 9:00 AM UTC

## Monitoring & Maintenance

### Daily Checks

1. Check `/api/health` endpoint
2. Monitor Netlify Functions logs
3. Review email notifications

### Weekly Tasks

1. Review system logs in Convex dashboard
2. Check for stuck or failing sources
3. Update keywords/filters as needed

### Health Check Endpoint

**URL:** `/api/health`

**Returns:**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T12:00:00.000Z",
  "newsScraper": {
    "lastFetch": "2026-01-02T09:00:00.000Z",
    "lastFetchMessage": "News fetch completed successfully",
    "totalPublishedPosts": 42
  },
  "recentErrors": []
}
```

### Manual Testing

```bash
# Test news fetch (local - requires dev server running)
./scripts/test-news-fetch.ts

# Test health check (local - requires dev server running)
./scripts/health-check.ts

# Test against production
SITE_URL=https://protectmymobile.xyz ./scripts/test-news-fetch.ts

# Or manually call API (local)
curl http://localhost:4321/api/cron/fetch-news \
  -H "x-api-key: YOUR_CRON_SECRET"

# Or manually call API (production)
curl https://protectmymobile.xyz/api/cron/fetch-news \
  -H "x-api-key: YOUR_CRON_SECRET"
```

## Key Features

1. **Robustness**
   - Multiple backup sources
   - Retry with exponential backoff
   - Graceful degradation
   - No single point of failure

2. **Observability**
   - Comprehensive logging to Convex
   - Health check endpoint
   - Status dashboard on news page
   - Email notifications with details

3. **Quality Control**
   - Content filtering to remove irrelevant articles
   - Keyword-based relevance scoring
   - Deduplication by GUID and URL

4. **Maintainability**
   - Test scripts for manual testing
   - Comprehensive documentation
   - Clear error messages
   - Structured logging

## Future Improvements (Not Implemented)

The following are suggested but not yet implemented:

- [ ] Slack/Discord webhook notifications
- [ ] Article quality scoring
- [ ] More UK news sources
- [ ] Admin dashboard for viewing logs
- [ ] A/B testing for different search queries
- [ ] Content deduplication by article content (not just URL)

## Testing Checklist

Before deploying to production:

- [ ] Start dev server: `npm run dev`
- [ ] Test news fetch manually: `./scripts/test-news-fetch.ts`
- [ ] Verify health check: `./scripts/health-check.ts`
- [ ] Check news page displays status correctly
- [ ] Verify email notifications work (if RESEND_API_KEY configured)
- [ ] Test all 4 news sources return results
- [ ] Verify irrelevant articles are filtered out
- [ ] Check logs appear in Convex dashboard
- [ ] Deploy Convex schema: `npx convex deploy`
- [ ] Deploy to Netlify

## Deployment Steps

1. Ensure all environment variables are set in Netlify:
   - `PUBLIC_CONVEX_URL`
   - `CRON_SECRET`
   - `RESEND_API_KEY` (optional)

2. Deploy Convex schema and functions:

   ```bash
   npx convex deploy --prod
   ```

3. Build and deploy to Netlify:

   ```bash
   npm run build
   # Deploy via Netlify dashboard or CLI
   ```

4. Verify health check:

   ```bash
   curl https://protectmymobile.xyz/api/health
   ```

5. Monitor first scheduled run at 9 AM UTC

## Success Metrics

The system should now:

- Fetch news from 4 sources daily
- Log all activities to system logs
- Send email notifications on new articles
- Display status on news page
- Fail gracefully if sources are unavailable
- Automatically retry with backoff

## Contact

For issues or questions, refer to:

- `NEWS_SCRAPING.md` - Detailed documentation
- `/api/health` - System status
- Convex dashboard - System logs
- Netlify Functions logs - Runtime logs
