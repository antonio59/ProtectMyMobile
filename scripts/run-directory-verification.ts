import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL!;
const adminToken = process.env.CRON_SECRET!;
const convex = new ConvexHttpClient(convexUrl);

async function checkUrl(url: string, name: string, type: 'bank' | 'provider', id: any) {
  let isActive = false;
  let issueDetail = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const headResponse = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
    });
    clearTimeout(timeoutId);

    if (headResponse.ok || headResponse.status === 405) {
      isActive = true;
    } else if (headResponse.status === 403) {
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 5000);
      const getResponse = await fetch(url, {
        method: 'GET',
        signal: getController.signal,
        headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
      });
      clearTimeout(getTimeoutId);
      if (getResponse.ok) {
        isActive = true;
      } else {
        issueDetail = `returned ${headResponse.status} (HEAD) and ${getResponse.status} (GET)`;
      }
    } else {
      issueDetail = `returned ${headResponse.status}`;
    }
  } catch (err: any) {
    try {
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 5000);
      const getResponse = await fetch(url, {
        method: 'GET',
        signal: getController.signal,
        headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
      });
      clearTimeout(getTimeoutId);
      if (getResponse.ok) {
        isActive = true;
      } else {
        issueDetail = `failed: ${err.message} (HEAD), then returned ${getResponse.status} (GET)`;
      }
    } catch (getErr: any) {
      issueDetail = `failed: ${err.message}`;
    }
  }

  if (isActive) {
    if (type === 'bank') {
      await convex.mutation(api.banks.update, { adminToken, id, lastVerified: Date.now(), active: true });
    } else {
      await convex.mutation(api.mobileProviders.update, { adminToken, id, lastVerified: Date.now(), active: true });
    }
    return { active: true };
  } else {
    if (type === 'bank') {
      await convex.mutation(api.banks.update, { adminToken, id, active: false });
    } else {
      await convex.mutation(api.mobileProviders.update, { adminToken, id, active: false });
    }
    return { active: false, detail: issueDetail };
  }
}

async function main() {
  const banks = await convex.query(api.banks.list, { activeOnly: false });
  const providers = await convex.query(api.mobileProviders.list, { activeOnly: false });

  let active = 0;
  let inactive = 0;
  const details: string[] = [];

  for (const b of banks) {
    const result = await checkUrl(b.website, b.name, 'bank', b._id);
    if (result.active) active++;
    else { inactive++; details.push(`❌ ${b.name} (${b.website}) ${result.detail}`); }
  }

  for (const p of providers) {
    const result = await checkUrl(p.website, p.name, 'provider', p._id);
    if (result.active) active++;
    else { inactive++; details.push(`❌ ${p.name} (${p.website}) ${result.detail}`); }
  }

  await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'banks' });
  await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'mobileProviders' });

  console.log(JSON.stringify({ checked: banks.length + providers.length, active, inactive, details }, null, 2));
}

main().catch(console.error);
