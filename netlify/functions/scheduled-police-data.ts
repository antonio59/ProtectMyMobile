import { cronConfig, cronHandler } from "./lib/cron-handler";

/**
 * Scheduled function to refresh police.uk crime data.
 * Runs daily at 8am UTC.
 * Calls the /api/admin/fetch-police-uk endpoint with CRON_SECRET authentication.
 *
 * Note: The /api/admin/fetch-police-uk endpoint needs to be created.
 * This function will gracefully handle 404 responses until that endpoint exists.
 */
export default cronHandler("scheduled-police-data", {
  path: "/api/admin/fetch-police-uk?mode=recent&months=3",
  notFoundMessage:
    "The police.uk data fetch endpoint needs to be implemented to enable police.uk data fetching",
  summarize: (data) => ({
    success: data.success,
    recordsProcessed: data.recordsProcessed,
    areasUpdated: data.areasUpdated,
    error: data.error,
  }),
});

export const config = cronConfig("0 8 * * *");
