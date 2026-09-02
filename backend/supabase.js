const { createClient } = require('@supabase/supabase-js');
const { env, hasSupabaseConfig } = require('./config');

function createSupabaseClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

module.exports = { createSupabaseClient };
