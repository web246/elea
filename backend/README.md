# ELEA Backend

This backend is prepared for a real production-ready Supabase integration for ELEA.

## Available endpoints

- GET /health
- POST /api/bookings
- POST /api/referrals/create
- POST /api/referrals/redeem
- GET /api/referrals/validate/:code

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your real Supabase credentials
3. Fill in your email provider and WhatsApp provider credentials
4. Run:

```bash
npm install
npm run dev
```

## Notes

- The booking route accepts multipart form-data with uploaded images.
- The backend currently stores records in Supabase when credentials are configured.

Admin authentication
--------------------
This backend supports simple admin protection via environment variables. Set either `ADMIN_TOKEN` (bearer token) or `ADMIN_USER` and `ADMIN_PASS` (basic auth). The server will deny access to `/api/admin/*` endpoints unless admin credentials are configured. When running locally for testing, you can set these in your `.env` file.
- If Supabase is not configured yet, the app still boots but will return non-persistent behavior.
- This is intentionally built to be replaced by production SQL tables and real admin flows once credentials are provided.

Notes for local development
- The backend listens on the port configured in `.env` as `PORT`. If not set it will default to `4001` to avoid colliding with simple static front-end servers.
- The frontend admin UI is served from `elea.htm` in the project root and expects admin API routes at `http://localhost:4001/api/admin/*` by default.
- The booking form in the front-end posts to `http://localhost:4001/api/bookings` and any uploaded images are saved to the configured Supabase storage bucket and included in the booking notification emails/WhatsApp messages.
