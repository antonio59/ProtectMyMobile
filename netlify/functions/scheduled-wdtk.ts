import type { Config, Context } from "@netlify/functions";

/**
 * Scheduled function to monitor WhatDoTheyKnow for FOI responses.
 * Runs daily at 8am UTC.
 * Calls the /api/cron/monitor-wdtk endpoint with CRON_SECRET authentication.
 */
export default async function handler(
  _request: Request,
  _context: Context
): Promise<Response> {
  const startTime = new Date();
  const functionName = "scheduled-wdtk";

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
    console.log(`[${functionName}] Calling ${siteUrl}/api/cron/monitor-wdtk`);

    const response = await fetch(`${siteUrl}/api/cron/monitor-wdtk`, {
      method: "GET",
      headers: {
        "x-api-key": cronSecret,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    console.log(`[${functionName}] Completed at ${endTime.toISOString()}`);
    console.log(`[${functionName}] Duration: ${durationMs}ms`);
    console.log(`[${functionName}] Result:`, {
      success: data.success,
      feeds_checked: data.feeds_checked,
      total_entries: data.total_entries,
      new_entries: data.new_entries,
      successful_responses: data.successful_responses,
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
// The netlify.toml [functions."scheduled-wdtk"] schedule entry is ignored in v2;
// the schedule must be declared here via export const config.
export const config: Config = {
  schedule: "0 8 * * *",
};