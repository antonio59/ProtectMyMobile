import type { APIRoute } from 'astro';
import { submitCommunityResponse, hashIP } from '../../../lib/convexMutations';
import { checkRateLimit, getClientIp } from '../../../lib/security';

function jsonResponse(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface NormalizedSubmission {
  hadPhoneStolen: 'yes' | 'no' | 'someone_i_know';
  phoneRecovered?: string;
  replacementMethod?: string;
  theftLocation?: string;
  securityMeasures?: string;
  reportedToPolice?: string;
  sessionId: string;
}

function normalizeSubmission(body: any): NormalizedSubmission | null {
  const hadPhoneStolen = body.hadPhoneStolen || body.had_phone_stolen;
  const sessionId = body.session_id || body.sessionId;
  if (!hadPhoneStolen || !sessionId) return null;
  if (!['yes', 'no', 'someone_i_know'].includes(hadPhoneStolen)) return null;

  return {
    hadPhoneStolen: hadPhoneStolen as 'yes' | 'no' | 'someone_i_know',
    sessionId,
    phoneRecovered: body.phoneRecovered || body.phone_recovered || undefined,
    replacementMethod: body.replacementMethod || body.replacement_method || undefined,
    theftLocation: body.theftLocation || body.theft_location || undefined,
    securityMeasures: body.securityMeasures || body.security_measures || undefined,
    reportedToPolice: body.reportedToPolice || body.reported_to_police || undefined,
  };
}

function validateSubmission(data: NormalizedSubmission): string | null {
  if (data.hadPhoneStolen === 'yes') {
    if (!data.phoneRecovered || !data.theftLocation) {
      return 'Missing required fields for theft victims';
    }
  }
  return null;
}

async function getIpHash(request: Request): Promise<string | undefined> {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
  return clientIP !== 'unknown' ? await hashIP(clientIP) : undefined;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = getClientIp(request);
    const rateLimited = checkRateLimit(`community:${ip}`, 10, 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const submission = normalizeSubmission(body);
    if (!submission) {
      return jsonResponse({ success: false, error: 'Missing required fields: hadPhoneStolen and sessionId' }, 400);
    }

    const validationError = validateSubmission(submission);
    if (validationError) {
      return jsonResponse({ success: false, error: validationError }, 400);
    }

    const ipHash = await getIpHash(request);

    await submitCommunityResponse({
      ...submission,
      userIpHash: ipHash,
      userAgent: request.headers.get('user-agent') || undefined,
    } as Parameters<typeof submitCommunityResponse>[0]);

    return jsonResponse({ success: true, message: 'Response submitted successfully' }, 200);
  } catch (error) {
    console.error('Error in submit API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('already submitted') ? 400 : 500;
    return jsonResponse({ success: false, error: errorMessage }, status);
  }
};
