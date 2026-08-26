import type { APIRoute } from 'astro';
import { createContactSubmission } from '../../../lib/convexMutations';
import { checkRateLimit, getClientIp } from '../../../lib/security';

function jsonResponse(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Minimum plausible time between the form rendering and a human submitting it.
const MIN_FILL_MS = 3_000;

// Bots get the same shape a real success returns, so they learn nothing from
// being rejected.
const SILENT_SUCCESS = { success: true, message: 'Message sent successfully.' };

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = getClientIp(request);
    const rateLimited = checkRateLimit(`contact:${ip}`, 5, 300_000); // 5 per 5 min
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { name, email, subject, message, website, renderedAt } = body;

    // Honeypot: the field is off-screen and never shown to a real user.
    if (typeof website === 'string' && website.trim() !== '') {
      return jsonResponse(SILENT_SUCCESS, 200);
    }

    // Timing check: a genuine person cannot fill this in under a few seconds.
    // A missing or unparseable stamp is not treated as spam, so people with
    // unusual browsers are not blocked.
    const stamp = Number(renderedAt);
    if (Number.isFinite(stamp) && stamp > 0 && Date.now() - stamp < MIN_FILL_MS) {
      return jsonResponse(SILENT_SUCCESS, 200);
    }

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return jsonResponse({ success: false, error: 'All fields are required.' }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ success: false, error: 'Please enter a valid email address.' }, 400);
    }

    if (message.length > 5000) {
      return jsonResponse({ success: false, error: 'Message is too long. Please keep it under 5,000 characters.' }, 400);
    }

    await createContactSubmission({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return jsonResponse({ success: true, message: 'Message sent successfully.' }, 200);
  } catch (error) {
    console.error('Error in contact submit:', error);
    return jsonResponse({ success: false, error: 'Something went wrong. Please try again later.' }, 500);
  }
};
