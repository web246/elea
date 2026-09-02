function generateReferenceCode(prefix = 'EL') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeString(value) {
  return String(value ?? '').trim();
}

function safeJsonParse(input) {
  try {
    return JSON.parse(input);
  } catch (error) {
    return {};
  }
}

function buildBookingSummary(payload) {
  return {
    fullName: sanitizeString(payload.fullName || payload.customer_name),
    email: normalizeEmail(payload.email || payload.customer_email),
    phone: sanitizeString(payload.phone || payload.customer_phone),
    service: Array.isArray(payload.selectedServices)
      ? payload.selectedServices.join(', ')
      : sanitizeString(payload.service || ''),
    date: sanitizeString(payload.date || payload.preferred_date),
    time: sanitizeString(payload.time || payload.preferred_time),
    city: sanitizeString(payload.location || payload.city || ''),
    notes: sanitizeString(payload.notes || ''),
  };
}

module.exports = {
  generateReferenceCode,
  normalizeEmail,
  sanitizeString,
  safeJsonParse,
  buildBookingSummary,
};
