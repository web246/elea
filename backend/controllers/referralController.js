const { createSupabaseClient } = require('../supabase');
const { hasSupabaseConfig } = require('../config');
const { normalizeEmail, sanitizeString } = require('../utils/helpers');

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'REF-';
  for (let i = 0; i < 5; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createReferralHandlers() {
  return {
    async createReferral(req, res) {
      try {
        const email = normalizeEmail(req.body?.email || req.body?.referrerEmail || '');
        if (!email || !email.includes('@')) {
          return res.status(400).json({ ok: false, message: 'Valid referrer email required.' });
        }

        const code = generateReferralCode();

        if (hasSupabaseConfig) {
          const supabase = createSupabaseClient();
          if (supabase) {
            const { error } = await supabase.from('referral_codes').insert([
              {
                code,
                created_by_email: email,
                is_active: true,
                reward_type: 'percentage',
                reward_value: 50,
                status: 'active',
                created_at: new Date().toISOString(),
              },
            ]);

            if (error) {
              throw new Error(`Referral creation failed: ${error.message}`);
            }
          }
        }

        return res.status(200).json({ ok: true, code });
      } catch (error) {
        console.error('Create referral failed:', error);
        return res.status(500).json({ ok: false, message: 'Referral creation failed.', error: error.message });
      }
    },

    async redeemReferral(req, res) {
      try {
        const code = sanitizeString(req.body?.code || req.body?.referralCode || '').toUpperCase();
        const email = normalizeEmail(req.body?.email || req.body?.referredEmail || '');

        if (!code || !email || !email.includes('@')) {
          return res.status(400).json({ ok: false, message: 'Valid referral code and email required.' });
        }

        if (hasSupabaseConfig) {
          const supabase = createSupabaseClient();
          if (supabase) {
            const { data: referralData, error: referralError } = await supabase
              .from('referral_codes')
              .select('*')
              .eq('code', code)
              .single();

            if (referralError || !referralData) {
              return res.status(404).json({ ok: false, message: 'Referral code not found.' });
            }

            if (!referralData.is_active) {
              return res.status(400).json({ ok: false, message: 'Referral code is inactive.' });
            }

            const { error: claimError } = await supabase.from('referral_claims').insert([
              {
                referral_code_id: referralData.id,
                referred_email: email,
                claimed_at: new Date().toISOString(),
                status: 'pending',
              },
            ]);

            if (claimError) {
              throw new Error(`Referral claim failed: ${claimError.message}`);
            }
          }
        }

        return res.status(200).json({ ok: true, message: 'Referral saved successfully. Discount validates after booking completion.' });
      } catch (error) {
        console.error('Redeem referral failed:', error);
        return res.status(500).json({ ok: false, message: 'Referral redemption failed.', error: error.message });
      }
    },

    async validateReferral(req, res) {
      try {
        const code = sanitizeString(req.params?.code || '').toUpperCase();
        if (!code) {
          return res.status(400).json({ ok: false, valid: false, message: 'Referral code missing.' });
        }

        if (!hasSupabaseConfig) {
          return res.status(200).json({ ok: true, valid: true, message: 'Backend config not active yet; validation pending.' });
        }

        const supabase = createSupabaseClient();
        if (!supabase) {
          return res.status(200).json({ ok: true, valid: true, message: 'Backend config not active yet; validation pending.' });
        }

        const { data, error } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('code', code)
          .single();

        if (error || !data) {
          return res.status(200).json({ ok: true, valid: false, message: 'Referral code not found.' });
        }

        return res.status(200).json({
          ok: true,
          valid: Boolean(data.is_active),
          rewardValue: data.reward_value || 50,
          status: data.status || 'active',
        });
      } catch (error) {
        console.error('Validate referral failed:', error);
        return res.status(500).json({ ok: false, valid: false, message: 'Referral validation failed.', error: error.message });
      }
    },
  };
}

module.exports = { createReferralHandlers, generateReferralCode };
