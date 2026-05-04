import type { APIRoute } from 'astro';
import { createContactSubmission } from '../../../lib/convexMutations';
import { checkRateLimit, getClientIp } from '../../../lib/security';

function jsonResponse(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = getClientIp(request);
    const rateLimited = checkRateLimit(`contact:${ip}`, 5, 300_000); // 5 per 5 min
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { name, email, subject, message } = body;

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
