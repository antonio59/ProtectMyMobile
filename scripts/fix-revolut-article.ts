import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL!;
const adminToken = process.env.CRON_SECRET!;
const convex = new ConvexHttpClient(convexUrl);

const newContent = `The new feature has been released in response to a sharp rise in phone thefts and the emergence of transfer mugging, where criminals force victims to complete transactions on an unlocked device. Phone thefts have surged by 425% in the UK since 2021, prompting Revolut to strengthen defences around customer funds.

Revolut provides a wide suite of digital financial services, including payments, budgeting, foreign exchange and investment tools, all accessed via its mobile app. The company has been rapidly expanding its security infrastructure, aiming to shield users from increasingly sophisticated fraud tactics.

Street Mode introduces a customisable, location-aware layer of protection that activates whenever users are outside their designated 'Trusted Locations'. When enabled, Street Mode applies extra security checks for outgoing transfers above a chosen limit, including additional identification steps and a mandatory one-hour delay. This delay creates a critical intervention window in which fraudulent transfers can be detected and stopped before funds leave the account.

The feature builds on Revolut's existing Wealth Protection tool, which adds biometric identification to defend accounts from theft, pickpockets and phone snatchers. Wealth Protection has already been activated by more than one million customers across Europe, and Street Mode represents a significant evolution of this capability.

Revolut has outlined how customers can activate the new feature: turn on Wealth Protection in the Security section of their profile, set a transfer limit, enable Street Mode and define Trusted Locations, which can be updated at any time. Transfers within Trusted Locations are processed immediately once a phone identity check is completed, while transfers outside these locations will face the enhanced security steps and delay.`;

const newExcerpt = "Revolut has launched Street Mode, a location-aware security feature that adds extra checks and a one-hour delay on transfers outside trusted locations to combat transfer mugging.";

async function main() {
  const posts = await convex.query(api.newsPosts.list, { publishedOnly: false });
  const post = posts.find((p: any) => p.slug === "revolut-unveils-street-mode-to-fight-transfer-muggings");
  if (!post) {
    console.log("Article not found");
    return;
  }
  await convex.mutation(api.newsPosts.update, {
    id: post._id,
    adminToken,
    content: newContent,
    excerpt: newExcerpt,
  });
  console.log("Updated Revolut article.");
}

main().catch(console.error);
