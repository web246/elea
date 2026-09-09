-- Supabase SQL schema for ELEA
-- Run these statements in the Supabase SQL editor (replace or adjust as needed).

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Customers table (lightweight CRM)
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  membership text,
  created_at timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique,
  customer_id uuid references customers(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_types text[],
  preferred_date date,
  preferred_time text,
  notes text,
  booking_details jsonb default '{}'::jsonb,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Booking images stored metadata (files stored in Storage bucket)
create table if not exists booking_images (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  storage_path text,
  public_url text,
  uploaded_at timestamptz default now()
);

-- Reviews / testimonials
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  rating int check (rating >= 1 and rating <= 5),
  title text,
  body text,
  approved boolean default false,
  created_at timestamptz default now()
);

-- Site assets (images, icons managed from admin UI)
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  name text,
  path text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_bookings_created_at on bookings (created_at desc);
alter table bookings add column if not exists booking_details jsonb default '{}'::jsonb;
create index if not exists idx_reviews_created_at on reviews (created_at desc);

-- OPTIONAL: basic policies example
-- NOTE: Review policies for your security model. The following are simple examples.

-- Enable row level security where desirable
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_insert_bookings" ON bookings FOR INSERT USING (true);
-- CREATE POLICY "service_role_select" ON bookings FOR SELECT USING (auth.role() = 'service_role');

-- Create a profiles table for admins mapped to auth.users (recommended)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Grant some minimal privileges to anon (public web) role — adjust as needed
-- grant select on bookings to anon; -- not recommended unless you want public listing

-- Storage: create a bucket named 'customer-uploads' (matching your env)
-- In Supabase UI: Storage -> New bucket -> name: customer-uploads -> public: as needed

-- After creating the bucket, you can upload files from the browser using the Storage API

-- END
