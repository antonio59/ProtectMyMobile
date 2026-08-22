import type { Config, Context } from "@netlify/functions";

export interface CronHandlerOptions {
  /** Cron path under the site origin, e.g. "/api/cron/fetch-news". */
  path: string;
  /** Pick the fields worth logging from the endpoint JSON result. */
  summarize?: (data: Record<string, unknown>) => Record<string, unknown>;
  /** If set, a 404 from the endpoint is reported with this message instead of treated as a generic failure. */
  notFoundMessage?: string;
}

/**
 * Shared boilerplate for Netlify v2 scheduled functions that call one of the
 * site's cron endpoints with CRON_SECRET auth: timing, logging, auth header,
 * JSON envelope and error handling.
 */
export function cronHandler(functionName: string, options: CronHandlerOptions) {
  return async function handler(
    _request: Request,
    _context: Context
  ): Promise<Response> {
    const startTime = new Date();
    const { path, summarize, notFoundMessage } = options;

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const fetchUrl = `${siteUrl}${path}`;
      console.log(`[${functionName}] Calling ${fetchUrl}`);

      const response = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          "x-api-key": cronSecret,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404 && notFoundMessage) {
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();

        console.warn(`[${functionName}] Endpoint ${path} not found (404)`);
        console.log(`[${functionName}] ${notFoundMessage}`);

        return new Response(
          JSON.stringify({
            success: false,
            error: `Endpoint ${path} not found`,
            message: notFoundMessage,
            function: functionName,
            startedAt: startTime.toISOString(),
            completedAt: endTime.toISOString(),
            durationMs,
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      console.log(`[${functionName}] Completed at ${endTime.toISOString()}`);
      console.log(`[${functionName}] Duration: ${durationMs}ms`);
      console.log(`[${functionName}] Result:`, summarize ? summarize(data) : data);

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}

/**
 * Netlify Functions v2 requires the schedule in-code; the netlify.toml
 * [functions."<name>"] schedule entry is ignored in v2.
 */
export function cronConfig(schedule: string): Config {
  return { schedule };
}
