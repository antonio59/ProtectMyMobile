# Import Logging System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Import Sources                              │
│  (Police.uk API, WDTK, CSV uploads, News scrapers, Seed data)  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                Client Library (importLogger.ts)                  │
│  • logImportStart()    • logImportSuccess()                     │
│  • logImportFailure()  • logImportPartial()                     │
│  • withImportLogging() • getImportStats()                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│             Convex Functions (importLogs.ts)                     │
│  Mutations:            Queries:                                  │
│  • create              • list                                    │
│  • update              • getRecent                               │
│                        • getStats                                │
│                        • getBySource                             │
│                        • getById                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Convex Database                                │
│                   importLogs Table                               │
│                                                                   │
│  Indexes:                                                        │
│  • by_timestamp (chronological queries)                         │
│  • by_source (filter by data source)                            │
│  • by_status (filter by import status)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Import Operation Flow

```
1. START IMPORT
   ├─> logImportStart('police.uk', 'Importing Jan 2024')
   └─> Returns: logId

2. PROCESS DATA
   ├─> Fetch data from source
   ├─> Validate records
   ├─> Create/update database records
   └─> Track: processed, created, skipped

3. LOG RESULT
   ├─> SUCCESS:  logImportSuccess(logId, stats)
   ├─> PARTIAL:  logImportPartial(logId, stats, error)
   └─> FAILURE:  logImportFailure(logId, error, duration)

4. MONITOR
   ├─> getRecentImports() - View recent activity
   ├─> getImportsBySource() - Source-specific history
   └─> getImportStats() - Aggregate metrics
```

### Example: Successful Import

```typescript
Time: T+0ms      → logImportStart('police.uk')
                   Status: 'started'

Time: T+50ms     → Fetching data...

Time: T+1200ms   → Processing 1000 records...

Time: T+5000ms   → logImportSuccess(logId, {
                     processed: 1000,
                     created: 950,
                     skipped: 50,
                     duration: 5000
                   })
                   Status: 'success'
```

### Example: Failed Import

```typescript
Time: T+0ms      → logImportStart('wdtk')
                   Status: 'started'

Time: T+100ms    → Fetching data...

Time: T+250ms    → Error: API rate limit exceeded

Time: T+251ms    → logImportFailure(logId, error, 251)
                   Status: 'failed'
                   errorMessage: 'API rate limit exceeded'
```

## Component Breakdown

### 1. Database Schema (`convex/schema.ts`)

**Purpose:** Define the table structure for storing import logs

**Key Fields:**
- `timestamp` - When import started
- `source` - Which data source (police.uk, wdtk, etc.)
- `status` - Current state (started/success/partial/failed)
- `recordsProcessed/Created/Skipped` - Import metrics
- `errorMessage` - Failure details
- `duration` - Performance tracking

**Indexes:**
- `by_timestamp` - Query chronologically
- `by_source` - Filter by data source
- `by_status` - Find failed/incomplete imports

### 2. Convex Functions (`convex/importLogs.ts`)

**Purpose:** Server-side API for database operations

**Mutations:**
- `create` - Start a new import log
- `update` - Update log with results

**Queries:**
- `list` - Get logs with filtering
- `getRecent` - Latest N logs
- `getStats` - Aggregate statistics
- `getBySource` - Source-specific logs
- `getById` - Single log lookup

**Security:** All operations require admin authentication via `requireAdmin()`

### 3. Client Library (`src/lib/importLogger.ts`)

**Purpose:** Easy-to-use wrapper for import operations

**Core Functions:**
- `logImportStart` - Initialize import tracking
- `logImportSuccess` - Record successful completion
- `logImportPartial` - Some records failed
- `logImportFailure` - Complete failure

**Helper Functions:**
- `withImportLogging` - Automatic try-catch wrapper
- `getRecentImports` - View recent activity
- `getImportsBySource` - Source-specific history
- `getImportStats` - Aggregate metrics

**Features:**
- Type-safe with TypeScript
- Automatic duration calculation
- Flexible error handling
- Optional admin authentication

## Status Transitions

```
┌─────────┐
│ started │ ◄─── Initial state when import begins
└────┬────┘
     │
     ├──► ┌─────────┐
     │    │ success │ ◄─── All records processed successfully
     │    └─────────┘
     │
     ├──► ┌─────────┐
     │    │ partial │ ◄─── Some records succeeded, some failed
     │    └─────────┘
     │
     └──► ┌────────┐
          │ failed │ ◄─── Import completely failed
          └────────┘
```

### Status Decision Tree

```
Import completed?
├─ NO  → Status remains "started" (indicates crash/timeout)
└─ YES → Were any records created?
         ├─ NO  → Status: "failed"
         └─ YES → Were there any errors?
                  ├─ NO  → Status: "success"
                  └─ YES → Status: "partial"
```

## Import Statistics

The `getStats()` function provides comprehensive metrics:

```typescript
{
  totalImports: 1234,              // Total import operations
  successRate: 95.2,               // Percentage successful

  lastImportBySource: {            // Most recent import per source
    'police.uk': 1704931200000,
    'wdtk': 1704844800000,
    'manual-csv': 1704758400000
  },

  statusBreakdown: {               // Count by status
    started: 2,                    // Possibly stuck/crashed
    success: 1150,
    partial: 25,
    failed: 57
  },

  recordStats: {                   // Aggregate record metrics
    totalProcessed: 1250000,
    totalCreated: 1180000,
    totalSkipped: 70000
  },

  averageDuration: 3500            // Average import time (ms)
}
```

## Usage Patterns

### Pattern 1: Manual Logging (Full Control)

```typescript
const startTime = Date.now();
const logId = await logImportStart(source, details);

try {
  const result = await performImport();
  await logImportSuccess(logId, {
    processed: result.total,
    created: result.created,
    skipped: result.skipped,
    duration: Date.now() - startTime
  });
} catch (error) {
  await logImportFailure(logId, error, Date.now() - startTime);
  throw error;
}
```

**Best for:** Complex imports with custom error handling

### Pattern 2: Automatic Wrapper

```typescript
const result = await withImportLogging(source, async () => {
  const data = await fetchAndProcess();
  return {
    stats: {
      processed: data.length,
      created: data.created,
      skipped: data.skipped,
      duration: 0  // Calculated automatically
    },
    result: data
  };
});
```

**Best for:** Simple imports, reduces boilerplate

### Pattern 3: Partial Success Handling

```typescript
const logId = await logImportStart(source);
let created = 0, skipped = 0;
const errors = [];

for (const record of records) {
  try {
    await createRecord(record);
    created++;
  } catch (err) {
    skipped++;
    errors.push(err.message);
  }
}

if (errors.length > 0) {
  await logImportPartial(logId, stats, 'Validation failures',
    `Failed records:\n${errors.slice(0, 5).join('\n')}`);
}
```

**Best for:** Batch operations where some failures are acceptable

## Monitoring & Alerting

### Key Metrics to Monitor

1. **Success Rate by Source**
   - Alert if < 90% for any source
   - Track trends over time

2. **Import Frequency**
   - Alert if no import for expected source in X days
   - Example: Police.uk should import monthly

3. **Average Duration**
   - Alert if duration > 2x normal
   - Indicates performance degradation

4. **Stuck Imports**
   - Find logs with status='started' older than 1 hour
   - Likely crashed or timed out

5. **Error Patterns**
   - Group by errorMessage
   - Identify recurring issues

### Example Monitoring Queries

```typescript
// Find stuck imports
const stuck = await ctx.db
  .query("importLogs")
  .withIndex("by_status", q => q.eq("status", "started"))
  .filter(q => q.lt(q.field("timestamp"), Date.now() - 3600000))
  .collect();

// Check source health
const stats = await getImportStats();
for (const [source, lastTime] of Object.entries(stats.lastImportBySource)) {
  if (lastTime < Date.now() - 7 * 24 * 60 * 60 * 1000) {
    console.warn(`No ${source} imports in 7 days`);
  }
}

// Success rate alert
if (stats.successRate < 90) {
  console.error(`Low success rate: ${stats.successRate}%`);
}
```

## Error Handling Strategy

### 1. Network/API Errors
- Status: `failed`
- Log error message and response code
- Include retry suggestion in details

### 2. Validation Errors
- Status: `partial` (if some succeed) or `failed` (if all fail)
- Log failed record count and sample errors
- Include validation rules in details

### 3. Database Errors
- Status: `failed`
- Log error type and constraint violations
- Consider transaction rollback

### 4. Timeout Errors
- Status: `failed`
- Log timeout duration and records processed
- Include suggestion to batch or optimize

## Performance Considerations

1. **Batch Updates:** Update import log once at end, not per record
2. **Async Operations:** Use Promise.all() for parallel imports
3. **Index Usage:** Query by timestamp or source for fast lookups
4. **Limit Results:** Use pagination for large log collections
5. **Archive Old Logs:** Consider archiving logs older than 1 year

## Security

- All mutations require admin authentication via `requireAdmin()`
- Queries are public (read-only)
- Admin token passed through but not stored
- IP addresses should be hashed if logged
- PII should never be in error messages

## Future Enhancements

1. **Dashboard UI:** Visual monitoring interface
2. **Webhooks:** Alert on import failures
3. **Retry Logic:** Automatic retry for failed imports
4. **Scheduling:** Track expected import times
5. **Data Quality:** Add validation rule tracking
6. **Performance Profiling:** Break down duration by operation
7. **Cost Tracking:** Monitor API usage and costs per source
