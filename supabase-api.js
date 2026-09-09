// Supabase helper for ELEA (browser-only)
(function () {
  const SUPABASE_URL = 'https://ttwokdovnpdvflicmyml.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0d29rZG92bnBkdmZsaWNteW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDM3MzEsImV4cCI6MjEwMzkxOTczMX0.sHe4AiCSEU2O7y6bYeCPemPramNVJhNB9om2AXBYmME';
  const STORAGE_BUCKET = 'customer-uploads';

  function client() {
    if (!window.supabase || !window.supabase.createClient) {
      console.warn('Supabase library not available');
      return null;
    }
    if (!window._elea_supabase_client) {
      window._elea_supabase_client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    }
    return window._elea_supabase_client;
  }

  async function signUp(email, password, metadata) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    return sb.auth.signUp({ email, password, options: { data: metadata || {} } });
  }

  async function signIn(email, password) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    return sb.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    return sb.auth.signOut();
  }

  async function createCustomer(payload) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    // Upsert by customer_email to avoid duplicates. Ensure customers.customer_email has a UNIQUE constraint.
    try {
      return sb.from('customers').upsert([payload], { onConflict: 'customer_email' });
    } catch (err) {
      return sb.from('customers').insert([payload]);
    }
  }

  async function createBooking(booking) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    const images = Array.isArray(booking.booking_images) ? booking.booking_images : [];
    const payload = { ...booking };
    delete payload.booking_images;
    const result = await sb.from('bookings').insert([payload]).select().single();
    if (result.error || !images.length || !result.data?.id) return result;
    const imageResult = await sb.from('booking_images').insert(images.map((image) => ({
      booking_id: result.data.id,
      storage_path: image.storage_path || '',
      public_url: image.public_url || image.url || ''
    })));
    return imageResult.error ? { data: result.data, error: imageResult.error } : result;
  }

  async function listBookings(opts = {}) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    let q = sb.from('bookings').select('*, booking_images(*)');
    if (opts.order) q = q.order(opts.order.column || 'created_at', { ascending: !!opts.ascending });
    return q;
  }

  async function uploadFile(path, file, opts = {}) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    const bucket = opts.bucket || STORAGE_BUCKET;
    const key = `${path}`;
    const res = await sb.storage.from(bucket).upload(key, file, { cacheControl: '3600', upsert: true });
    if (res.error) return res;
    const publicRes = sb.storage.from(bucket).getPublicUrl(key);
    return { data: publicRes.data, error: null };
  }

  async function getPublicUrl(path, opts = {}) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    const bucket = opts.bucket || STORAGE_BUCKET;
    return sb.storage.from(bucket).getPublicUrl(path);
  }

  async function createReview(review) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    return sb.from('reviews').insert([review]);
  }

  async function listReviews(approvedOnly = true) {
    const sb = client(); if (!sb) throw new Error('supabase not available');
    let q = sb.from('reviews').select('*');
    if (approvedOnly) q = q.eq('approved', true);
    return q.order('created_at', { ascending: false });
  }

  window.eleaSupabase = {
    client,
    signUp,
    signIn,
    signOut,
    createCustomer,
    createBooking,
    listBookings,
    uploadFile,
    getPublicUrl,
    createReview,
    listReviews,
    STORAGE_BUCKET
  };
})();
