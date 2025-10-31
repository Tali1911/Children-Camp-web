import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProgramConfirmationRequest {
  email: string;
  name: string;
  programType: 'kenyan-experiences' | 'homeschooling' | 'school-experience' | 'team-building' | 'parties';
  details: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, programType, details }: ProgramConfirmationRequest = await req.json();

    console.log('Sending program confirmation email to:', email, 'for program:', programType);

    // Generate program-specific content
    let programTitle = '';
    let programDetails = '';

    switch (programType) {
      case 'kenyan-experiences':
        programTitle = 'Kenyan Experiences';
        programDetails = `
          <p><strong>Circuit:</strong> ${details.circuit}</p>
          <p><strong>Participants:</strong> ${details.participants?.length || 0}</p>
          <p><strong>Transport Required:</strong> ${details.transport ? 'Yes' : 'No'}</p>
        `;
        break;
      case 'homeschooling':
        programTitle = 'Homeschooling Outdoor Experiences';
        programDetails = `
          <p><strong>Package:</strong> ${details.package}</p>
          <p><strong>Children:</strong> ${details.children?.length || 0}</p>
          <p><strong>Focus Areas:</strong> ${details.focus?.join(', ') || 'N/A'}</p>
        `;
        break;
      case 'school-experience':
        programTitle = 'School Experience Package';
        programDetails = `
          <p><strong>School:</strong> ${details.schoolName}</p>
          <p><strong>Package:</strong> ${details.package}</p>
          <p><strong>Students:</strong> ${details.numberOfStudents}</p>
          <p><strong>Location:</strong> ${details.location}</p>
        `;
        break;
      case 'team-building':
        programTitle = 'Team Building Experience';
        programDetails = `
          <p><strong>Occasion:</strong> ${details.occasion}</p>
          <p><strong>Package:</strong> ${details.package}</p>
          <p><strong>Event Date:</strong> ${details.eventDate}</p>
          <p><strong>Location:</strong> ${details.location}</p>
        `;
        break;
      case 'parties':
        programTitle = 'Party Booking';
        programDetails = `
          <p><strong>Occasion:</strong> ${details.occasion}</p>
          <p><strong>Package:</strong> ${details.packageType}</p>
          <p><strong>Guests:</strong> ${details.guestsNumber}</p>
          <p><strong>Event Date:</strong> ${details.eventDate}</p>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Amuse Bush Camp <onboarding@resend.dev>",
      to: [email],
      subject: `Registration Confirmed - ${programTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2F5233 0%, #4A7C4E 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Amuse Bush Camp</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #2F5233;">Registration Received!</h2>
            
            <p>Dear ${name},</p>
            
            <p>Thank you for registering for <strong>${programTitle}</strong>. We have received your registration and will be in touch with you soon.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2F5233; margin-top: 0;">Registration Details:</h3>
              ${programDetails}
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Our team will review your registration within 24-48 hours</li>
              <li>We will contact you via email or phone to confirm availability</li>
              <li>Payment instructions and additional details will be shared upon confirmation</li>
            </ul>
            
            <p>If you have any immediate questions, please don't hesitate to contact us at:</p>
            <p>
              <strong>Email:</strong> info@amusebushcamp.com<br/>
              <strong>Phone:</strong> +254 700 000 000
            </p>
            
            <p>We look forward to creating an unforgettable outdoor experience for you!</p>
            
            <p>Best regards,<br/>
            <strong>The Amuse Bush Camp Team</strong></p>
          </div>
          
          <div style="background-color: #2F5233; padding: 20px; text-align: center; color: white; font-size: 12px;">
            <p>© 2025 Amuse Bush Camp. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-program-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
