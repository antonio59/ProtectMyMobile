import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const siteUrl = process.env.URL || 'http://localhost:4321';
  
  try {
    const response = await fetch(`${siteUrl}/api/cron/monitor-wdtk`);
    const data = await response.json();
    
    console.log('WDTK monitor result:', data);
    
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

// Run weekly on Wednesday at 10:00 AM UTC
export const config: Config = {
  schedule: "0 10 * * 3"
};
