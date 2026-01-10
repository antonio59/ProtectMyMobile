# Import Logging System

The import logging system provides comprehensive tracking and monitoring of all data imports into the ProtectMyMobile database. This system helps track data quality, debug import issues, and monitor data pipeline health.

## Overview

The system consists of three main components:

1. **Database Schema** (`convex/schema.ts`) - The `importLogs` table definition
2. **Convex Functions** (`convex/importLogs.ts`) - Server-side queries and mutations
3. **Client Library** (`src/lib/importLogger.ts`) - Easy-to-use helper functions

## Table Schema

The `importLogs` table tracks each import operation with the following fields:

```typescript
{
  timestamp: number;           // When the import started (ms since epoch)
  source: string;              // Data source identifier
  status: 'started' | 'success' | 'partial' | 'failed';
  recordsProcessed?: number;   // Total records processed
  recordsCreated?: number;     // Successfully created records
  recordsSkipped?: number;     // Skipped/failed records
  errorMessage?: string;       // Error description (for failed imports)
  details?: string;            // Additional context or notes
  duration?: number;           // Import duration in milliseconds
}
```

### Indexes

- `by_timestamp` - Query logs chronologically
- `by_source` - Filter logs by data source
- `by_status` - Filter by import status

### Supported Sources

- `police.uk` - Police.uk crime data API
- `wdtk` - WhatDoTheyKnow FOI requests
- `news` - News article imports
- `manual-csv` - Manual CSV uploads
- `seed` - Database seeding operations
- Custom sources are also supported

## Usage

### Basic Import Logging

```typescript
import { logImportStart, logImportSuccess, logImportFailure } from '@/lib/importLogger';

async function importData() {
  const startTime = Date.now();
  const logId = await logImportStart('police.uk', 'Importing January 2024 data');

  try {
    const records = await fetchData();
    const { created, skipped } = await processRecords(records);

    await logImportSuccess(logId, {
      processed: records.length,
      created,
      skipped,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    await logImportFailure(logId, error as Error, Date.now() - startTime);
    throw error;
  }
}
```

### Automatic Logging with Wrapper

The `withImportLogging` function automatically handles logging:

```typescript
import { withImportLogging } from '@/lib/importLogger';

const result = await withImportLogging('wdtk', async () => {
  const data = await fetchData();
  const { created, skipped } = await processData(data);

  return {
    stats: {
      processed: data.length,
      created,
      skipped,
      duration: 0, // Calculated automatically
    },
    result: { success: true, recordIds: [...] },
  };
});
```

### Partial Imports

When some records succeed but others fail:

```typescript
import { logImportStart, logImportPartial } from '@/lib/importLogger';

const startTime = Date.now();
const logId = await logImportStart('manual-csv');

let created = 0;
let skipped = 0;
const errors: string[] = [];

for (const record of records) {
  try {
    await createRecord(record);
    created++;
  } catch (err) {
    skipped++;
    errors.push(`Row ${record.id}: ${err.message}`);
  }
}

if (errors.length > 0) {
  await logImportPartial(
    logId,
    { processed: records.length, created, skipped, duration: Date.now() - startTime },
    `${errors.length} records failed`,
    `First 5 errors:\n${errors.slice(0, 5).join('\n')}`
  );
}
```

### Viewing Import History

```typescript
import {
  getRecentImports,
  getImportsBySource,
  getImportStats,
  getImportLog,
} from '@/lib/importLogger';

// Get 20 most recent imports
const recent = await getRecentImports(20);

// Get imports for specific source
const policeImports = await getImportsBySource('police.uk', 10);

// Get overall statistics
const stats = await getImportStats();
console.log({
  totalImports: stats.totalImports,
  successRate: stats.successRate,
  averageDuration: stats.averageDuration,
  recordStats: stats.recordStats,
  lastImportBySource: stats.lastImportBySource,
});

// Get specific log entry
const log = await getImportLog(logId);
```

## API Reference

### Client Functions

#### `logImportStart(source, details?, adminToken?)`

Start logging an import operation.

- **Parameters:**
  - `source` (string): Data source identifier
  - `details` (string, optional): Additional context
  - `adminToken` (string, optional): Admin authentication token
- **Returns:** `Promise<Id<"importLogs">>` - Log ID for updating

#### `logImportSuccess(logId, stats, details?, adminToken?)`

Log a successful import.

- **Parameters:**
  - `logId` (Id): Log ID from `logImportStart`
  - `stats` (ImportStats): Import statistics
    - `processed` (number): Total records processed
    - `created` (number): Successfully created
    - `skipped` (number): Skipped records
    - `duration` (number): Duration in milliseconds
  - `details` (string, optional): Additional context
  - `adminToken` (string, optional): Admin token

#### `logImportPartial(logId, stats, errorMessage, details?, adminToken?)`

Log a partially successful import.

- **Parameters:** Same as `logImportSuccess` plus:
  - `errorMessage` (string): Description of what went wrong

#### `logImportFailure(logId, error, duration, details?, adminToken?)`

Log a failed import.

- **Parameters:**
  - `logId` (Id): Log ID from `logImportStart`
  - `error` (string | Error): Error message or object
  - `duration` (number): Duration before failure (ms)
  - `details` (string, optional): Additional context
  - `adminToken` (string, optional): Admin token

#### `withImportLogging(source, importFn, adminToken?)`

Wrapper function that automatically handles logging.

- **Parameters:**
  - `source` (string): Data source identifier
  - `importFn` (function): Async function that returns `{ stats, result }`
  - `adminToken` (string, optional): Admin token
- **Returns:** The result from `importFn`

#### `getRecentImports(limit?)`

Get recent import logs.

- **Parameters:**
  - `limit` (number, optional): Number of logs to fetch (default: 10)
- **Returns:** `Promise<ImportLog[]>`

#### `getImportsBySource(source, limit?)`

Get import logs for a specific source.

- **Parameters:**
  - `source` (string): Data source identifier
  - `limit` (number, optional): Number of logs to fetch (default: 20)
- **Returns:** `Promise<ImportLog[]>`

#### `getImportStats()`

Get aggregate statistics across all imports.

- **Returns:** `Promise<ImportStats>` with:
  - `totalImports` (number): Total number of imports
  - `successRate` (number): Percentage of successful imports
  - `lastImportBySource` (Record<string, number>): Last import timestamp per source
  - `statusBreakdown` (object): Count by status
  - `recordStats` (object): Total processed/created/skipped
  - `averageDuration` (number): Average import duration

#### `getImportLog(logId)`

Get a specific import log by ID.

- **Parameters:**
  - `logId` (Id): Import log ID
- **Returns:** `Promise<ImportLog | null>`

### Convex Functions

These functions are called by the client library but can also be used directly:

#### Mutations

- `importLogs.create` - Create a new log entry
- `importLogs.update` - Update an existing log entry

#### Queries

- `importLogs.list({ limit?, source?, status? })` - List logs with filters
- `importLogs.getRecent({ limit? })` - Get most recent logs
- `importLogs.getStats()` - Get summary statistics
- `importLogs.getBySource({ source, limit? })` - Get logs for a source
- `importLogs.getById({ id })` - Get a specific log

## Best Practices

### 1. Always Log Imports

Every data import operation should be logged for observability:

```typescript
// Good
const logId = await logImportStart('police.uk');
try {
  await performImport();
  await logImportSuccess(logId, stats);
} catch (error) {
  await logImportFailure(logId, error, duration);
}

// Bad
await performImport(); // No logging
```

### 2. Use Descriptive Details

Add context to help debug issues later:

```typescript
await logImportStart(
  'police.uk',
  'Importing theft data for London Borough of Camden, Jan-Mar 2024'
);
```

### 3. Track All Metrics

Always include processed, created, and skipped counts:

```typescript
await logImportSuccess(logId, {
  processed: 1000,
  created: 950,
  skipped: 50, // Don't ignore skipped records
  duration: 5000,
});
```

### 4. Use Partial Status Appropriately

If some records fail but the import continues, use `partial`:

```typescript
if (errors.length > 0 && created > 0) {
  await logImportPartial(logId, stats, 'Some records failed validation');
} else if (created > 0) {
  await logImportSuccess(logId, stats);
} else {
  await logImportFailure(logId, 'All records failed', duration);
}
```

### 5. Include Error Details

For failures, include enough information to debug:

```typescript
await logImportFailure(
  logId,
  error,
  duration,
  `Failed at record ${currentIndex}/${total}, API response: ${response.status}`
);
```

### 6. Monitor Import Health

Regularly check import statistics:

```typescript
const stats = await getImportStats();

if (stats.successRate < 90) {
  console.warn('Import success rate below 90%:', stats.successRate);
}

if (stats.lastImportBySource['police.uk'] < Date.now() - 7 * 24 * 60 * 60 * 1000) {
  console.warn('No police.uk imports in the last 7 days');
}
```

## Example Workflows

### CSV Upload Flow

```typescript
async function handleCsvUpload(file: File, adminToken: string) {
  const logId = await logImportStart('manual-csv', `File: ${file.name}`, adminToken);
  const startTime = Date.now();

  try {
    const rows = await parseCsv(file);
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        await validateAndCreateRecord(row);
        created++;
      } catch (err) {
        skipped++;
        errors.push(`Row ${index + 1}: ${err.message}`);
      }
    }

    const stats = {
      processed: rows.length,
      created,
      skipped,
      duration: Date.now() - startTime,
    };

    if (errors.length > 0) {
      await logImportPartial(
        logId,
        stats,
        `${errors.length} rows failed validation`,
        errors.slice(0, 10).join('\n'),
        adminToken
      );
    } else {
      await logImportSuccess(logId, stats, 'All records imported successfully', adminToken);
    }

    return { success: true, created, skipped };
  } catch (error) {
    await logImportFailure(logId, error as Error, Date.now() - startTime, undefined, adminToken);
    throw error;
  }
}
```

### Scheduled API Import

```typescript
async function scheduledPoliceDataImport() {
  const result = await withImportLogging('police.uk', async () => {
    const lastImport = await getLastImportDate();
    const data = await fetchPoliceApi(lastImport);

    const results = {
      processed: 0,
      created: 0,
      skipped: 0,
    };

    for (const crime of data.crimes) {
      results.processed++;
      const exists = await checkIfExists(crime.id);

      if (exists) {
        results.skipped++;
      } else {
        await createTheftRecord(crime);
        results.created++;
      }
    }

    return {
      stats: { ...results, duration: 0 },
      result: { importDate: new Date().toISOString() },
    };
  });

  return result;
}
```

## Troubleshooting

### Issue: "Convex client not initialized"

**Cause:** Convex URL not configured

**Solution:** Ensure `PUBLIC_CONVEX_URL` is set in your environment:

```bash
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Issue: Admin authentication required

**Cause:** Import logs require admin privileges

**Solution:** Pass admin token to logging functions:

```typescript
const logId = await logImportStart('police.uk', undefined, adminToken);
```

### Issue: Import appears stuck in "started" status

**Cause:** Import crashed before logging completion

**Solution:** Always use try-catch blocks and log failures:

```typescript
try {
  // import logic
  await logImportSuccess(logId, stats);
} catch (error) {
  await logImportFailure(logId, error, duration);
  throw error;
}
```

## Monitoring Dashboard Ideas

Consider building a dashboard that shows:

1. **Recent Imports** - Last 20 imports with status indicators
2. **Success Rate by Source** - Pie chart or bar chart
3. **Import Frequency** - Timeline showing import activity
4. **Average Duration** - Track performance over time
5. **Alerts** - Highlight failed imports or sources that haven't run recently
6. **Record Throughput** - Total records processed over time

Example query for a dashboard:

```typescript
const [recent, stats, policeImports] = await Promise.all([
  getRecentImports(20),
  getImportStats(),
  getImportsBySource('police.uk', 10),
]);
```

## Related Files

- `/convex/schema.ts` - Database schema definition
- `/convex/importLogs.ts` - Server-side Convex functions
- `/src/lib/importLogger.ts` - Client library
- `/src/lib/importLogger.example.ts` - Usage examples
- `/src/lib/convex.ts` - Type definitions
