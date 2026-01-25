// SendGrid integration for sending transactional emails
import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
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

export async function sendPasswordResetEmail(data: {
  email: string;
  resetToken: string;
  firstName?: string | null;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  
  const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';
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
