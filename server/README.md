Admin proxy (Node)
------------------

This small Express proxy exposes admin endpoints that run with the Supabase `service_role` key. Keep the `service_role` key secret and run this server in a secure environment.

Setup

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies and run:

```bash
cd server
npm install
npm start
```

Endpoints (require header `x-admin-key: <ADMIN_API_KEY>` unless running from localhost with no key configured):

- `GET /api/admin/bookings`
- `GET /api/admin/customers`
- `GET /api/admin/reviews`
- `POST /api/admin/reviews/:id/approve`
- `DELETE /api/admin/reviews/:id`
- `POST /api/admin/bookings/:id/confirm`
- `DELETE /api/admin/bookings/:id`

Use these from the admin UI. The frontend in this repo already attempts to call `/api/admin/*` endpoints via the `defaults.bookingEndpoint` base.
