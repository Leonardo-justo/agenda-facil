create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text not null,
  address text not null,
  open_time time not null,
  close_time time not null,
  plan_price numeric(10, 2) not null default 79,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  duration integer not null,
  price numeric(10, 2) not null,
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
  status text not null default 'scheduled',
  source text not null default 'public',
  created_at timestamptz not null default now()
);
