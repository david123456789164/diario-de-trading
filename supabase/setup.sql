create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  preferred_currency text not null default 'USD',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_currency_length check (char_length(preferred_currency) = 3)
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ticker text not null,
  asset_type text not null,
  direction text not null,
  setup text not null,
  entry_date date not null,
  exit_date date,
  entry_price numeric(14, 4) not null,
  exit_price numeric(14, 4),
  initial_stop_loss numeric(14, 4),
  initial_take_profit numeric(14, 4),
  quantity numeric(14, 4) not null,
  fees numeric(14, 4) not null default 0,
  account_size numeric(14, 2),
  planned_risk_amount numeric(14, 2),
  thesis text,
  notes text,
  mistakes text,
  lesson_learned text,
  status text not null,
  tags text[] not null default '{}',
  screenshot_path text,
  screenshot_file_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trades_ticker_required check (char_length(trim(ticker)) between 1 and 20),
  constraint trades_asset_type_valid check (asset_type in ('stock', 'etf')),
  constraint trades_direction_valid check (direction in ('long', 'short')),
  constraint trades_setup_required check (char_length(trim(setup)) between 1 and 120),
  constraint trades_status_valid check (status in ('open', 'closed', 'cancelled', 'invalidated')),
  constraint trades_entry_price_positive check (entry_price > 0),
  constraint trades_quantity_positive check (quantity > 0),
  constraint trades_fees_non_negative check (fees >= 0),
  constraint trades_account_size_positive check (account_size is null or account_size > 0),
  constraint trades_planned_risk_positive check (planned_risk_amount is null or planned_risk_amount > 0),
  constraint trades_closed_requires_exit check (
    (status = 'closed' and exit_date is not null and exit_price is not null)
    or status <> 'closed'
  ),
  constraint trades_exit_fields_together check (
    (exit_date is null and exit_price is null)
    or (exit_date is not null and exit_price is not null)
  ),
  constraint trades_exit_not_before_entry check (
    exit_date is null or exit_date >= entry_date
  ),
  constraint trades_stop_not_equal_entry check (
    initial_stop_loss is null or initial_stop_loss <> entry_price
  ),
  constraint trades_take_profit_not_equal_entry check (
    initial_take_profit is null or initial_take_profit <> entry_price
  ),
  constraint trades_long_levels_valid check (
    direction <> 'long'
    or (
      (initial_stop_loss is null or initial_stop_loss < entry_price)
      and (initial_take_profit is null or initial_take_profit > entry_price)
    )
  ),
  constraint trades_short_levels_valid check (
    direction <> 'short'
    or (
      (initial_stop_loss is null or initial_stop_loss > entry_price)
      and (initial_take_profit is null or initial_take_profit < entry_price)
    )
  )
);

create index if not exists trades_user_id_idx on public.trades (user_id);
create index if not exists trades_user_entry_date_idx on public.trades (user_id, entry_date desc);
create index if not exists trades_user_status_idx on public.trades (user_id, status);
create index if not exists trades_user_ticker_idx on public.trades (user_id, ticker);
create index if not exists trades_user_setup_idx on public.trades (user_id, setup);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trades_set_updated_at on public.trades;
create trigger trades_set_updated_at
before update on public.trades
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.trades enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
on public.trades
for select
using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
on public.trades
for insert
with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
on public.trades
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
on public.trades
for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trade-screenshots',
  'trade-screenshots',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "trade_screenshots_select_own" on storage.objects;
create policy "trade_screenshots_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trade_screenshots_insert_own" on storage.objects;
create policy "trade_screenshots_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trade_screenshots_update_own" on storage.objects;
create policy "trade_screenshots_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'trade-screenshots'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trade_screenshots_delete_own" on storage.objects;
create policy "trade_screenshots_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create or replace function public.seed_demo_trades()
returns integer
language plpgsql
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  inserted_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'Debes iniciar sesión para cargar los datos demo.';
  end if;

  insert into public.trades (
    user_id,
    ticker,
    asset_type,
    direction,
    setup,
    entry_date,
    exit_date,
    entry_price,
    exit_price,
    initial_stop_loss,
    initial_take_profit,
    quantity,
    fees,
    account_size,
    planned_risk_amount,
    thesis,
    notes,
    mistakes,
    lesson_learned,
    status,
    tags
  )
  values
    (
      current_user_id,
      'AAPL',
      'stock',
      'long',
      'Pullback EMA 21',
      current_date - 110,
      current_date - 103,
      187.45,
      197.10,
      182.90,
      199.50,
      80,
      4.20,
      25000,
      364,
      'Pullback limpio en tendencia alcista con soporte dinámico.',
      'Se respetó el plan y la salida fue escalonada.',
      null,
      'La paciencia en la zona de entrada mejoró el R.',
      'closed',
      array['trend', 'tech']
    ),
    (
      current_user_id,
      'QQQ',
      'etf',
      'long',
      'Breakout con volumen',
      current_date - 95,
      current_date - 91,
      438.20,
      432.00,
      431.80,
      449.50,
      40,
      3.00,
      25000,
      256,
      'Ruptura inicial, pero el mercado perdió momentum.',
      'La salida se hizo por pérdida de nivel clave.',
      'Entrada un poco adelantada.',
      'Esperar confirmación del cierre diario reduce falsas rupturas.',
      'closed',
      array['breakout', 'etf']
    ),
    (
      current_user_id,
      'MSFT',
      'stock',
      'short',
      'Fade post-earnings',
      current_date - 72,
      current_date - 68,
      421.50,
      404.30,
      428.00,
      405.00,
      30,
      2.80,
      25000,
      195,
      'Gap de earnings agotado con rechazo en resistencia semanal.',
      'Buen trade, pero podría haberse dejado correr un poco más.',
      null,
      'El contexto macro ayudó a favor del short.',
      'closed',
      array['earnings', 'short']
    ),
    (
      current_user_id,
      'NVDA',
      'stock',
      'long',
      'Continuation',
      current_date - 43,
      current_date - 37,
      913.40,
      956.00,
      887.00,
      975.00,
      18,
      3.60,
      25000,
      475.2,
      'Consolidación estrecha dentro de una tendencia dominante.',
      'Se tomó parcial en resistencia y el resto al cierre.',
      null,
      'El manejo parcial mejoró la estabilidad del equity.',
      'closed',
      array['momentum', 'continuation']
    ),
    (
      current_user_id,
      'META',
      'stock',
      'long',
      'Base breakout',
      current_date - 18,
      null,
      486.10,
      null,
      471.50,
      515.00,
      25,
      2.50,
      25000,
      365,
      'Salida de base con mercado acompañando.',
      'Trade todavía abierto. Se mantiene stop original.',
      null,
      null,
      'open',
      array['open', 'momentum']
    ),
    (
      current_user_id,
      'IWM',
      'etf',
      'short',
      'Failed breakout',
      current_date - 14,
      current_date - 11,
      209.60,
      205.10,
      212.40,
      203.00,
      55,
      2.90,
      25000,
      154,
      'Fallo de ruptura en small caps con breadth débil.',
      'Se cerró cerca del objetivo inicial.',
      'La posición pudo haber sido más grande.',
      'Buena lectura del contexto relativo frente al SPY.',
      'closed',
      array['reversal', 'etf']
    );

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

grant execute on function public.seed_demo_trades() to authenticated;

