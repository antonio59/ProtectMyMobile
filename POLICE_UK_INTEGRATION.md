# Police.uk API Integration - Quick Reference

## Overview

New admin endpoint that fetches real theft-from-the-person crime data from the official police.uk API and stores it in the Convex database.

## Files Created/Modified

### New Files
1. `/Users/antoniosmith/Projects/ProtectMyMobile/src/pages/api/admin/fetch-police-uk.ts`
   - Main API endpoint for fetching police.uk data
   - ~260 lines of TypeScript

2. `/Users/antoniosmith/Projects/ProtectMyMobile/API_ARCHITECTURE.md`
   - Comprehensive architecture documentation
   - ~800 lines covering design decisions, trade-offs, API contracts

3. `/Users/antoniosmith/Projects/ProtectMyMobile/POLICE_UK_INTEGRATION.md`
   - This quick reference guide

### Modified Files
1. `/Users/antoniosmith/Projects/ProtectMyMobile/src/pages/admin/data.astro`
   - Added "Fetch Police.uk Data" button (indigo colored)
   - Added `fetchPoliceUK()` JavaScript function with progress feedback
   - Added event listener for button click

## How It Works

### User Flow
1. Admin navigates to `/admin/data`
2. Clicks "Fetch Police.uk Data" button
3. Enters start month (e.g., `2024-01`)
4. Enters end month (e.g., `2024-12`)
5. Confirms action (warned about duration)
6. Button shows "Fetching... Please wait"
7. After completion, sees detailed statistics alert
8. Stats dashboard auto-refreshes

### Technical Flow
```
Admin UI → API Endpoint → police.uk API (24 locations × N months)
                       ↓
                  Aggregate & Dedupe
                       ↓
                  Convex Database (theftDataPoints)
                       ↓
                  Return Statistics
```

## API Endpoint

**URL:** `/api/admin/fetch-police-uk`

**Method:** `GET`

**Authentication:** Required (x-api-key or Bearer token)

**Parameters:**
- `startMonth` (optional): YYYY-MM format (default: 2024-01)
- `endMonth` (optional): YYYY-MM format (default: 2024-12)

**Example:**
```bash
curl -X GET \
  "https://protectmymobile.xyz/api/admin/fetch-police-uk?startMonth=2024-01&endMonth=2024-06" \
  -H "x-api-key: YOUR_SECRET_KEY"
```

**Response:**
```json
{
  "success": true,
  "dateRange": { "start": "2024-01", "end": "2024-06", "months": 6 },
  "locations": 24,
  "apiStats": {
    "totalRequests": 144,
    "successful": 142,
    "failed": 2,
    "successRate": "98.6%"
  },
  "crimeData": {
    "totalCrimes": 15234,
    "recordsCreated": 140,
    "duplicatesSkipped": 4
  },
  "topLocations": [...]
}
```

## Key Features

### 1. Rate Limiting
- 100ms delay between requests (10 req/s)
- police.uk allows 15 req/s, we're conservative
- Detects 429 errors and waits 1 second

### 2. Duplicate Prevention
- Queries existing records before insert
- Checks composite key: `date + locationName + dataSource`
- Reports skipped count in response

### 3. Error Handling
- Continues on partial failures
- Logs errors with location/month context
- Returns up to 10 errors in response

### 4. Data Quality
- Only stores records with crimes > 0
- Uses exact coordinates from location array
- Sets dataSource: "police.uk API"
- Stores date as YYYY-MM-01 for consistency

## Locations Covered

24 UK cities/boroughs:
- **London (10):** Westminster, Camden, Southwark, Hackney, Newham, Lambeth, Tower Hamlets, Islington, Kensington and Chelsea, Haringey
- **Other UK (14):** Manchester, Birmingham, Leeds, Glasgow, Liverpool, Bristol, Edinburgh, Sheffield, Cardiff, Newcastle, Nottingham, Belfast, Southampton, Brighton

## Performance

| Metric | Value |
|--------|-------|
| Requests per year | 288 (24 locations × 12 months) |
| Time per year | ~30 seconds |
| Time per request | ~100ms (rate limiting) |
| Data size per year | ~288KB (1KB × 288 records) |

## Database Schema

**Table:** `theftDataPoints`

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| date | string | "2024-01-01" | First day of month |
| locationName | string | "Westminster" | City/borough name |
| latitude | number | 51.4975 | WGS84 |
| longitude | number | -0.1357 | WGS84 |
| theftCount | number | 342 | Raw count from API |
| dataSource | string | "police.uk API" | Source identifier |

**Indexes:**
- `by_date` - for date range queries
- `by_location` - for location filtering
- `by_date_location_source` - for duplicate detection

## Security

- **Authentication:** CRON_SECRET environment variable required
- **Authorization:** Admin-only endpoint
- **Rate Limiting:** Client-side (100ms between requests)
- **Data:** Public data source (no PII)

## Known Limitations

1. **Data Delay:** police.uk data is 1-2 months behind current date
2. **Coverage:** Data quality varies by location and police force
3. **Historical Data:** Available from 2010, but may be sparse for older dates
4. **Coordinates:** Uses city center, police.uk aggregates ~1 mile radius
5. **Crime Category:** Only "theft-from-the-person" (includes mobile phone theft)

## Troubleshooting

### "Missing CONVEX_URL" Error
- Check `PUBLIC_CONVEX_URL` environment variable is set
- Ensure it's prefixed with `PUBLIC_` for Astro

### "Unauthorized" Error
- Verify `CRON_SECRET` is set in environment
- Check API key is being sent in request headers

### "Rate limit exceeded" Errors
- Wait a few minutes and try again
- Consider reducing date range
- Check police.uk API status

### No Crimes Returned
- Normal for some locations/months (especially older dates)
- Check police.uk website directly to verify data availability
- Some forces have limited historical data

### Duplicate Records
- Endpoint automatically skips duplicates
- Check `duplicatesSkipped` in response
- Safe to re-run for same date range

## Testing Checklist

- [ ] Test with valid date range (2024-01 to 2024-03)
- [ ] Test with single month
- [ ] Test with invalid date format (should return 400)
- [ ] Test with reversed dates (end before start)
- [ ] Test without API key (should return 401)
- [ ] Test with existing data (should skip duplicates)
- [ ] Test button UI feedback (loading state)
- [ ] Verify stats dashboard updates after import

## Future Enhancements

### Short-term
- [ ] Add progress indicator (WebSocket or polling)
- [ ] Email notification on completion
- [ ] Retry failed requests automatically
- [ ] Support selecting specific locations

### Medium-term
- [ ] Scheduled background job (monthly auto-fetch)
- [ ] Support additional crime categories
- [ ] Admin dashboard showing data source breakdown
- [ ] Export functionality (CSV/JSON)

### Long-term
- [ ] Real-time crime alerts
- [ ] Predictive analytics
- [ ] Public API for researchers
- [ ] Mobile app integration

## Code Examples

### Query Police.uk Data

```typescript
// Convex query to get all police.uk data for 2024
const policeData = await ctx.db
  .query("theftDataPoints")
  .withIndex("by_date")
  .filter(q =>
    q.and(
      q.gte(q.field("date"), "2024-01-01"),
      q.lte(q.field("date"), "2024-12-31"),
      q.eq(q.field("dataSource"), "police.uk API")
    )
  )
  .collect();
```

### Aggregate by Location

```typescript
const byLocation = policeData.reduce((acc, point) => {
  acc[point.locationName] = (acc[point.locationName] || 0) + point.theftCount;
  return acc;
}, {} as Record<string, number>);

const sortedLocations = Object.entries(byLocation)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, count }));
```

### Check Data Freshness

```typescript
// Get latest date with police.uk data
const latest = await ctx.db
  .query("theftDataPoints")
  .withIndex("by_date")
  .filter(q => q.eq(q.field("dataSource"), "police.uk API"))
  .order("desc")
  .first();

console.log("Latest police.uk data:", latest?.date);
```

## Support

- **Documentation:** `/API_ARCHITECTURE.md` for full details
- **Police.uk API Docs:** https://data.police.uk/docs/
- **Convex Docs:** https://docs.convex.dev/

## Version History

- **v1.0** (2026-01-10): Initial implementation
  - 24 UK locations
  - theft-from-the-person category
  - Rate limiting (10 req/s)
  - Duplicate detection
  - Admin UI integration
