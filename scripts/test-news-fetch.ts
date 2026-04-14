#!/usr/bin/env node
export {};

// Default to production URL if not specified
const API_URL = process.env.SITE_URL || "https://protectmymobile.xyz";
const CRON_SECRET = process.env.CRON_SECRET || "dev-secret-key";

console.log("Testing news fetch...");
console.log(`API URL: ${API_URL}`);
console.log(
  `Using CRON_SECRET: ${CRON_SECRET === "dev-secret-key" ? "dev-secret-key (default)" : "configured"}`,
);
console.log("Fetching...\n");

try {
  const response = await fetch(`${API_URL}/api/cron/fetch-news`, {
    method: "GET",
    headers: {
      "x-api-key": CRON_SECRET,
      "Content-Type": "application/json",
    },
  });

  console.log("Status:", response.status);
  console.log("Content-Type:", response.headers.get("content-type"));

  const text = await response.text();
  console.log("Raw Response (first 500 chars):", text.substring(0, 500));

  if (!response.ok) {
    console.error("\n❌ Request failed with status", response.status);
    if (response.status === 401) {
      console.error(
        "Invalid CRON_SECRET. Make sure to set CRON_SECRET environment variable.",
      );
    }
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    console.error("\n❌ Failed to parse JSON response");
    console.error("Full response:", text);
    console.error("Parse error:", parseError);
    process.exit(1);
  }

  console.log("Response:", JSON.stringify(data, null, 2));

  if (data.success) {
    console.log("\n✅ Success!");
    console.log(`Total Found: ${data.totalFound}`);
    console.log(`New Articles: ${data.newArticles}`);
    console.log(`Created Posts: ${data.createdPosts}`);
    console.log(`Duration: ${data.duration}ms`);

    if (data.sourcesFetched) {
      console.log(`Sources Fetched: ${data.sourcesFetched.join(", ")}`);
    }

    if (data.sourcesFailed && data.sourcesFailed.length > 0) {
      console.log(`\n⚠️ Failed Sources:`);
      data.sourcesFailed.forEach((f: any) => {
        console.log(`  - ${f.name}: ${f.error}`);
      });
    }

    if (data.posts && data.posts.length > 0) {
      console.log("\nNew Posts:");
      data.posts.forEach((p: string) => {
        console.log(`  - ${p}`);
      });
    }
  } else {
    console.log("\n❌ Failed!");
    console.log("Error:", data.error);
  }

  process.exit(data.success ? 0 : 1);
} catch (error: any) {
  console.error("\n❌ Error:", error.message);
  if (error.message.includes("Unable to connect")) {
    console.error("\nMake sure the site is accessible at:", API_URL);
    console.error("For local testing, start dev server: npm run dev");
    console.error("For production, set SITE_URL=https://protectmymobile.xyz");
  }
  process.exit(1);
}
