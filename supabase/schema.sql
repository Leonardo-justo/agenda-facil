create extension if not exists pgcrypto;

create table if not exists plans (
  id text primary key,
  name text not null,
  price numeric(10, 2) not null,
  months integer not null default 0,
  appointment_limit integer,
  staff_limit integer,
  highlighted boolean not null default false,
  description text not null
);

insert into plans (id, name, price, months, appointment_limit, staff_limit, highlighted, description)
values
  ('free', 'Gratuito', 0, 0, 30, 1, false, 'Teste com limite mensal.'),
  ('monthly', '1 mes', 79, 1, null, null, false, 'Plano mensal.'),
  ('quarterly', '3 meses', 199, 3, null, null, false, 'Plano trimestral.'),
  ('annual', '12 meses', 599, 12, null, null, true, 'Plano anual com desconto.')
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  months = excluded.months,
  appointment_limit = excluded.appointment_limit,
  staff_limit = excluded.staff_limit,
  highlighted = excluded.highlighted,
  description = excluded.description;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'store_owner' check (role in ('platform_admin', 'store_owner', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  owner_name text not null,
  owner_email text not null,
  document text,
  phone text not null,
  address text not null,
  category text not null,
  open_time time not null,
  close_time time not null,
  schedule jsonb not null default '{}'::jsonb,
  confirmation_mode text not null default 'manual' check (confirmation_mode in ('manual', 'automatic')),
  plan_id text not null references plans(id),
  plan_price numeric(10, 2) not null default 0,
  payment_provider text not null default 'mercado_pago' check (payment_provider in ('mercado_pago', 'infinite_pay', 'stripe')),
  subscription_status text not null default 'trial' check (subscription_status in ('trial', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz,
  lgpd_accepted_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  duration integer not null check (duration > 0),
  price numeric(10, 2) not null check (price >= 0),
  active boolean not null default true
);

create table if not exists staff_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  role text not null,
  active boolean not null default true
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  service_id uuid not null references services(id),
  staff_id uuid not null references staff_members(id),
  client text not null,
  phone text not null,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'done', 'canceled')),
  source text not null default 'public' check (source in ('owner', 'public')),
  created_at timestamptz not null default now(),
  unique (staff_id, appointment_date, appointment_time)
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  provider text not null,
  provider_reference text,
  amount numeric(10, 2) not null,
  status text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists consent_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  consent_type text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text
);

create index if not exists businesses_slug_idx on businesses(slug);
create index if not exists business_members_user_idx on business_members(user_id);
create index if not exists services_business_idx on services(business_id);
create index if not exists staff_members_business_idx on staff_members(business_id);
create index if not exists appointments_business_date_idx on appointments(business_id, appointment_date);
create index if not exists payment_events_business_idx on payment_events(business_id);

create or replace function is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'platform_admin'
  );
$$;

create or replace function is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from business_members
    where business_members.business_id = target_business_id
      and business_members.user_id = auth.uid()
  );
$$;

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_members enable row level security;
alter table services enable row level security;
alter table staff_members enable row level security;
alter table appointments enable row level security;
alter table payment_events enable row level security;
alter table consent_events enable row level security;

drop policy if exists profiles_select_own_or_admin on profiles;
create policy profiles_select_own_or_admin on profiles
for select using (id = auth.uid() or is_platform_admin());

drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists businesses_select_member_or_public_active on businesses;
create policy businesses_select_member_or_public_active on businesses
for select using (active = true or is_business_member(id) or is_platform_admin());

drop policy if exists businesses_insert_authenticated on businesses;
create policy businesses_insert_authenticated on businesses
for insert with check (auth.uid() is not null);

drop policy if exists businesses_update_member_or_admin on businesses;
create policy businesses_update_member_or_admin on businesses
for update using (is_business_member(id) or is_platform_admin())
with check (is_business_member(id) or is_platform_admin());

drop policy if exists business_members_select_related_or_admin on business_members;
create policy business_members_select_related_or_admin on business_members
for select using (user_id = auth.uid() or is_business_member(business_id) or is_platform_admin());

drop policy if exists business_members_insert_self_or_admin on business_members;
create policy business_members_insert_self_or_admin on business_members
for insert with check (auth.uid() is not null and (user_id = auth.uid() or is_platform_admin()));

drop policy if exists services_select_member_or_public_active on services;
create policy services_select_member_or_public_active on services
for select using (active = true or is_business_member(business_id) or is_platform_admin());

drop policy if exists services_write_member_or_admin on services;
create policy services_write_member_or_admin on services
for all using (is_business_member(business_id) or is_platform_admin())
with check (is_business_member(business_id) or is_platform_admin());

drop policy if exists staff_select_member_or_public_active on staff_members;
create policy staff_select_member_or_public_active on staff_members
for select using (active = true or is_business_member(business_id) or is_platform_admin());

drop policy if exists staff_write_member_or_admin on staff_members;
create policy staff_write_member_or_admin on staff_members
for all using (is_business_member(business_id) or is_platform_admin())
with check (is_business_member(business_id) or is_platform_admin());

drop policy if exists appointments_select_member_or_admin on appointments;
create policy appointments_select_member_or_admin on appointments
for select using (is_business_member(business_id) or is_platform_admin());

drop policy if exists appointments_insert_public_active_business on appointments;
create policy appointments_insert_public_active_business on appointments
for insert with check (
  exists (
    select 1
    from businesses
    where businesses.id = appointments.business_id
      and businesses.active = true
  )
);

drop policy if exists appointments_update_member_or_admin on appointments;
create policy appointments_update_member_or_admin on appointments
for update using (is_business_member(business_id) or is_platform_admin())
with check (is_business_member(business_id) or is_platform_admin());

drop policy if exists payment_events_select_member_or_admin on payment_events;
create policy payment_events_select_member_or_admin on payment_events
for select using (is_business_member(business_id) or is_platform_admin());

drop policy if exists payment_events_insert_authenticated on payment_events;
create policy payment_events_insert_authenticated on payment_events
for insert with check (auth.uid() is not null);

drop policy if exists consent_events_select_member_or_admin on consent_events;
create policy consent_events_select_member_or_admin on consent_events
for select using (
  is_platform_admin()
  or user_id = auth.uid()
  or (business_id is not null and is_business_member(business_id))
);

drop policy if exists consent_events_insert_any on consent_events;
create policy consent_events_insert_any on consent_events
for insert with check (true);
