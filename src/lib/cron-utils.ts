import { ConvexHttpClient } from 'convex/browser';
import { Resend } from 'resend';
import { NOTIFY_FROM } from './mail';

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

export async function sendReportEmail(subject: string, htmlBody: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: ['protectmymobile.xyz.overlabor129@passmail.com'],
      subject,
      html: htmlBody,
    });
  } catch {
    // Silently fail - email reporting is best-effort
  }
}
