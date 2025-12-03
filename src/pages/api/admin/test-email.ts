import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const GET: APIRoute = async ({ url }) => {
  const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing RESEND_API_KEY environment variable' 
    }), { status: 500 });
  }

  // Get recipient email from query param or use default
  const recipientEmail = url.searchParams.get('email') || 'delivered@resend.dev';

  try {
    const resend = new Resend(resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: 'ProtectMyMobile <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: '🧪 Test Email - ProtectMyMobile Data Alerts',
      html: `
        <h2>Test Email from ProtectMyMobile</h2>
        <p>This is a test email to verify the notification system is working correctly.</p>
        
        <h3>What you'll receive alerts for:</h3>
        <ul>
          <li>📊 New FOI responses found on WhatDoTheyKnow</li>
          <li>📬 Quarterly FOI request summaries</li>
          <li>✅ Directory verification reports (banks/providers)</li>
          <li>📰 New automated news articles</li>
        </ul>
        
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>Recipient:</strong> ${recipientEmail}</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from ProtectMyMobile admin panel.<br>
          <a href="https://protectmymobile.xyz/admin/data">Manage Data</a>
        </p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Test email sent to ${recipientEmail}`,
      emailId: data?.id,
    }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
};
