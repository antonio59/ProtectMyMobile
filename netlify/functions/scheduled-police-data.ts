import type { Config, Context } from "@netlify/functions";

/**
 * Scheduled function to refresh police.uk crime data.
 * Runs weekly on Sundays at 3am UTC.
 * Calls the /api/admin/fetch-police-uk endpoint with CRON_SECRET authentication.
 *
 * Note: The /api/admin/fetch-police-uk endpoint needs to be created.
 * This function will gracefully handle 404 responses until that endpoint exists.
 */
export default async function handler(
  _request: Request,
  _context: Context
): Promise<Response> {
  const startTime = new Date();
  const functionName = "scheduled-police-data";

  console.log(`[${functionName}] Starting at ${startTime.toISOString()}`);

  const siteUrl = process.env.URL || "http://localhost:4321";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(`[${functionName}] Missing CRON_SECRET environment variable`);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing CRON_SECRET environment variable",
        function: functionName,
        timestamp: startTime.toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log(
      `[${functionName}] Calling ${siteUrl}/api/admin/fetch-police-uk`
    );

    const response = await fetch(`${siteUrl}/api/admin/fetch-police-uk`, {
      method: "GET",
      headers: {
        "x-api-key": cronSecret,
        "Content-Type": "application/json",
      },
    });

    // Handle 404 gracefully - endpoint may not exist yet
    if (response.status === 404) {
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      console.warn(
        `[${functionName}] Endpoint /api/admin/fetch-police-uk not found (404)`
      );
      console.log(
        `[${functionName}] The endpoint needs to be created to enable police.uk data fetching`
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Endpoint /api/admin/fetch-police-uk not found",
          message:
            "The police.uk data fetch endpoint needs to be implemented",
          function: functionName,
          startedAt: startTime.toISOString(),
          completedAt: endTime.toISOString(),
          durationMs,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    console.log(`[${functionName}] Completed at ${endTime.toISOString()}`);
    console.log(`[${functionName}] Duration: ${durationMs}ms`);
    console.log(`[${functionName}] Result:`, {
      success: data.success,
      recordsProcessed: data.recordsProcessed,
      areasUpdated: data.areasUpdated,
      error: data.error,
    });

    return new Response(
      JSON.stringify({
        ...data,
        function: functionName,
        startedAt: startTime.toISOString(),
        completedAt: endTime.toISOString(),
        durationMs,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[${functionName}] Error: ${errorMessage}`);
    if (errorStack) {
      console.error(`[${functionName}] Stack:`, errorStack);
    }
    console.log(`[${functionName}] Failed after ${durationMs}ms`);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        function: functionName,
        startedAt: startTime.toISOString(),
        failedAt: endTime.toISOString(),
        durationMs,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Required for Netlify Functions v2 scheduled functions.
// The netlify.toml [functions."scheduled-police-data"] schedule entry is ignored in v2;
// the schedule must be declared here via export const config.
export const config: Config = {
  schedule: "0 8 * * *",
};
