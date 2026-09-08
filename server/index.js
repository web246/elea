require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be set in env
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ''; // simple header-based auth for the proxy

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function requireAdminKey(req, res, next) {
  const key = req.header('x-admin-key') || req.query.admin_key;
  if (!ADMIN_API_KEY) {
    // if no key configured, allow only from localhost
    const host = req.hostname || req.ip || '';
    if (host !== 'localhost' && host !== '127.0.0.1' && req.ip !== '::1') {
      return res.status(403).json({ ok: false, error: 'Admin key required' });
    }
    return next();
  }
  if (key !== ADMIN_API_KEY) return res.status(403).json({ ok: false, error: 'Bad admin key' });
  return next();
}

app.get('/api/admin/bookings', requireAdminKey, async (req, res) => {
  try {
    const { data, error } = await sb.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ ok: true, bookings: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.get('/api/admin/customers', requireAdminKey, async (req, res) => {
  try {
    const { data, error } = await sb.from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ ok: true, customers: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.get('/api/admin/reviews', requireAdminKey, async (req, res) => {
  try {
    const { data, error } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ ok: true, reviews: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.post('/api/admin/reviews/:id/approve', requireAdminKey, async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await sb.from('reviews').update({ status: 'approved', approved: true }).eq('id', id).select();
    if (error) throw error;
    res.json({ ok: true, review: data && data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.delete('/api/admin/reviews/:id', requireAdminKey, async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = await sb.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.post('/api/admin/bookings/:id/confirm', requireAdminKey, async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await sb.from('bookings').update({ status: 'confirmed' }).eq('id', id).select();
    if (error) throw error;
    res.json({ ok: true, booking: data && data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.delete('/api/admin/bookings/:id', requireAdminKey, async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = await sb.from('bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Admin proxy listening on http://localhost:${PORT}`));
