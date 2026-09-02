const { Resend } = require('resend');
const twilio = require('twilio');
const { env } = require('../config');

function getResendClient() {
  if (!env.resendApiKey) {
    return null;
  }
  return new Resend(env.resendApiKey);
}

function getTwilioClient() {
  if (!env.twilioAccountSid || !env.twilioAuthToken) {
    return null;
  }
  return twilio(env.twilioAccountSid, env.twilioAuthToken);
}

async function sendBookingEmail(payload) {
  const client = getResendClient();
  if (!client) {
    return { ok: false, reason: 'RESEND_NOT_CONFIGURED' };
  }

  const subject = `New ELEA booking: ${payload.reference}`;
  const lines = [
    `New booking request from ELEA website`,
    `Reference: ${payload.reference}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Services: ${payload.services}`,
    `Date: ${payload.date}`,
    `Time: ${payload.time}`,
    `Location: ${payload.location}`,
    `Notes: ${payload.notes || 'None'}`,
  ];

  const images = Array.isArray(payload.images) ? payload.images : [];
  if (images.length > 0) {
    lines.push('Images:');
    for (const url of images) lines.push(url);
  }

  const text = lines.join('\n');

  // Build simple HTML with image previews/links if images are present
  let html = `<p>New booking request from ELEA website</p>`;
  html += `<ul>`;
  html += `<li><strong>Reference:</strong> ${payload.reference}</li>`;
  html += `<li><strong>Name:</strong> ${payload.name}</li>`;
  html += `<li><strong>Email:</strong> ${payload.email}</li>`;
  html += `<li><strong>Phone:</strong> ${payload.phone}</li>`;
  html += `<li><strong>Services:</strong> ${payload.services}</li>`;
  html += `<li><strong>Date:</strong> ${payload.date}</li>`;
  html += `<li><strong>Time:</strong> ${payload.time}</li>`;
  html += `<li><strong>Location:</strong> ${payload.location}</li>`;
  html += `<li><strong>Notes:</strong> ${payload.notes || 'None'}</li>`;
  html += `</ul>`;

  if (images.length > 0) {
    html += `<h3>Images</h3>`;
    for (const url of images) {
      html += `<p><a href="${url}">Open image</a><br><img src="${url}" style="max-width:400px; height:auto;"/></p>`;
    }
  }

  const emailResult = await client.emails.send({
    from: env.emailFrom,
    to: ['eleacleaning@gmail.com'],
    subject,
    text,
    html,
  });

  return { ok: true, result: emailResult };
}

async function sendBookingWhatsApp(payload) {
  const client = getTwilioClient();
  if (!client || !env.twilioWhatsappFrom) {
    return { ok: false, reason: 'TWILIO_NOT_CONFIGURED' };
  }

  const message = [
    'New ELEA booking request',
    `Reference: ${payload.reference}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Services: ${payload.services}`,
    `Date: ${payload.date}`,
    `Time: ${payload.time}`,
    `Location: ${payload.location}`,
    `Notes: ${payload.notes || 'None'}`,
  ].join('\n');

  const resultPayload = {
    from: env.twilioWhatsappFrom,
    to: 'whatsapp:+4915216019843',
    body: message,
  };

  const images = Array.isArray(payload.images) ? payload.images : [];
  if (images.length > 0) {
    resultPayload.mediaUrl = images;
  }

  const result = await client.messages.create(resultPayload);

  return { ok: true, result };
}

module.exports = {
  sendBookingEmail,
  sendBookingWhatsApp,
};
