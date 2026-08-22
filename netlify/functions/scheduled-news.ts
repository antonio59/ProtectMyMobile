import { cronConfig, cronHandler } from "./lib/cron-handler";

/**
 * Scheduled function to fetch news articles.
 * Runs weekly on Sundays at 8am UTC.
 * Calls the /api/cron/fetch-news endpoint with CRON_SECRET authentication.
 */
export default cronHandler("scheduled-news", {
  path: "/api/cron/fetch-news",
  summarize: (data) => ({
    success: data.success,
    createdPosts: data.createdPosts,
    newArticles: data.newArticles,
    sourcesFetched: data.sourcesFetched,
    error: data.error,
  }),
});

export const config = cronConfig("0 8 * * 0");
