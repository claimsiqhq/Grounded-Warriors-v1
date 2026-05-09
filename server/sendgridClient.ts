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

  // Brand palette (matches client/src/index.css)
  //   Night Forest bg: #0f1812   Deep Pine card: #1e3329
  //   Birch text:      #c5b393   Sage accent:    #3e5d48
  //   Moss subtle:     #90a190
  const headingFont = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const bodyFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

  const msg = {
    to: data.email,
    from: fromEmail,
    subject: 'Welcome to the Circle — Grounded Warriors',
    text: `Brother,

You're in. Expect a dispatch when a new expedition opens, when there are tracks worth sharing from the trail, and when something out of the field is worth a read.

When you're ready, lock in a free Member Portal account:
${registerLink}

From there you can:

  • Reserve a spot on an upcoming expedition — ${retreatsLink}
  • Join the General Commons, our open chat for the broader crew — ${commonsLink}

No rush. The wild isn't going anywhere, and neither are we.

—
Grounded Warriors
Return to the Elements. Return to Yourself.
Wilderness Expeditions for Men · Ontario, Canada`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
  <title>Welcome to the Circle</title>
</head>
<body style="margin:0; padding:0; background-color:#0f1812; font-family:${bodyFont}; color:#c5b393;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f1812;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

          <!-- Header / Wordmark -->
          <tr>
            <td align="center" style="padding:24px 0 32px 0;">
              <div style="font-family:${headingFont}; font-size:30px; font-weight:500; letter-spacing:4px; color:#c5b393; text-transform:uppercase;">
                Grounded Warriors
              </div>
              <div style="margin-top:10px; font-family:${headingFont}; font-style:italic; font-size:15px; color:#90a190; letter-spacing:1px;">
                Return to the Elements. Return to Yourself.
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#1e3329; border:1px solid #3e5d48; padding:48px 40px;">

              <h1 style="margin:0 0 28px 0; font-family:${headingFont}; font-weight:500; font-size:34px; line-height:1.2; color:#c5b393; text-align:center;">
                Welcome to the Circle
              </h1>

              <p style="margin:0 0 18px 0; font-size:16px; line-height:1.75; color:#c5b393;">
                Brother,
              </p>

              <p style="margin:0 0 18px 0; font-size:16px; line-height:1.75; color:#c5b393;">
                You're in. Expect a dispatch when a new expedition opens, when there are tracks worth sharing from the trail, and when something out of the field is worth a read.
              </p>

              <p style="margin:0 0 32px 0; font-size:16px; line-height:1.75; color:#c5b393;">
                When you're ready, take one more step &mdash; lock in a free Member Portal account. From there you can reserve a spot on an upcoming expedition, or join the General Commons, our open chat for the broader crew.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 32px auto;">
                <tr>
                  <td align="center" style="background-color:#c5b393; padding:14px 36px;">
                    <a href="${registerLink}" style="font-family:${bodyFont}; font-size:14px; font-weight:500; letter-spacing:2px; text-transform:uppercase; color:#0f1812; text-decoration:none; display:inline-block;">
                      Create Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px 0;">
                <tr><td style="border-top:1px solid #3e5d48; line-height:0; font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Two paths -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 12px 0 0; vertical-align:top; width:50%;">
                    <div style="font-family:${headingFont}; font-size:20px; font-weight:500; color:#c5b393; margin-bottom:8px;">
                      Reserve a Spot
                    </div>
                    <p style="margin:0 0 12px 0; font-size:14px; line-height:1.65; color:#90a190;">
                      See upcoming expeditions and lock in your seat by the fire.
                    </p>
                    <a href="${retreatsLink}" style="font-size:13px; letter-spacing:1px; text-transform:uppercase; color:#c5b393; text-decoration:none; border-bottom:1px solid #3e5d48; padding-bottom:2px;">
                      View Expeditions
                    </a>
                  </td>
                  <td style="padding:0 0 0 12px; vertical-align:top; width:50%;">
                    <div style="font-family:${headingFont}; font-size:20px; font-weight:500; color:#c5b393; margin-bottom:8px;">
                      Join the General Commons
                    </div>
                    <p style="margin:0 0 12px 0; font-size:14px; line-height:1.65; color:#90a190;">
                      Our open chat for the broader crew of Grounded Warriors.
                    </p>
                    <a href="${commonsLink}" style="font-size:13px; letter-spacing:1px; text-transform:uppercase; color:#c5b393; text-decoration:none; border-bottom:1px solid #3e5d48; padding-bottom:2px;">
                      Enter the Commons
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:36px 0 0 0; font-size:14px; line-height:1.75; color:#90a190; font-style:italic; text-align:center;">
                No rush. The wild isn't going anywhere, and neither are we.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 16px 16px 16px;">
              <div style="font-family:${headingFont}; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#90a190;">
                Grounded Warriors
              </div>
              <div style="margin-top:6px; font-size:12px; color:#90a190;">
                Wilderness Expeditions for Men &middot; Ontario, Canada
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
          Wilderness Expeditions for Men · Ontario, Canada
        </p>
      </div>
    `
  };

  await client.send(msg);
  return true;
}
