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
    // Just check if we can connect to Convex and get news posts
    const newsPosts = await convex.query(api.newsPosts.list, {
      publishedOnly: true,
    });

    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        newsScraper: {
          totalPublishedPosts: newsPosts?.length || 0,
        },
      }),
      { status: 200 },
    );
  } catch (error) {
    // Log the full error internally for debugging
    console.error("Health check failed:", error);

    // Return a generic error message to avoid exposing internal details
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: "Service temporarily unavailable",
        timestamp: new Date().toISOString(),
      }),
      { status: 500 },
    );
  }
};
