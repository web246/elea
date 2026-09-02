require('dotenv').config();

const env = {
  port: Number(process.env.PORT || 4000),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  siteUrl: process.env.SITE_URL || 'http://localhost:8000',
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'customer-uploads',
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'hello@elea.example.com',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,
  adminToken: process.env.ADMIN_TOKEN,
};

const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

module.exports = { env, hasSupabaseConfig };
