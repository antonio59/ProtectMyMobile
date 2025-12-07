import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Resend } from 'resend';
import { requireApiKey } from '../../../lib/security';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PMM-FOI-${year}Q${quarter}-${random}`;
}

function getQuarterDateRange(): { start: string; end: string } {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  const year = now.getFullYear();
  
  // Request data for the PREVIOUS quarter
  let startMonth: number, endMonth: number, dataYear: number;
  
  if (quarter === 1) {
    // Q1: Request Q4 of previous year
    startMonth = 10; // October
    endMonth = 12;   // December
    dataYear = year - 1;
  } else {
    // Q2-4: Request previous quarter of same year
    startMonth = (quarter - 2) * 3 + 1;
    endMonth = (quarter - 1) * 3;
    dataYear = year;
  }
  
  const startDate = new Date(dataYear, startMonth - 1, 1);
  const endDate = new Date(dataYear, endMonth, 0); // Last day of end month
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}

function generateFOIRequestBody(forceName: string, dateRange: { start: string; end: string }): string {
  return `Dear Freedom of Information Team,

I am writing to make a request under the Freedom of Information Act 2000.

I would like to request the following information regarding mobile phone theft offences recorded by ${forceName} for the period ${dateRange.start} to ${dateRange.end}:

1. The total number of mobile phone theft offences recorded during this period
2. A breakdown by month showing the number of offences
3. Where available, a breakdown by:
   - Location/area (borough, district, or ward level)
   - Time of day (morning/afternoon/evening/night)
   - Outcome status (detected, undetected, under investigation)
4. If available, the top 10 locations/hotspots for mobile phone theft during this period

I understand that under the Act I am entitled to a response within 20 working days.

If any part of this request is unclear or you require any clarification, please contact me.

If the cost of complying with this request exceeds the appropriate limit, please advise me of the options available to narrow the scope.

I would prefer to receive this information in CSV or Excel format if possible.

Thank you for your assistance.

Kind regards,
ProtectMyMobile Research Team
Email: foi@protectmymobile.xyz
Website: https://protectmymobile.xyz

This request is made for research purposes to help provide the public with accurate information about mobile phone theft trends in the UK.`;
}

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  if (!convex) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing PUBLIC_CONVEX_URL' 
    }), { status: 500 });
  }

  const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing RESEND_API_KEY' 
    }), { status: 500 });
  }

  try {
    const resend = new Resend(resendApiKey);
    const dateRange = getQuarterDateRange();
    
    // Get all active police forces
    const forces = await convex.query(api.policeForces.list, { activeOnly: true });
    
    if (!forces || forces.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No police forces found. Run seed first.' 
      }), { status: 400 });
    }

    const results = {
      sent: [] as string[],
      failed: [] as { force: string; error: string }[],
      skipped: [] as string[],
    };

    for (const force of forces) {
      // Check if we already sent a request to this force this quarter
      const existingRequests = await convex.query(api.foiRequests.list, { 
        policeForce: force.name 
      });
      
      const thisQuarterRequests = existingRequests?.filter(r => {
        const requestDate = new Date(r.requestDate);
        const now = new Date();
        const sameQuarter = Math.ceil((requestDate.getMonth() + 1) / 3) === Math.ceil((now.getMonth() + 1) / 3);
        const sameYear = requestDate.getFullYear() === now.getFullYear();
        return sameQuarter && sameYear && r.status !== 'rejected';
      });

      if (thisQuarterRequests && thisQuarterRequests.length > 0) {
        results.skipped.push(force.name);
        continue;
      }

      const referenceNumber = generateReferenceNumber();
      const requestBody = generateFOIRequestBody(force.name, dateRange);

      try {
        // Send the FOI request email
        await resend.emails.send({
          from: 'ProtectMyMobile FOI <foi@protectmymobile.xyz>',
          to: [force.foiEmail],
          subject: `Freedom of Information Request - Mobile Phone Theft Data [${referenceNumber}]`,
          text: requestBody,
          replyTo: 'foi@protectmymobile.xyz',
        });

        // Create the request record in database
        await convex.mutation(api.foiRequests.create, {
          adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
          referenceNumber,
          policeForce: force.name,
          policeForceEmail: force.foiEmail,
          dateRangeStart: dateRange.start,
          dateRangeEnd: dateRange.end,
          requestBody,
          status: 'sent',
        });

        // Update last request date on police force
        await convex.mutation(api.policeForces.update, {
          adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
          id: force._id,
          lastRequestDate: Date.now(),
        });

        results.sent.push(force.name);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        results.failed.push({ 
          force: force.name, 
          error: error.message 
        });
      }
    }

    // Send summary email to admin
    await resend.emails.send({
      from: 'ProtectMyMobile <onboarding@resend.dev>',
      to: ['protectmymobile.xyz.overlabor129@passmail.com'], // Replace with actual admin email
      subject: `FOI Requests Summary: ${results.sent.length} sent, ${results.failed.length} failed`,
      html: `
        <h2>Quarterly FOI Request Summary</h2>
        <p>Date Range Requested: ${dateRange.start} to ${dateRange.end}</p>
        
        <h3>✅ Successfully Sent (${results.sent.length})</h3>
        <ul>${results.sent.map(f => `<li>${f}</li>`).join('') || '<li>None</li>'}</ul>
        
        <h3>⏭️ Skipped - Already Requested (${results.skipped.length})</h3>
        <ul>${results.skipped.map(f => `<li>${f}</li>`).join('') || '<li>None</li>'}</ul>
        
        <h3>❌ Failed (${results.failed.length})</h3>
        <ul>${results.failed.map(f => `<li>${f.force}: ${f.error}</li>`).join('') || '<li>None</li>'}</ul>
        
        <p>View all requests at: <a href="https://protectmymobile.xyz/admin/foi">Admin Dashboard</a></p>
      `,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      dateRange,
      results 
    }), { status: 200 });

  } catch (error: any) {
    console.error('FOI request error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
};
