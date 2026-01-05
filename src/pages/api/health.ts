import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export const GET: APIRoute = async () => {
  if (!convex) {
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: "Missing PUBLIC_CONVEX_URL",
      }),
      { status: 500 },
    );
  }

  try {
    const lastFetch = await convex.query(api.systemLogs.getLastNewsFetch);
    const recentErrors = await convex.query(api.systemLogs.getRecentErrors, {
      limit: 5,
    });

    const newsPosts = await convex.query(api.newsPosts.list, {
      publishedOnly: true,
    });

    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        newsScraper: {
          lastFetch: lastFetch
            ? new Date(lastFetch.timestamp).toISOString()
            : null,
          lastFetchMessage: lastFetch?.message,
          totalPublishedPosts: newsPosts?.length || 0,
        },
        recentErrors: recentErrors.map((err) => ({
          level: err.level,
          message: err.message,
          timestamp: new Date(err.timestamp).toISOString(),
        })),
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      { status: 500 },
    );
  }
};
