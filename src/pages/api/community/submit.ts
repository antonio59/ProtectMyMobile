// API Endpoint: POST /api/community/submit
// Handles community response submissions

import type { APIRoute } from 'astro';
import { submitCommunityResponse, hashIP } from '../../../lib/convexMutations';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.had_phone_stolen && !body.hadPhoneStolen) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required field: hadPhoneStolen' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionId = body.session_id || body.sessionId;
    if (!sessionId) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing session ID' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hadPhoneStolen = body.hadPhoneStolen || body.had_phone_stolen;
    
    // Validate conditional fields
    if (hadPhoneStolen === 'yes') {
      const phoneRecovered = body.phoneRecovered || body.phone_recovered;
      const theftLocation = body.theftLocation || body.theft_location;
      if (!phoneRecovered || !theftLocation) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Missing required fields for theft victims' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get client IP for rate limiting (hashed for privacy)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const ipHash = clientIP !== 'unknown' ? await hashIP(clientIP) : undefined;

    // Submit to Convex
    await submitCommunityResponse({
      hadPhoneStolen: hadPhoneStolen,
      phoneRecovered: body.phoneRecovered || body.phone_recovered || undefined,
      replacementMethod: body.replacementMethod || body.replacement_method || undefined,
      theftLocation: body.theftLocation || body.theft_location || undefined,
      securityMeasures: body.securityMeasures || body.security_measures || undefined,
      reportedToPolice: body.reportedToPolice || body.reported_to_police || undefined,
      sessionId: sessionId,
      userIpHash: ipHash,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Response submitted successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in submit API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('already submitted') ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
