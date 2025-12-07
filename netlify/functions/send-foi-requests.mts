import type { Config, Context } from "@netlify/functions";

export default async (_req: Request, _context: Context) => {
  const siteUrl = process.env.URL || 'http://localhost:4321';
  
  try {
    const response = await fetch(`${siteUrl}/api/cron/send-foi-requests`, {
      headers: {
        'x-api-key': process.env.CRON_SECRET || '',
      },
    });
    const data = await response.json();
    
    console.log('FOI requests result:', data);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Scheduled function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Run quarterly: 1st of Jan, Apr, Jul, Oct at 9:00 AM UTC
export const config: Config = {
  schedule: "0 9 1 1,4,7,10 *"
};
