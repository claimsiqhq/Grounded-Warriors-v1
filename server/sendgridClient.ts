// SendGrid integration for sending transactional emails
import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  // Direct env vars (used on Render and other non-Replit hosts)
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    return {
      apiKey: process.env.SENDGRID_API_KEY,
      email: process.env.SENDGRID_FROM_EMAIL,
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!hostname || !xReplitToken) {
    throw new Error('SendGrid credentials not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

export async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  message: string;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  
  const msg = {
    to: 'bcoones@gmail.com',
    from: fromEmail,
    replyTo: data.email,
    subject: `Grounded Warriors Contact: ${data.name}`,
    text: `New contact form submission from Grounded Warriors website:

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}

---
This message was sent via the Grounded Warriors website contact form.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b4a06e;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <h3 style="color: #b4a06e;">Message:</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">This message was sent via the Grounded Warriors website contact form.</p>
      </div>
    `
  };

  await client.send(msg);
  return true;
}

export async function sendNewsletterWelcomeEmail(data: {
  email: string;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();

  const baseUrl =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.REPLIT_DOMAINS?.split(',')[0]
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'http://localhost:5000');
  const registerLink = `${baseUrl}/login?mode=register&email=${encodeURIComponent(data.email)}`;
  const retreatsLink = `${baseUrl}/retreats`;
  const commonsLink = `${baseUrl}/member/discussions`;

  const msg = {
    to: data.email,
    from: fromEmail,
    subject: 'Welcome to the Circle — Grounded Warriors',
    text: `Welcome, brother.

Thank you for stepping into the circle. You'll now hear from us when a new retreat opens, when stories from the land are worth sharing, and when there's a quiet moment we think you'd want to know about.

There's one more step you can take whenever you're ready: create a free account in the Member Portal. From there you can:

  • Register for an upcoming retreat (${retreatsLink})
  • Join the General Commons — our open conversation space for men walking this path together (${commonsLink})

Create your account here:
${registerLink}

No pressure. The trees aren't going anywhere, and neither are we.

---
Grounded Warriors
Return to the Elements. Return to Yourself.
Men's Healing Retreats in Ontario`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #e0e0e0; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8bc34a; margin: 0; font-weight: normal; letter-spacing: 1px;">Grounded Warriors</h1>
          <p style="color: #888; font-style: italic; margin-top: 8px;">Return to the Elements. Return to Yourself.</p>
        </div>

        <h2 style="color: #ffffff; margin-bottom: 20px; font-weight: normal;">Welcome to the Circle</h2>

        <p style="line-height: 1.7;">Brother,</p>

        <p style="line-height: 1.7;">Thank you for stepping into the circle. You'll now hear from us when a new retreat opens, when stories from the land are worth sharing, and when there's a quiet moment we think you'd want to know about.</p>

        <p style="line-height: 1.7;">There's one more step you can take whenever you're ready &mdash; create a free account in the Member Portal. From there you can register for an upcoming retreat, or join the General Commons, our open conversation space for men walking this path together.</p>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${registerLink}" style="background-color: #8bc34a; color: #1a1a1a; padding: 15px 32px; text-decoration: none; display: inline-block; font-weight: bold; letter-spacing: 0.5px;">
            Create Your Account
          </a>
        </div>

        <table style="width: 100%; margin: 30px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 16px; border: 1px solid #333; vertical-align: top; width: 50%;">
              <h3 style="color: #8bc34a; margin: 0 0 8px 0; font-size: 16px;">Register for a Retreat</h3>
              <p style="color: #bbb; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">See upcoming gatherings and reserve your seat by the fire.</p>
              <a href="${retreatsLink}" style="color: #8bc34a; font-size: 14px;">View retreats &rarr;</a>
            </td>
            <td style="padding: 16px; border: 1px solid #333; vertical-align: top; width: 50%;">
              <h3 style="color: #8bc34a; margin: 0 0 8px 0; font-size: 16px;">Join the General Commons</h3>
              <p style="color: #bbb; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">Our open chat for any man walking this path.</p>
              <a href="${commonsLink}" style="color: #8bc34a; font-size: 14px;">Enter the Commons &rarr;</a>
            </td>
          </tr>
        </table>

        <p style="color: #888; line-height: 1.7; font-size: 14px;">No pressure. The trees aren't going anywhere, and neither are we.</p>

        <hr style="border: none; border-top: 1px solid #333; margin: 35px 0;" />

        <p style="color: #666; font-size: 12px; text-align: center; line-height: 1.6;">
          Grounded Warriors<br/>
          Men's Healing Retreats in Ontario
        </p>
      </div>
    `
  };

  await client.send(msg);
  return true;
}

export async function sendPasswordResetEmail(data: {
  email: string;
  resetToken: string;
  firstName?: string | null;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  
  const baseUrl =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.REPLIT_DOMAINS?.split(',')[0]
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'http://localhost:5000');
  const resetLink = `${baseUrl}/login?reset=${data.resetToken}`;
  const name = data.firstName || 'Warrior';
  
  const msg = {
    to: data.email,
    from: fromEmail,
    subject: 'Reset Your Grounded Warriors Password',
    text: `Hi ${name},

You requested a password reset for your Grounded Warriors account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

---
Grounded Warriors
Return to the Elements. Return to Yourself.`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #e0e0e0; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8bc34a; margin: 0;">Grounded Warriors</h1>
          <p style="color: #888; font-style: italic;">Return to the Elements. Return to Yourself.</p>
        </div>
        
        <h2 style="color: #ffffff; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p>Hi ${name},</p>
        
        <p>You requested a password reset for your Grounded Warriors member account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #8bc34a; color: #1a1a1a; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #888; font-size: 14px;">This link will expire in 1 hour.</p>
        
        <p style="color: #888; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        
        <hr style="border: 1px solid #333; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          Grounded Warriors<br/>
          Men's Healing Retreats in Ontario
        </p>
      </div>
    `
  };

  await client.send(msg);
  return true;
}
