
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    
    // For now, we'll just log the booking notification
    // In a real implementation, you would integrate with an email service like Resend, SendGrid, etc.
    console.log('New tutor booking received:', {
      id: record.id,
      name: record.name,
      email: record.email,
      message: record.message,
      created_at: record.created_at
    })

    // You can add email sending logic here
    // Example with a hypothetical email service:
    /*
    const emailService = new EmailService(Deno.env.get('EMAIL_API_KEY'))
    await emailService.send({
      to: 'admin@abcteachy.com',
      subject: `New Tutor Booking Request from ${record.name}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${record.name}</p>
        <p><strong>Email:</strong> ${record.email}</p>
        <p><strong>Message:</strong> ${record.message || 'No message provided'}</p>
        <p><strong>Submitted:</strong> ${new Date(record.created_at).toLocaleString()}</p>
      `
    })
    */

    return new Response(
      JSON.stringify({ message: 'Notification processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing booking notification:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process notification' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
