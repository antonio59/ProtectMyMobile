#!/usr/bin/env node
export {};

const API_URL = process.env.SITE_URL || "https://protectmymobile.xyz";

console.log("Checking system health...");
console.log(`API URL: ${API_URL}`);
console.log("Fetching...\n");

try {
  const response = await fetch(`${API_URL}/api/health`);

  console.log("Status:", response.status);
  console.log("Content-Type:", response.headers.get("content-type"));

  const text = await response.text();
  console.log("Raw Response (first 500 chars):", text.substring(0, 500));

  if (!response.ok) {
    console.error("\n❌ Request failed with status", response.status);
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

  if (data.status === "healthy") {
    console.log("\n✅ System is healthy!");

    if (data.newsScraper?.lastFetch) {
      console.log(`\n📰 News Scraper:`);
      console.log(
        `  Last Fetch: ${new Date(data.newsScraper.lastFetch).toLocaleString()}`,
      );
      console.log(
        `  Total Published Posts: ${data.newsScraper.totalPublishedPosts}`,
      );
      if (data.newsScraper.lastFetchMessage) {
        console.log(`  Last Message: ${data.newsScraper.lastFetchMessage}`);
      }
    }

    if (data.recentErrors && data.recentErrors.length > 0) {
      console.log(`\n⚠️ Recent Errors (${data.recentErrors.length}):`);
      data.recentErrors.forEach((err: any, i: number) => {
        console.log(`  ${i + 1}. [${err.level}] ${err.message}`);
        console.log(`     Time: ${new Date(err.timestamp).toLocaleString()}`);
      });
    } else {
      console.log("\n✅ No recent errors");
    }
  } else {
    console.log("\n❌ System is unhealthy!");
    console.log("Error:", data.error);
  }

  process.exit(data.status === "healthy" ? 0 : 1);
} catch (error: any) {
  console.error("\n❌ Error:", error.message);
  if (error.message.includes("Unable to connect")) {
    console.error("\nMake sure the site is accessible at:", API_URL);
    console.error("For local testing, start dev server: npm run dev");
    console.error("For production, set SITE_URL=https://protectmymobile.xyz");
  }
  process.exit(1);
}
