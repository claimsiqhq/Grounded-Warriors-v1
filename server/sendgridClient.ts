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

// Escape user-supplied strings before interpolating into email HTML.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPublicBaseUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.REPLIT_DOMAINS?.split(',')[0]
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'http://localhost:5000')
  );
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  message: string;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  
  const msg = {
    to: 'john.shoust@pm.me',
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
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <h3 style="color: #b4a06e;">Message:</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
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

  const baseUrl = getPublicBaseUrl();
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

// Brown Courage Coaching inquiry inbox.
// Prefers COACHING_INBOX_EMAILS (comma-separated). Falls back to
// STAFF_EMAILS so John + Brian get inquiries by default in any
// environment where the admin bootstrap is already set. Final fallback
// keeps things from silently dropping in dev.
function getCoachingRecipients(): string[] {
  const fromCoachVar = (process.env.COACHING_INBOX_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromCoachVar.length > 0) return fromCoachVar;
  const fromStaffVar = (process.env.STAFF_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromStaffVar.length > 0) return fromStaffVar;
  return ["john.shoust@pm.me"];
}

function coachLabel(key: string): string {
  if (key === "john") return "John Shoust";
  if (key === "brian") return "Brian Coones";
  return "No preference";
}

export async function sendCoachingInquiryNotification(inquiry: {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  preferredCoach: string;
  workingOn: string;
  ninetyDayWin: string;
  scheduleNotes?: string | null;
  budgetComfort?: string | null;
  referralSource?: string | null;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  const recipients = getCoachingRecipients();
  const coach = coachLabel(inquiry.preferredCoach);

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const row = (label: string, value: string | null | undefined) =>
    value && value.trim()
      ? `<tr><td style="padding:8px 12px; border-bottom:1px solid #2a2a2a; color:#90a190; vertical-align:top; width:200px;">${label}</td><td style="padding:8px 12px; border-bottom:1px solid #2a2a2a; color:#c5b393; white-space:pre-wrap;">${escape(value)}</td></tr>`
      : "";

  const msg = {
    to: recipients,
    from: fromEmail,
    replyTo: inquiry.email,
    subject: `Brown Courage Coaching — New Application: ${inquiry.name} (→ ${coach})`,
    text: `New Brown Courage Coaching application

Name: ${inquiry.name}
Email: ${inquiry.email}
Phone: ${inquiry.phone || "(not provided)"}
Preferred coach: ${coach}

What they're working on:
${inquiry.workingOn}

90-day win:
${inquiry.ninetyDayWin}

Schedule notes: ${inquiry.scheduleNotes || "(none)"}
Budget comfort: ${inquiry.budgetComfort || "(not shared)"}
Referral source: ${inquiry.referralSource || "(not shared)"}

Reply directly to this email to reach the applicant.
Inquiry ID: ${inquiry.id}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#0f1812; padding:24px; color:#c5b393;">
      <h2 style="color:#c5b393; font-family:Georgia, serif; margin:0 0 4px 0;">Brown Courage Coaching</h2>
      <p style="color:#90a190; margin:0 0 20px 0; font-size:14px;">New 1-on-1 application — #${inquiry.id}</p>
      <table style="width:100%; border-collapse:collapse; background:#1e3329;">
        ${row("Name", inquiry.name)}
        ${row("Email", inquiry.email)}
        ${row("Phone", inquiry.phone)}
        ${row("Preferred coach", coach)}
        ${row("Working on", inquiry.workingOn)}
        ${row("90-day win", inquiry.ninetyDayWin)}
        ${row("Schedule notes", inquiry.scheduleNotes)}
        ${row("Budget comfort", inquiry.budgetComfort)}
        ${row("Referral source", inquiry.referralSource)}
      </table>
      <p style="color:#90a190; font-size:12px; margin-top:16px;">Reply directly to this email to reach ${escape(inquiry.name)}.</p>
    </div>`,
  };

  await client.send(msg);
  return true;
}

export async function sendCoachingInquiryAutoReply(inquiry: {
  name: string;
  email: string;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  const firstName = inquiry.name.split(/\s+/)[0] || "Brother";

  const msg = {
    to: inquiry.email,
    from: fromEmail,
    subject: "We got it — Brown Courage Coaching",
    text: `${firstName},

We got your application for Brown Courage Coaching.

A coach — John or Brian — will reach out within 2 business days to set up your 30-minute intro call. We read every application personally.

In the meantime, don't change a thing. Keep doing the work you're doing. We'll be in touch.

—
Grounded Warriors
Brown Courage Coaching`,
    html: `<div style="font-family: Georgia, serif; max-width:600px; margin:0 auto; background:#0f1812; color:#c5b393; padding:40px 32px;">
      <div style="text-align:center; margin-bottom:28px;">
        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:24px; letter-spacing:3px; text-transform:uppercase; color:#c5b393;">Grounded Warriors</div>
        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-style:italic; color:#90a190; margin-top:6px; font-size:14px; letter-spacing:1px;">Brown Courage Coaching</div>
      </div>
      <div style="background:#1e3329; border:1px solid #3e5d48; padding:36px 32px;">
        <h1 style="font-family:'Cormorant Garamond', Georgia, serif; font-weight:500; color:#c5b393; margin:0 0 20px 0; font-size:28px;">We got it.</h1>
        <p style="line-height:1.7; color:#c5b393; margin:0 0 16px 0;">${firstName},</p>
        <p style="line-height:1.7; color:#c5b393; margin:0 0 16px 0;">Your application is in. A coach — John or Brian — will reach out within <strong>2 business days</strong> to set up your 30-minute intro call.</p>
        <p style="line-height:1.7; color:#c5b393; margin:0 0 16px 0;">We read every application personally. In the meantime, don't change a thing. Keep doing the work you're doing.</p>
        <p style="line-height:1.7; color:#90a190; margin:24px 0 0 0; font-style:italic;">— John &amp; Brian</p>
      </div>
      <p style="text-align:center; color:#90a190; font-size:12px; margin-top:20px;">Grounded Warriors · Ontario, Canada</p>
    </div>`,
  };

  await client.send(msg);
  return true;
}

// Sent once after a successful Stripe checkout for a retreat.
export async function sendRetreatConfirmationEmail(data: {
  email: string;
  name: string;
  retreatName: string;
  retreatDate: string;
  amountPaid: string | null;
  paymentType: "deposit" | "full";
  hasAccount: boolean;
}) {
  const { client, fromEmail } = await getUncachableSendGridClient();
  const baseUrl = getPublicBaseUrl();
  const portalLink = data.hasAccount
    ? `${baseUrl}/member`
    : `${baseUrl}/login?mode=register&email=${encodeURIComponent(data.email)}`;
  const firstName = escapeHtml((data.name || "").split(/\s+/)[0] || "Brother");
  const paymentLine =
    data.paymentType === "deposit"
      ? "Your deposit is in and your spot is held."
      : "Your payment is in and your spot is confirmed.";
  const amountLine = data.amountPaid ? `Amount paid: $${data.amountPaid} CAD (incl. HST)` : "";
  const portalCta = data.hasAccount
    ? "Head to your Member Portal to join your retreat's private container."
    : "Create your free Member Portal account with this email address to unlock your retreat's private container.";

  const msg = {
    to: data.email,
    from: fromEmail,
    subject: `You're In — ${data.retreatName} | Grounded Warriors`,
    text: `${firstName},

${paymentLine}

Retreat: ${data.retreatName}
Dates: ${data.retreatDate}
${amountLine}

${portalCta}
${portalLink}

We'll follow up with preparation materials and next steps as the date approaches. If you have any questions, just reply to this email.

—
Grounded Warriors
Return to the Elements. Return to Yourself.
Wilderness Expeditions for Men · Ontario, Canada`,
    html: `<div style="font-family: Georgia, serif; max-width:600px; margin:0 auto; background:#0f1812; color:#c5b393; padding:40px 32px;">
      <div style="text-align:center; margin-bottom:28px;">
        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:24px; letter-spacing:3px; text-transform:uppercase; color:#c5b393;">Grounded Warriors</div>
        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-style:italic; color:#90a190; margin-top:6px; font-size:14px; letter-spacing:1px;">Return to the Elements. Return to Yourself.</div>
      </div>
      <div style="background:#1e3329; border:1px solid #3e5d48; padding:36px 32px;">
        <h1 style="font-family:'Cormorant Garamond', Georgia, serif; font-weight:500; color:#c5b393; margin:0 0 20px 0; font-size:28px;">You're in.</h1>
        <p style="line-height:1.7; color:#c5b393; margin:0 0 16px 0;">${firstName},</p>
        <p style="line-height:1.7; color:#c5b393; margin:0 0 16px 0;">${paymentLine}</p>
        <table style="width:100%; border-collapse:collapse; margin:0 0 20px 0;">
          <tr><td style="padding:6px 0; color:#90a190;">Retreat</td><td style="padding:6px 0; color:#c5b393;">${escapeHtml(data.retreatName)}</td></tr>
          <tr><td style="padding:6px 0; color:#90a190;">Dates</td><td style="padding:6px 0; color:#c5b393;">${escapeHtml(data.retreatDate)}</td></tr>
          ${data.amountPaid ? `<tr><td style="padding:6px 0; color:#90a190;">Amount paid</td><td style="padding:6px 0; color:#c5b393;">$${escapeHtml(data.amountPaid)} CAD (incl. HST)</td></tr>` : ""}
        </table>
        <p style="line-height:1.7; color:#c5b393; margin:0 0 20px 0;">${portalCta}</p>
        <div style="text-align:center; margin:24px 0 8px 0;">
          <a href="${portalLink}" style="background-color:#c5b393; color:#0f1812; padding:14px 36px; text-decoration:none; display:inline-block; font-family:Arial, sans-serif; font-size:14px; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">
            ${data.hasAccount ? "Open Member Portal" : "Create Your Account"}
          </a>
        </div>
      </div>
      <p style="text-align:center; color:#90a190; font-size:12px; margin-top:20px;">We'll follow up with preparation materials as the date approaches.<br/>Grounded Warriors · Wilderness Expeditions for Men · Ontario, Canada</p>
    </div>`,
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

  const baseUrl = getPublicBaseUrl();
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
