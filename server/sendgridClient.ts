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
