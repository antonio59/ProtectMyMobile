import type { Config } from "@netlify/functions";

export default async (request: Request) => {
  const { next_run } = await request.json();
  console.log("Received event! Next invocation at:", next_run);

  const cronSecret = Netlify.env.get("CRON_SECRET");
  const siteUrl = Netlify.env.get("URL") || Netlify.env.get("DEPLOY_URL") || "http://localhost:4321";

  try {
    const response = await fetch(`${siteUrl}/api/cron/discover-directory`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    console.log("Directory discovery result:", JSON.stringify(result));
    return new Response(JSON.stringify(result), { status: response.status });
  } catch (error) {
    console.error("Error calling discover-directory endpoint:", error);
    return new Response(JSON.stringify({ error: "Failed to run directory discovery" }), { status: 500 });
  }
};

export const config: Config = {
  schedule: "0 3 1 */3 *"
};
