import { v } from 'convex/values';
import { internalAction } from './_generated/server';

/**
 * Enterprise Mail Service powered by Resend.
 * Securely sends transaction and onboarding emails using the ewinproject.org domain.
 */
export const sendMail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not configured in Convex dashboard');

    const domain = "ewinproject.org";
    const fromAddress = `CollegeCBT <support@${domain}>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        from: fromAddress,
        to: args.to,
        subject: args.subject,
        html: args.html
      })
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`[Resend Mail] Failed to send to ${args.to}:`, errorText);
      throw new Error(`Resend Error: ${errorText}`);
    }

    const data = await resp.json();
    console.log(`[Resend Mail] Email sent successfully to ${args.to} (ID: ${data.id})`);
    
    return data.id;
  },
});
