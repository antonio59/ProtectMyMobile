import { ConvexHttpClient } from "convex/browser";
import { runDiscovery } from "../src/lib/directory-discovery";

const convexUrl = process.env.PUBLIC_CONVEX_URL!;
const adminToken = process.env.CRON_SECRET!;

async function main() {
  const convex = new ConvexHttpClient(convexUrl);
  const report = await runDiscovery(convex, adminToken, (m) => console.log(m));

  console.log('\n=== DISCOVERY REPORT ===');
  console.log(`Building societies: ${report.societiesNew} created, ${report.societiesPending} pending`);
  console.log(`Other banks: ${report.banksPending} pending manual review`);
  console.log(`Providers: ${report.providersNew} created, ${report.providersPending} pending`);
  console.log('\nPending banks (sample):');
  for (const b of report.pendingBanks.slice(0, 20)) {
    console.log(`  - ${b.name}`);
  }
}

main().catch(console.error);
