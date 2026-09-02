const { createSupabaseClient } = require('../supabase');
const { hasSupabaseConfig, env } = require('../config');

function getAdminHandlers() {
  async function getBookings(req, res) {
    try {
      if (!hasSupabaseConfig) return res.status(500).json({ ok: false, message: 'Supabase not configured' });
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('id,reference_code,customer_name,customer_email,customer_phone,service_types,preferred_date,preferred_time,notes,created_at,booking_images(*)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Resolve public URLs for any booking_images.storage_path
      for (const b of data) {
        if (Array.isArray(b.booking_images) && b.booking_images.length > 0) {
          for (const img of b.booking_images) {
            try {
              const { data: urlData } = await supabase.storage.from(env.storageBucket).getPublicUrl(img.storage_path || img.storage_path);
              img.url = urlData?.publicUrl || null;
            } catch (e) {
              img.url = null;
            }
          }
        }
      }

      return res.json({ ok: true, bookings: data });
    } catch (err) {
      console.error('Admin getBookings error:', err.message);
      return res.status(500).json({ ok: false, message: err.message });
    }
  }

  async function getCustomers(req, res) {
    try {
      if (!hasSupabaseConfig) return res.status(500).json({ ok: false, message: 'Supabase not configured' });
      const supabase = createSupabaseClient();
      // Aggregate unique customers from bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('customer_name,customer_email,customer_phone,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json({ ok: true, customers: data });
    } catch (err) {
      console.error('Admin getCustomers error:', err.message);
      return res.status(500).json({ ok: false, message: err.message });
    }
  }

  async function getAllUsers(req, res) {
    try {
      if (!hasSupabaseConfig) return res.status(500).json({ ok: false, message: 'Supabase not configured' });
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      // data may be { users: [...] }
      const users = (data && data.users) || data || [];
      // minimize payload
      const out = users.map(u => ({ id: u.id, email: u.email, phone: u.phone, created_at: u.created_at, user_metadata: u.user_metadata }));
      return res.json({ ok: true, users: out });
    } catch (err) {
      console.error('Admin getAllUsers error:', err.message);
      return res.status(500).json({ ok: false, message: err.message });
    }
  }

  async function getUploads(req, res) {
    try {
      if (!hasSupabaseConfig) return res.status(500).json({ ok: false, message: 'Supabase not configured' });
      const supabase = createSupabaseClient();
      const listResp = await supabase.storage.from(env.storageBucket).list('', { limit: 1000 });
      if (listResp.error) throw listResp.error;
      const files = listResp.data || [];
      const out = [];
      for (const f of files) {
        try {
          const { data: urlData } = supabase.storage.from(env.storageBucket).getPublicUrl(f.name);
          out.push({ name: f.name, size: f.size, updated_at: f.updated_at, publicUrl: urlData?.publicUrl || null });
        } catch (e) {
          out.push({ name: f.name, size: f.size, updated_at: f.updated_at, publicUrl: null });
        }
      }
      return res.json({ ok: true, uploads: out });
    } catch (err) {
      console.error('Admin getUploads error:', err.message);
      return res.status(500).json({ ok: false, message: err.message });
    }
  }

  return { getBookings, getCustomers, getAllUsers, getUploads };
}

module.exports = { getAdminHandlers };
