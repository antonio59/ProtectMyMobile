export interface Env {
  SITE_URL: string;
  CRON_SECRET: string;
}

async function callCronEndpoint(siteUrl: string, secret: string, path: string): Promise<void> {
  const url = `${siteUrl}${path}`;
  const res = await fetch(url, { headers: { 'x-api-key': secret } });
  console.log(`[cron] ${path} → ${res.status}`);
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const { SITE_URL, CRON_SECRET } = env;

    const cron = _event.cron;

    if (cron === '0 8 * * *') {
      await callCronEndpoint(SITE_URL, CRON_SECRET, '/api/cron/fetch-news');
      await callCronEndpoint(SITE_URL, CRON_SECRET, '/api/cron/monitor-wdtk');
    }

    if (cron === '0 3 * * 0') {
      await callCronEndpoint(SITE_URL, CRON_SECRET, '/api/admin/fetch-police-uk?mode=recent&months=3');
    }
  },
} satisfies ExportedHandler<Env>;
