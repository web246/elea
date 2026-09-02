# Supabase Production Requirements for ELEA

This document defines the production-ready backend requirements for the ELEA website so the booking flow, uploaded customer images, admin visibility, and referral system work for real users.

This is not a mock or demo design. It is the backend architecture required for a live production site.

## 1. Business goals

The site must support:

- Customer booking form submission
- Optional image uploads from customers
- Saving customer contact and property details
- Admin review of every booking
- Email and WhatsApp notification to ELEA
- Real image storage and retrieval
- Referral code creation and redemption
- Reward validation after a completed paid booking
- Admin login and dashboard access

## 2. Core system components

### Authentication

Use Supabase Auth to secure the admin side.

Required auth setup:

- Email/password login for ELEA admin
- Optional second admin user for backup access
- Role-based access control
- Admin-only access to bookings, referrals, and stored files

Recommended admin roles:

- `admin`
- `super_admin`

### Database

Use Supabase Postgres for all business records.

### Storage

Use Supabase Storage for uploaded customer images.

Bucket requirements:

- `customer-uploads`
- Private bucket by default, with signed URLs only when admin needs to view them

### Server-side logic

Use Supabase Edge Functions or a server endpoint for:

- booking submission processing
- referral validation
- email/WhatsApp notifications
- image upload handling

## 3. Required database tables

### profiles

Purpose: store auth and user/profile metadata.

Fields:

- id (uuid, FK to auth.users)
- email
- full_name
- phone
- created_at
- updated_at
- role

### bookings

Purpose: store each booking inquiry and final status.

Fields:

- id (uuid, primary key)
- reference_code (text, unique)
- customer_name
- customer_email
- customer_phone
- country
- postcode
- street
- location
- address
- service_types (jsonb or text[])
- property_summary (jsonb)
- cleaning_type
- preferred_date
- preferred_time
- notes
- referral_code (nullable)
- referred_by (nullable, uuid or email)
- source_page
- status (enum: new, contacted, confirmed, paid, completed, cancelled, rejected)
- created_at
- updated_at
- admin_notes (text, nullable)
- assigned_admin (nullable uuid)

### booking_images

Purpose: track uploaded files linked to each booking.

Fields:

- id (uuid, primary key)
- booking_id (uuid, FK to bookings.id)
- storage_path
- file_name
- mime_type
- file_size
- uploaded_by
- created_at

### referral_codes

Purpose: store referral codes created by existing customers.

Fields:

- id (uuid, primary key)
- code (text, unique)
- created_by_user_id (uuid, nullable)
- created_by_email
- created_at
- expires_at (nullable)
- is_active
- reward_type
- reward_value
- status

### referral_claims

Purpose: track when a new customer uses a referral code.

Fields:

- id (uuid)
- referral_code_id
- referred_email
- referred_user_id (nullable)
- claimed_at
- booking_id (nullable)
- status (pending, validated, rejected)
- validated_at (nullable)

### referral_rewards

Purpose: track reward eligibility and redemption.

Fields:

- id (uuid)
- referrer_email
- referred_email
- booking_id
- amount_off_percent
- reward_status (pending, issued, redeemed, cancelled)
- created_at
- issued_at
- redeemed_at

### admin_activity

Purpose: record admin actions.

Optional but recommended.

Fields:

- id
- admin_id
- action
- booking_id (nullable)
- details (jsonb)
- created_at

## 4. Storage bucket requirements

### customer-uploads

Public or private:

- Prefer private storage for privacy and control
- Generate signed URLs for admin access only
- Keep customer uploads linked to booking records

Allowed file types:

- jpeg
- jpg
- png
- webp

Optional restrictions:

- max file size: 5 MB per file
- max files per booking: 5 to 10

## 5. Row Level Security (RLS) requirements

### Public access

Public users should only be able to:

- insert a booking request
- upload files to a booking-specific upload flow
- create a referral claim

No public users should be able to:

- read all bookings
- read all referrals
- access other customers’ uploaded files

### Admin access

Only authenticated admin users should be able to:

- read bookings
- read referral records
- read uploaded images
- update status
- add admin notes
- generate reward validation

RLS examples:

- `bookings`: admin can read/write; public can insert only
- `booking_images`: admin can read/write; public can insert only for their own booking
- `referral_codes`: admin can read/write; public can create or redeem only through validated API flow

## 6. Booking flow requirements

### Booking submission

When a user submits a booking form:

1. Validate required fields
2. Create a unique booking reference
3. Save booking data to `bookings`
4. Save uploaded file metadata to `booking_images`
5. Save file to storage bucket
6. Trigger email notification to ELEA
7. Trigger WhatsApp notification to ELEA
8. Return success response to frontend

### Required booking fields

- full name
- phone
- email
- country
- postcode
- street
- location
- address
- selected service types
- cleaning type / property summary
- preferred date
- preferred time
- notes
- optional uploaded files

### Booking status lifecycle

Recommended values:

- new
- contacted
- confirmed
- paid
- completed
- cancelled
- rejected

## 7. Referral system requirements

The referral system must be enforced server-side.

### Referral creation

When an existing customer creates a referral code:

- validate email
- generate unique code
- store in `referral_codes`
- set `is_active = true`
- associate with customer account if logged in

### Referral redemption

When a new customer enters a code:

- validate code exists and is active
- validate referred email is not already used for that code
- save `referral_claims`
- associate with booking if a booking is later created

### Reward validation

Reward should only be issued after:

- referred booking is created
- booking is marked paid or completed
- admin validates the booking

This must happen server-side; never client-only localStorage logic.

## 8. Notifications requirements

### Email notifications

Use a real email provider such as:

- Resend
- SendGrid
- Postmark

The system must send:

- booking confirmation to customer
- notification email to ELEA team
- referral validation updates to admin

### WhatsApp notifications

For real users, use a proper WhatsApp API provider such as:

- Twilio WhatsApp API
- Meta WhatsApp Business Cloud API

Requirements:

- send booking notification to ELEA
- include booking reference
- include customer name and phone
- include message summary
- optionally include signed image URLs if allowed

## 9. Admin requirements

The admin dashboard must support:

- login with Supabase Auth
- list bookings with filters
- search by email, phone, reference code
- see booking status
- view uploaded images from each booking
- update status
- add internal notes
- review referral claims
- approve or reject referral rewards
- export data if needed

## 10. Required environment variables

The frontend and backend will need the following keys.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SITE_URL=https://your-domain.com

TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=hello@elea.example.com

SUPABASE_STORAGE_BUCKET=customer-uploads
```

## 11. Security requirements

- Use service role only in server-side code, never in frontend code
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser clients
- Validate every client request on the server
- Use RLS to lock down database access
- Sanitize file uploads
- Store the image URL and metadata only after upload succeeds
- Validate referral codes server-side
- Use signed URLs for secure file access

## 12. Production acceptance criteria

The system is considered production-ready when all of the following are true:

- Customer booking requests are stored in the database
- Uploads are stored in Supabase Storage
- Admin can view bookings and uploaded images
- ELEA receives the booking via email and/or WhatsApp
- Referral codes are validated by backend logic
- Rewards are generated only after a verified completed booking
- Admin can update status and notes
- No client-only localStorage logic is used for critical business rules

## 13. Implementation priority

### Phase 1

- Supabase project setup
- Auth for admin
- bookings table
- booking_images table
- storage bucket
- booking submission API

### Phase 2

- referral tables
- reward validation workflow
- admin dashboard
- email + WhatsApp notifications

### Phase 3

- analytics and export
- search and filtering enhancements
- booking reminders and review requests

## 14. Notes for this project

The current site already has front-end booking and referral logic in [app.js](app.js#L835-L893) and [app.js](app.js#L2143-L2235), but that logic is not production-safe because it relies on browser-side storage and mailto/WhatsApp redirects rather than server-side persistence.

For real users, the backend must own:

- booking persistence
- file upload management
- referral validation
- reward issuance
- admin state
- notification delivery

## 15. Required next inputs from the client

To finalize the backend build, the following information is needed:

- final ELEA admin email addresses
- desired WhatsApp number for notifications
- preferred email provider
- whether referral reward is a percentage discount or fixed amount
- whether the booking form must allow multiple images
- whether the admin should be a separate panel or embedded into the website
- whether customers should be able to log in or only submit booking requests

Once these are confirmed, the backend can be implemented and connected to the current website without using mock data.
