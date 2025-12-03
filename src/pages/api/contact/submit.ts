import type { APIRoute } from 'astro';
import { createContactSubmission } from '../../../lib/convexMutations';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const { name, email, subject, message } = formData;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'All fields are required' 
        }), 
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email address' 
        }), 
        { status: 400 }
      );
    }

    // Save to Convex
    const result = await createContactSubmission({
      name,
      email,
      subject,
      message
    });

    // Send email notification via Resend
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        // Send notification to admin
        await resend.emails.send({
          from: 'ProtectMyMobile <onboarding@resend.dev>', // Using default domain for testing
          to: ['protectmymobile.xyz.overlabor129@passmail.com'], // Send to the verified email usually, or your own
          subject: `New Contact: ${subject}`,
          html: `
            <h2>New Contact Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #eee; padding-left: 1em; margin-left: 0;">
              ${message.replace(/\n/g, '<br>')}
            </blockquote>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue - we still saved to database
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result 
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }), 
      { status: 500 }
    );
  }
};
