const { createSupabaseClient } = require('../supabase');
const { env } = require('../config');

async function uploadBookingFiles(bookingId, files) {
  const supabase = createSupabaseClient();
  if (!supabase || !Array.isArray(files) || files.length === 0) {
    return { ok: true, uploaded: [] };
  }

  const uploaded = [];

  for (const file of files) {
    if (!file || !file.originalname) {
      continue;
    }

    const fileName = `${bookingId}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage
      .from(env.storageBucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(fileName);
    uploaded.push({
      bookingId,
      storagePath: fileName,
      fileName: file.originalname,
      mimeType: file.mimetype,
      url: data?.publicUrl || null,
    });
  }

  return { ok: true, uploaded };
}

module.exports = { uploadBookingFiles };
