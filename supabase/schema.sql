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
  plan_id text not null references plans(id),
  plan_price numeric(10, 2) not null default 0,
  payment_provider text not null default 'mercado_pago',
  subscription_status text not null default 'trial',
  trial_ends_at timestamptz,
  lgpd_accepted_at timestamptz,
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
