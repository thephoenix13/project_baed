import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';

const resend = new Resend(process.env.RESEND_API_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, mobile } = req.body;

    // Validate required fields
    if (!name || !email || !mobile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate mobile (10 digits)
    const mobileClean = mobile.replace(/\s/g, '');
    if (!/^[0-9]{10}$/.test(mobileClean)) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }

    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    }) + " IST";

    // Check if user already exists in waitlist
    const existingSignup = await redis.hgetall(`waitlist:${email}`);
    const isDuplicate = existingSignup && Object.keys(existingSignup).length > 0;

    // Store signup data in Redis (will overwrite if duplicate)
    await redis.hset(`waitlist:${email}`, {
      name,
      email,
      mobile: mobileClean,
      timestamp,
      isDuplicate: isDuplicate ? 'true' : 'false',
    });

    // Email 1: Welcome email to the user
    let welcomeHtml: string;
    let welcomeText: string;

    if (isDuplicate) {
      // Duplicate signup message
      welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're already on the Bae'd waitlist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; font-weight: 700; color: #111827;">
                Bae<span style="color: #f43f5e;">'d</span>
              </h1>
              <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">Dating, without the doubt.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                You're already on the waitlist! We've got you down.
              </p>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                We'll reach out before we launch. Thanks for your patience!
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                — Team Bae'd<br>
                <span style="font-size: 14px; color: #6b7280;">Made in India 🇮🇳</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                You're receiving this because you signed up for the Bae'd waitlist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      welcomeText = `Hi ${name},

You're already on the waitlist! We've got you down.

We'll reach out before we launch. Thanks for your patience!

— Team Bae'd
Made in India 🇮🇳`;
    } else {
      // New signup message
      welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bae'd</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; font-weight: 700; color: #111827;">
                Bae<span style="color: #f43f5e;">'d</span>
              </h1>
              <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">Dating, without the doubt.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Thanks for joining the waitlist! We'll reach out before we launch.
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                — Team Bae'd<br>
                <span style="font-size: 14px; color: #6b7280;">Made in India 🇮🇳</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                You're receiving this because you signed up for the Bae'd waitlist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      welcomeText = `Hi ${name},

Thanks for joining the waitlist! We'll reach out before we launch.

— Team Bae'd
Made in India 🇮🇳`;
    }

    // Email 2: Notification to the team
    const notificationText = isDuplicate
      ? `Duplicate waitlist signup

Name: ${name}
Email: ${email}
Mobile: ${mobileClean}
Timestamp: ${timestamp}
Note: This user already signed up previously.`
      : `New waitlist signup

Name: ${name}
Email: ${email}
Mobile: ${mobileClean}
Timestamp: ${timestamp}`;

    // Send both emails
    const [welcomeResult, notificationResult] = await Promise.all([
      // Welcome email to user
      resend.emails.send({
        from: `"Bae'd" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: isDuplicate ? "You're already on the Bae'd waitlist" : "You're on the Bae'd waitlist",
        html: welcomeHtml,
        text: welcomeText,
      }),
      // Notification email to team
      resend.emails.send({
        from: `"Bae'd Waitlist" <${process.env.FROM_EMAIL}>`,
        to: process.env.NOTIFY_EMAIL,
        replyTo: email,
        subject: isDuplicate ? `Duplicate waitlist signup — ${email}` : `New waitlist signup — ${email}`,
        text: notificationText,
      }),
    ]);

    // Check for errors
    if (welcomeResult.error || notificationResult.error) {
      console.error('Email sending errors:', {
        welcome: welcomeResult.error,
        notification: notificationResult.error,
      });
      return res.status(500).json({ error: 'Failed to send emails' });
    }

    return res.status(200).json({ 
      success: true, 
      isDuplicate,
      message: isDuplicate ? 'You are already on the waitlist, but we have sent you an email.' : 'Successfully joined the waitlist!'
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
