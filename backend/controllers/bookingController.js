const { createSupabaseClient } = require('../supabase');
const { env, hasSupabaseConfig } = require('../config');
const { generateReferenceCode, normalizeEmail, sanitizeString, buildBookingSummary } = require('../utils/helpers');
const { uploadBookingFiles } = require('../services/storageService');
const { sendBookingEmail, sendBookingWhatsApp } = require('../services/notificationService');

async function createBookingHandler(req, res) {
  try {
    const body = req.body || {};
    const files = req.files || [];

    const payload = {
      fullName: body.fullName || body.customer_name || '',
      email: body.email || body.customer_email || '',
      phone: body.phone || body.customer_phone || '',
      location: body.location || body.city || '',
      address: body.address || '',
      street: body.street || '',
      notes: body.notes || '',
      selectedServices: Array.isArray(body.selectedServices)
        ? body.selectedServices
        : Array.isArray(body['selectedServices[]'])
          ? body['selectedServices[]']
          : (typeof body.selectedServices === 'string' ? (() => {
            try { return JSON.parse(body.selectedServices); } catch (e) { return body.service ? [body.service] : []; }
          })() : (body.service ? [body.service] : [])),
      date: body.date || body.preferred_date || '',
      time: body.time || body.preferred_time || '',
      country: body.country || '',
      postcode: body.postcode || '',
      referralCode: body.referralCode || body.referral_code || '',
    };

    if (!payload.fullName || !payload.email || !payload.phone) {
      return res.status(400).json({ ok: false, message: 'Missing required booking information.' });
    }

    const ref = generateReferenceCode('EL');
    const bookingRecord = {
      reference_code: ref,
      customer_name: sanitizeString(payload.fullName),
      customer_email: normalizeEmail(payload.email),
      customer_phone: sanitizeString(payload.phone),
      country: sanitizeString(payload.country),
      postcode: sanitizeString(payload.postcode),
      street: sanitizeString(payload.street),
      location: sanitizeString(payload.location),
      address: sanitizeString(payload.address),
      service_types: payload.selectedServices,
      preferred_date: sanitizeString(payload.date),
      preferred_time: sanitizeString(payload.time),
      notes: sanitizeString(payload.notes),
      referral_code: sanitizeString(payload.referralCode),
      source_page: body.sourcePage || 'website',
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (hasSupabaseConfig) {
      const supabase = createSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('bookings')
          .insert([bookingRecord])
          .select();

        if (error) {
          throw new Error(`Supabase insert failed: ${error.message}`);
        }

        const bookingId = data?.[0]?.id;
        let uploadedImageUrls = [];
        if (bookingId && files.length > 0) {
          const uploadResult = await uploadBookingFiles(bookingId, files);
          if (uploadResult.ok && uploadResult.uploaded.length > 0) {
            const imageMeta = uploadResult.uploaded.map((row) => ({
              booking_id: bookingId,
              storage_path: row.storagePath,
              file_name: row.fileName,
              mime_type: row.mimeType,
              file_size: 0,
              uploaded_by: 'customer',
              created_at: new Date().toISOString(),
            }));

            const { error: imageError } = await supabase
              .from('booking_images')
              .insert(imageMeta);

            if (imageError) {
              console.error('Supabase image metadata insert failed:', imageError.message);
            }

            uploadedImageUrls = uploadResult.uploaded.map((r) => r.url).filter(Boolean);
          }
        }
      }
    }

    const summary = buildBookingSummary(payload);
    const emailResult = await sendBookingEmail({
      reference: ref,
      name: summary.fullName,
      email: summary.email,
      phone: summary.phone,
      services: summary.service,
      date: summary.date,
      time: summary.time,
      location: summary.city,
      notes: summary.notes,
      images: typeof uploadedImageUrls !== 'undefined' ? uploadedImageUrls : [],
    });

    const whatsappResult = await sendBookingWhatsApp({
      reference: ref,
      name: summary.fullName,
      email: summary.email,
      phone: summary.phone,
      services: summary.service,
      date: summary.date,
      time: summary.time,
      location: summary.city,
      notes: summary.notes,
      images: typeof uploadedImageUrls !== 'undefined' ? uploadedImageUrls : [],
    });

    return res.status(200).json({
      ok: true,
      message: 'Booking request submitted successfully.',
      reference: ref,
      emailNotification: emailResult,
      whatsappNotification: whatsappResult,
      images: typeof uploadedImageUrls !== 'undefined' ? uploadedImageUrls : [],
    });
  } catch (error) {
    console.error('Booking submission failed:', error);
    return res.status(500).json({
      ok: false,
      message: 'Booking request failed.',
      error: error.message,
    });
  }
}

module.exports = { createBookingHandler };
