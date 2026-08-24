import { cronHandler, cronConfig } from "./lib/cron-handler";

/**
 * Monthly verification of the bank and mobile provider directories.
 * HEAD-checks every listed website, updates lastVerified/active flags in
 * Convex, refreshes the "Last verified" dates shown on /banks and
 * /mobile-providers, and emails a report of any failures.
 */
export default cronHandler("scheduled-verify-directory", {
  path: "/api/cron/verify-directory",
  summarize: (data) => {
    const report = (data.report ?? {}) as Record<string, unknown>;
    return {
      checked: report.checked,
      active: report.active,
      inactive: report.inactive,
    };
  },
  notFoundMessage:
    "The /api/cron/verify-directory endpoint is not deployed yet.",
});

// Monthly on the 1st at 07:17 UTC (off-peak minute).
export const config = cronConfig("17 7 1 * *");
