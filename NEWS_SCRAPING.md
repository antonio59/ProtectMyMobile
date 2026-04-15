# News Scraping & Monitoring System

## Overview

The ProtectMyMobile news scraping system automatically fetches UK mobile theft news from multiple sources and publishes articles to the site.

## Architecture

### News Sources

The scraper fetches from multiple RSS feeds with priority-based fallback:

1. **Google News** (Primary) - UK mobile phone theft (7 days)
2. **Google News** (Secondary) - Smartphone theft UK (7 days)
3. **BBC News UK** (Backup) - General UK news (filtered for relevant content)
4. **The Guardian UK Crime** (Backup) - Crime news (filtered for relevant content)

### Content Filtering

**Relevant Keywords:**

- phone, mobile, smartphone, device, handset, iphone, android, samsung, snatch

**Excluded Keywords:**

- car, vehicle, motorbike, motorcycle, bicycle, bike, van, truck, lorry

**Categories:**

- arrest (arrest, jail, sentence, charge)
- seizure (seize, recover, found)
- law_change (law, legislation, gov, police)
- statistics (stat, data, number, rise, increase)
- prevention_tip (protect, prevent, tip, safe)
- other (fallback)

## Monitoring

### Health Check Endpoint

`GET /api/health` - Returns current system status including:

- Last successful news fetch timestamp
- Last fetch message
- Total published posts
- Recent errors (last 5)

Example response:

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

### System Logs

All scraper activity is logged to Convex `systemLogs` table with:

- Level: `info`, `warning`, `error`
- Source: `news_scraper`, `wdtk_scraper`, `system`
- Message: Human-readable description
- Details: Additional JSON context
- Timestamp: Unix timestamp

### News Page Status

The `/news` page displays:

- Last successful fetch time
- Recent errors count and messages
- Color-coded status indicators:
  - 🟢 Green: Info (success)
  - 🟡 Yellow: Warning
  - 🔴 Red: Error

## Scheduling

### Netlify Scheduled Function

**File:** `netlify/functions/scheduled-news.ts`

**Schedule:** Weekly on Sundays at 8:00 AM UTC (`0 8 * * 0`)

**Behavior:**

1. Calls `/api/cron/fetch-news` with CRON_SECRET
2. Logs results to Netlify Functions logs
3. Returns detailed status

## Error Handling

### Retry Logic

- **Exponential backoff**: 1s, 2s, 4s delays
- **Max retries**: 3 per source
- **Rate limiting**: 3s delay between sources

### Failure Modes

1. **Single source fails**: Continues with backup sources
2. **All sources fail**: Logs errors, returns gracefully
3. **Database errors**: Logged to system logs, email notification on any success
4. **Email send failures**: Logged, does not fail the whole operation

### Alerting

**Email notifications** sent when:

- At least 1 new article is created
- Includes list of new articles
- Shows which sources succeeded/failed
- Sent to: `protectmymobile.xyz.overlabor129@passmail.com`

## Security

### Authentication

- Cron endpoint requires `x-api-key` header with `CRON_SECRET`
- Admin mutations require `adminToken` (same value as `CRON_SECRET`)
- Web-facing health endpoint is public (no auth required)

### Environment Variables

Required in production:

- `PUBLIC_CONVEX_URL`: Convex deployment URL
- `CRON_SECRET`: Secret token for cron jobs (must match Netlify env var)
- `RESEND_API_KEY`: Optional, for email notifications

## Maintenance

### Daily Checks

1. Monitor `/api/health` endpoint
2. Check Netlify Functions logs for errors
3. Review email notifications for new articles

### Weekly Tasks

1. Review system logs in Convex dashboard
2. Check for stuck or failing sources
3. Update keywords/filters as needed

### When Things Go Wrong

**Scraper not running:**

1. Check Netlify scheduled functions logs
2. Verify CRON_SECRET is set in Netlify dashboard
3. Test manually: `curl /api/cron/fetch-news -H "x-api-key: YOUR_SECRET"`

**No articles fetched:**

1. Check health endpoint for last successful fetch
2. Review recent errors in system logs
3. Test RSS feeds manually in browser
4. Check if Google is blocking the User-Agent

**Irrelevant articles:**

1. Update IRRELEVANT_KEYWORDS in fetch-news.ts
2. Update RELEVANT_KEYWORDS if needed
3. Consider adding new sources

## Rate Limits

- 3 second delay between source fetches
- Exponential backoff on failures
- Max 15 articles per run
- Weekly schedule to avoid overwhelming sources and reduce noise

## Future Improvements

- [ ] Add Slack/Discord webhook notifications
- [ ] Implement article quality scoring
- [ ] Add more UK news sources
- [ ] Create admin dashboard for logs
- [ ] Add A/B testing for different queries
- [ ] Implement article deduplication by content (not just URL)
