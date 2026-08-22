import { cronConfig, cronHandler } from "./lib/cron-handler";

/**
 * Scheduled function to monitor WhatDoTheyKnow for FOI responses.
 * Runs daily at 8am UTC.
 * Calls the /api/cron/monitor-wdtk endpoint with CRON_SECRET authentication.
 */
export default cronHandler("scheduled-wdtk", {
  path: "/api/cron/monitor-wdtk",
  summarize: (data) => ({
    success: data.success,
    feeds_checked: data.feeds_checked,
    total_entries: data.total_entries,
    new_entries: data.new_entries,
    successful_responses: data.successful_responses,
    error: data.error,
  }),
});

export const config = cronConfig("0 8 * * *");
