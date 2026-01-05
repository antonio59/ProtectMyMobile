import type { Config, Context } from "@netlify/functions";

export default async (_req: Request, _context: Context) => {
  const siteUrl = process.env.URL || "http://localhost:4321";

  try {
    const response = await fetch(`${siteUrl}/api/cron/fetch-news`, {
      headers: {
        "x-api-key": process.env.CRON_SECRET || "",
      },
    });
    const data = await response.json();

    console.log("News fetch result:", {
      success: data.success,
      createdPosts: data.createdPosts,
      duration: data.duration,
      error: data.error,
    });

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Scheduled function error:", error.message, error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const config: Config = {
  schedule: "0 9 * * *",
};
