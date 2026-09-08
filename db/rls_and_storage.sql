-- RLS and Storage policy examples for ELEA
-- Adjust field names and table names to match your schema. Review carefully before applying.

-- 1) Admins table to mark users as admin
create table if not exists admins (
  user_id uuid primary key references auth.users(id),
  created_at timestamptz default now()
);

-- 2) Enable RLS on bookings, customers, reviews tables
alter table if exists bookings enable row level security;
alter table if exists customers enable row level security;
alter table if exists reviews enable row level security;

-- Helper to get JWT claims: current_setting('request.jwt.claims', true) returns JSON text
-- Owner check example (by email in customer_email)

-- Bookings: allow owners (by email), admins, or service_role to select/modify
create policy "Bookings: owner or admin or service_role" on bookings
  for all
  using (
    (
      -- owner by email
      (current_setting('request.jwt.claims', true)::json ->> 'email') is not null
      and (bookings.customer_email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
    )
    or exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    or (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
  )
  with check (
    -- ensure inserts/updates set the customer_email to the current user email unless service_role or admin
    (
      (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
    ) or (
      exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    ) or (
      bookings.customer_email = (current_setting('request.jwt.claims', true)::json ->> 'email')
    )
  );

-- Customers: allow customers to see their own row and allow admins/service_role to see all
create policy "Customers: owner or admin" on customers
  for all
  using (
    (current_setting('request.jwt.claims', true)::json ->> 'email') is not null and (customers.customer_email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
    or exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    or (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
  )
  with check (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
    or exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    or customers.customer_email = (current_setting('request.jwt.claims', true)::json ->> 'email')
  );

-- Reviews: similar pattern
create policy "Reviews: owner or admin" on reviews
  for all
  using (
    (current_setting('request.jwt.claims', true)::json ->> 'email') is not null and (reviews.email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
    or exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    or (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
  )
  with check (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
    or exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    or reviews.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
  );

-- 3) Storage bucket: example to create a private bucket for customer uploads
-- Note: Supabase storage is managed via UI or CLI. This example shows how to create policies for storage.objects

-- You may use bucket-level settings to make a bucket public/private. For private buckets, add policies below.

-- Allow authenticated users to insert objects
create policy "storage: allow insert for authenticated" on storage.objects
  for insert
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Allow select (read) for admins, service_role, or owner by metadata->>'user_id'
create policy "storage: select owner or admin" on storage.objects
  for select
  using (
    (current_setting('request.jwt.claims', true)::json ->> 'sub') is not null and (storage.objects.metadata ->> 'user_id') = (current_setting('request.jwt.claims', true)::json ->> 'sub')
    or exists (select 1 from admins where admins.user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid)
    or (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
  );

-- Notes:
-- - `admins` table lets you centralize admin user IDs. Add an admin via: insert into admins(user_id) values('<auth_user_id>');
-- - The SQL uses `request.jwt.claims` to access JWT claims. This is Supabase's recommended approach.
-- - Adjust column names (customer_email, email, bookings.customer_email, reviews.email) to match your schema.
-- - For storage, it's useful to store the uploading user's id in object metadata (e.g., metadata->'user_id').
