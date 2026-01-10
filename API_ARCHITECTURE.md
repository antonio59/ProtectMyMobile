# Police.uk API Integration - Architecture Documentation

## 1. Context and Assumptions

### Business Requirements
- Integrate official UK crime data from police.uk API to supplement existing theft statistics
- Fetch "theft-from-the-person" category specifically (mobile phone theft)
- Support historical data import for trend analysis
- Store in existing Convex database alongside other data sources
- Maintain data quality by preventing duplicates

### Technical Assumptions
- police.uk API is free and publicly accessible (no API key required)
- Rate limit: 15 requests/second (we use 10 req/s to be conservative)
- API provides street-level crime data aggregated by month
- Each location requires separate API call
- Data is available from 2010 onwards (older data may be limited)
- Coordinates use standard WGS84 (lat/lng) format

### Constraints
- police.uk API returns data within ~1 mile radius of coordinates
- Data is 1-2 months delayed (e.g., in January 2026, latest data is ~November 2025)
- API may have temporary outages or rate limiting
- Large date ranges (24 locations × 12 months = 288 requests) take ~30 seconds

## 2. Proposed Architecture

### Service Boundary
This integration exists as a **dedicated admin API endpoint** within the existing ProtectMyMobile application:

```
┌─────────────────────────────────────────────────────────────┐
│                    ProtectMyMobile App                       │
│                                                               │
│  ┌──────────────┐      ┌────────────────┐                   │
│  │  Admin UI    │─────▶│  API Endpoint  │                   │
│  │ (data.astro) │      │ fetch-police-uk│                   │
│  └──────────────┘      └───────┬────────┘                   │
│                                 │                             │
│                                 │ Rate Limited                │
│                                 │ 100ms between requests      │
│                                 ▼                             │
│                        ┌────────────────┐                    │
│                        │  External API  │                    │
│                        │  police.uk     │                    │
│                        └───────┬────────┘                    │
│                                │                             │
│                                │ Aggregated                  │
│                                │ Crime Data                  │
│                                ▼                             │
│                        ┌────────────────┐                    │
│                        │  Convex DB     │                    │
│                        │ theftDataPoints│                    │
│                        └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Admin Initiates Request**
   - User clicks "Fetch Police.uk Data" button
   - Prompted for date range (YYYY-MM format)
   - Confirmation dialog shows estimated time

2. **API Orchestration**
   - For each location (24 UK cities)
   - For each month in range
   - Fetch crime data from police.uk API
   - Apply 100ms rate limiting between requests
   - Aggregate results by location/month

3. **Data Processing**
   - Count crimes per location per month
   - Check for existing records (avoid duplicates)
   - Create data points with source: "police.uk API"
   - Batch insert into Convex database

4. **Response & Feedback**
   - Return detailed statistics to admin UI
   - Show success/failure counts
   - Display top locations by crime count
   - List any errors encountered

## 3. API Design

### Endpoint Definition

**URL:** `/api/admin/fetch-police-uk`
**Method:** `GET`
**Authentication:** API Key (x-api-key header or Bearer token)

### Request Parameters

| Parameter | Type | Required | Format | Example | Description |
|-----------|------|----------|--------|---------|-------------|
| startMonth | string | No | YYYY-MM | 2024-01 | Start month (default: 2024-01) |
| endMonth | string | No | YYYY-MM | 2024-12 | End month (default: 2024-12) |

### Example Request

```bash
curl -X GET "https://protectmymobile.xyz/api/admin/fetch-police-uk?startMonth=2024-01&endMonth=2024-06" \
  -H "x-api-key: YOUR_API_KEY"
```

### Example Response (Success)

```json
{
  "success": true,
  "message": "Fetched data from police.uk API for 6 months across 24 locations",
  "dateRange": {
    "start": "2024-01",
    "end": "2024-06",
    "months": 6
  },
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
    "duplicatesSkipped": 4,
    "existingRecords": 0
  },
  "topLocations": [
    { "name": "Westminster", "crimes": 3421 },
    { "name": "Camden", "crimes": 892 },
    { "name": "Manchester City Centre", "crimes": 756 }
  ],
  "monthlyBreakdown": {
    "2024-01": 2345,
    "2024-02": 2456,
    "2024-03": 2678
  },
  "errors": [
    "Glasgow City Centre (2024-03): Rate limit exceeded"
  ]
}
```

### Example Response (Error)

```json
{
  "error": "Invalid date format. Use YYYY-MM format (e.g., 2024-01)"
}
```

### External API Integration

**Police.uk Street-Level Crime API:**

```
GET https://data.police.uk/api/crimes-street/theft-from-the-person
  ?lat={latitude}
  &lng={longitude}
  &date={YYYY-MM}
```

**Response Structure:**
```json
[
  {
    "category": "theft-from-the-person",
    "location_type": "Force",
    "location": {
      "latitude": "51.497520",
      "longitude": "-0.135700",
      "street": {
        "id": 12345,
        "name": "On or near Oxford Street"
      }
    },
    "month": "2024-01",
    "persistent_id": "abc123..."
  }
]
```

## 4. Data and Storage Strategy

### Database Schema

**Table:** `theftDataPoints`

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| _id | Id | PK | Auto-generated |
| date | string | by_date | ISO date (YYYY-MM-DD) |
| locationName | string | by_location | City/borough name |
| latitude | number | - | WGS84 latitude |
| longitude | number | - | WGS84 longitude |
| theftCount | number | - | Number of thefts |
| dataSource | string | by_date_location_source | "police.uk API" |

**Composite Index:** `by_date_location_source` - Used for duplicate detection

### Data Consistency

**Duplicate Prevention:**
- Query existing records for date range before insert
- Check composite key: `date + locationName + dataSource`
- Skip records that already exist
- Report skipped count to admin

**Data Quality:**
- Only create records where `theftCount > 0`
- Store raw crime count (no estimation or adjustment)
- Preserve exact coordinates from UK_LOCATIONS array
- Set date to first day of month for consistency

### Locations Covered

24 UK locations (same as seed data):

**London (10):** Westminster, Camden, Southwark, Hackney, Newham, Lambeth, Tower Hamlets, Islington, Kensington and Chelsea, Haringey

**Other UK Cities (14):** Manchester, Birmingham, Leeds, Glasgow, Liverpool, Bristol, Edinburgh, Sheffield, Cardiff, Newcastle, Nottingham, Belfast, Southampton, Brighton

### Storage Estimates

- 24 locations × 12 months = 288 records/year
- ~1KB per record = ~288KB/year
- 10 years of data = ~2.88MB (negligible)

## 5. Scalability, Resilience, and Security

### Scalability

**Current Scale:**
- 24 locations, 12 months/year = 288 requests/year
- At 100ms/request = ~30 seconds per year of data
- Acceptable for admin-initiated background task

**Horizontal Scaling:**
- Endpoint is stateless (can run on any server)
- Rate limiting is in-memory (per-instance)
- For true scale, implement distributed rate limiter (Redis)

**Future Improvements:**
- Add more UK locations (50+ cities)
- Fetch multiple crime categories
- Background job scheduling (cron)

### Resilience

**Error Handling:**
1. **API Failures:** Catch and log, continue with remaining locations
2. **Rate Limiting:** Detect 429 errors, sleep 1 second, continue
3. **Network Timeouts:** Fail gracefully, report in errors array
4. **Invalid Responses:** Validate response is array, default to empty

**Retry Strategy:**
- No automatic retries (admin can re-run)
- Duplicate detection prevents data corruption on re-runs
- Failed requests logged for manual investigation

**Graceful Degradation:**
- Partial success is still success (some data better than none)
- Admin sees full breakdown of what worked vs failed
- Can re-run for specific months if needed

### Security

**Authentication:**
- Requires `CRON_SECRET` environment variable
- Validated via `requireApiKey()` middleware
- Supports both x-api-key header and Bearer token

**Authorization:**
- Admin-only endpoint (not exposed to public)
- No user data exposed (only aggregated crime stats)
- Rate limiting prevents abuse

**Data Security:**
- No PII stored (only location names and counts)
- Public data source (police.uk is open data)
- HTTPS enforced in production

**Rate Limiting:**
- Client-side: 100ms between requests
- Server-side: Could add per-IP rate limiting
- police.uk API: 15 req/s limit (we use 10)

## 6. Risks, Trade-offs, and Alternatives

### Key Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| police.uk API downtime | Medium | High | Show clear error message, allow retry |
| Rate limiting blocking | Low | Medium | Conservative 100ms delay, exponential backoff on 429 |
| Data delay (2 months lag) | High | Low | Document in UI, users understand official data lags |
| Coordinate accuracy | Medium | Low | Use city center coordinates, police.uk aggregates nearby crimes |

### Trade-offs

**1. Rate Limiting Approach**
- **Chosen:** Simple sleep(100ms) between requests
- **Alternative:** Token bucket algorithm
- **Rationale:** Simple is sufficient for admin-only task, not high-concurrency

**2. Data Storage**
- **Chosen:** Denormalized (duplicate location data per month)
- **Alternative:** Normalized (location table + fact table)
- **Rationale:** Query simplicity, small dataset size, matches existing schema

**3. Error Handling**
- **Chosen:** Fail gracefully, continue processing
- **Alternative:** Fail fast on first error
- **Rationale:** Partial data valuable, admin can see what worked

**4. Duplicate Detection**
- **Chosen:** Query before insert, check composite key
- **Alternative:** Upsert strategy
- **Rationale:** Preserves original data source, prevents accidental overwrites

### Alternative Approaches

**1. Background Job (Not Chosen)**
- **Pros:** Non-blocking, scheduled updates
- **Cons:** More complexity, harder to debug
- **Decision:** Admin-initiated is simpler for MVP

**2. Streaming Response (Not Chosen)**
- **Pros:** Real-time progress feedback
- **Cons:** Complex implementation, Astro limitation
- **Decision:** Alert-based feedback sufficient

**3. Cache police.uk responses (Not Chosen)**
- **Pros:** Faster re-runs, reduced API load
- **Cons:** Stale data, storage overhead
- **Decision:** Raw API calls ensure freshness

## 7. Next Actions

### Immediate (MVP Complete)
- [x] Create `/api/admin/fetch-police-uk.ts` endpoint
- [x] Add button to admin UI (data.astro)
- [x] Implement rate limiting (100ms between requests)
- [x] Add duplicate detection
- [x] Return detailed statistics

### Short-term Enhancements
- [ ] Add progress indicator (WebSocket or polling)
- [ ] Log API requests to database for audit trail
- [ ] Add retry logic for failed requests
- [ ] Create admin dashboard showing data source breakdown

### Medium-term Improvements
- [ ] Scheduled background job (monthly auto-fetch)
- [ ] Email notifications on completion/errors
- [ ] Support filtering by specific locations
- [ ] Add more crime categories (theft from vehicle, burglary)

### Long-term Vision
- [ ] Real-time crime data integration
- [ ] Predictive analytics (ML models)
- [ ] Public API for researchers
- [ ] Mobile app with push notifications

## 8. Testing Plan

### Manual Testing Checklist
- [ ] Test with valid date range (2024-01 to 2024-03)
- [ ] Test with invalid date format (should return 400)
- [ ] Test with reversed dates (end before start)
- [ ] Test with existing data (should skip duplicates)
- [ ] Test without API key (should return 401)
- [ ] Test with single month (edge case)
- [ ] Test with very old dates (2010) - may have sparse data

### Observability

**Logging Points:**
- API request initiated (date range, admin user)
- Each police.uk API call (success/failure)
- Rate limiting triggered
- Duplicate detection (skipped records)
- Database insert operations
- Final statistics summary

**Metrics to Track:**
- Total API requests per run
- Success rate percentage
- Average response time
- Total crimes imported
- Duplicate skip rate

### Monitoring

**Key Metrics:**
- Endpoint response time (<60 seconds for 1 year)
- police.uk API availability
- Error rate (<5%)
- Data freshness (last import date)

## 9. Code Examples

### Using the Endpoint

**Via cURL:**
```bash
curl -X GET \
  "https://protectmymobile.xyz/api/admin/fetch-police-uk?startMonth=2024-01&endMonth=2024-06" \
  -H "x-api-key: your_secret_key_here"
```

**Via Admin UI:**
1. Navigate to `/admin/data`
2. Click "Fetch Police.uk Data"
3. Enter start month: `2024-01`
4. Enter end month: `2024-06`
5. Confirm dialog
6. Wait ~15-30 seconds
7. View detailed statistics

### Querying Imported Data

**Convex Query:**
```typescript
// Get all police.uk data for 2024
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

// Aggregate by location
const byLocation = policeData.reduce((acc, point) => {
  acc[point.locationName] = (acc[point.locationName] || 0) + point.theftCount;
  return acc;
}, {});
```

## 10. API Contract Summary

### Request Contract
```typescript
interface FetchPoliceUKRequest {
  startMonth?: string; // YYYY-MM format
  endMonth?: string;   // YYYY-MM format
}
```

### Response Contract
```typescript
interface FetchPoliceUKResponse {
  success: boolean;
  message: string;
  dateRange: {
    start: string;
    end: string;
    months: number;
  };
  locations: number;
  apiStats: {
    totalRequests: number;
    successful: number;
    failed: number;
    successRate: string;
  };
  crimeData: {
    totalCrimes: number;
    recordsCreated: number;
    duplicatesSkipped: number;
    existingRecords: number;
  };
  topLocations: Array<{
    name: string;
    crimes: number;
  }>;
  monthlyBreakdown: Record<string, number>;
  errors?: string[];
}
```

### Error Response Contract
```typescript
interface ErrorResponse {
  error: string;
  stack?: string; // Only in development
}
```

---

## Appendix: police.uk API Reference

**Official Documentation:** https://data.police.uk/docs/

**Key Endpoints:**
- `GET /crimes-street/theft-from-the-person` - Street-level theft data
- `GET /crime-categories` - List of available categories
- `GET /forces` - List of police forces

**Rate Limits:**
- 15 requests per second per IP
- 429 status code when exceeded
- No API key required

**Data Availability:**
- Historical data from 2010 onwards
- Data is typically 1-2 months delayed
- Coverage varies by location and force
