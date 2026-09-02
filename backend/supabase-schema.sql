-- ELEA Supabase schema
-- Create extension if needed
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  country text,
  postcode text,
  street text,
  location text,
  address text,
  service_types jsonb default '[]'::jsonb,
  property_summary jsonb default '{}'::jsonb,
  cleaning_type text,
  preferred_date text,
  preferred_time text,
  notes text,
  referral_code text,
  referred_by text,
  source_page text default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  admin_notes text,
  assigned_admin uuid
);

create table if not exists public.booking_images (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  file_size integer default 0,
  uploaded_by text default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_by_user_id uuid,
  created_by_email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  reward_type text not null default 'percentage',
  reward_value numeric not null default 50,
  status text not null default 'active'
);

create table if not exists public.referral_claims (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.referral_codes(id) on delete cascade,
  referred_email text not null,
  referred_user_id uuid,
  claimed_at timestamptz not null default now(),
  booking_id uuid,
  status text not null default 'pending',
  validated_at timestamptz
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_email text not null,
  referred_email text not null,
  booking_id uuid,
  amount_off_percent numeric default 50,
  reward_status text not null default 'pending',
  created_at timestamptz not null default now(),
  issued_at timestamptz,
  redeemed_at timestamptz
);

create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  action text not null,
  booking_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_images enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_claims enable row level security;
alter table public.referral_rewards enable row level security;
alter table public.admin_activity enable row level security;

create policy "Public can insert bookings" on public.bookings
for insert with check (true);

create policy "Admins can read all bookings" on public.bookings
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
);

create policy "Public can insert booking images metadata" on public.booking_images
for insert with check (true);

create policy "Admins can read booking images" on public.booking_images
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
);

create policy "Public can create referral claims" on public.referral_claims
for insert with check (true);

create policy "Public can create referral codes via backend" on public.referral_codes
for insert with check (true);

create policy "Admins can read referral tables" on public.referral_codes
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
);

create policy "Admins can read referral claims" on public.referral_claims
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
);

create policy "Admins can read referral rewards" on public.referral_rewards
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
);

create policy "Admins can manage admin activity" on public.admin_activity
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
);

-- Storage bucket setup (run in Supabase dashboard or SQL editor):
-- create bucket if not exists customer-uploads with public = false;
-- alter storage.objects owner to postgres; -- optional if needed in your project

-- Example row-level security for storage bucket:
-- create policy "Public upload for customer files" on storage.objects
-- for insert with check (bucket_id = 'customer-uploads');
-- create policy "Admins can view all files" on storage.objects
-- for select using (bucket_id = 'customer-uploads' and auth.role() = 'authenticated');
