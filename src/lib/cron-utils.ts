import { ConvexHttpClient } from 'convex/browser';
import { Resend } from 'resend';
import { requireApiKey } from './security';
import type { APIRoute } from 'astro';

export function getConvexClient(): ConvexHttpClient | null {
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
  return convexUrl ? new ConvexHttpClient(convexUrl) : null;
}

export function requireConvex(convex: ConvexHttpClient | null): Response | null {
  if (!convex) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Missing PUBLIC_CONVEX_URL. Cannot perform database operations.',
      }),
      { status: 500 }
    );
  }
  return null;
}

function authenticateCron(request: Request): Response | null {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;
  return null;
}

function createCronHandler(handler: (request: Request) => Promise<Response>): APIRoute {
  return async ({ request }) => {
    const unauthorized = authenticateCron(request);
    if (unauthorized) return unauthorized;
    return handler(request);
  };
}

export async function sendReportEmail(subject: string, htmlBody: string): Promise<void> {
  const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: 'ProtectMyMobile <onboarding@resend.dev>',
      to: ['protectmymobile.xyz.overlabor129@passmail.com'],
      subject,
      html: htmlBody,
    });
  } catch {
    // Silently fail - email reporting is best-effort
  }
}
