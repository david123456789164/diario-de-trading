create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists approved boolean not null default false,
  add column if not exists approved_at timestamptz;

create table if not exists public.pending_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_encrypted text,
  password_nonce text,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pending_signups_name_required'
  ) then
    alter table public.pending_signups
      add constraint pending_signups_name_required
      check (char_length(trim(name)) between 1 and 120);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pending_signups_email_normalized'
  ) then
    alter table public.pending_signups
      add constraint pending_signups_email_normalized
      check (email = lower(trim(email)));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pending_signups_status_valid'
  ) then
    alter table public.pending_signups
      add constraint pending_signups_status_valid
      check (status in ('pending', 'approved', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pending_signups_pending_requires_password'
  ) then
    alter table public.pending_signups
      add constraint pending_signups_pending_requires_password
      check (
        status <> 'pending'
        or (password_encrypted is not null and password_nonce is not null)
      );
  end if;
end;
$$;

create index if not exists pending_signups_status_created_at_idx
on public.pending_signups (status, created_at);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.pending_signups enable row level security;
alter table public.trades enable row level security;

create or replace function public.is_current_user_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select approved
    from public.profiles
    where id = auth.uid()
  ), false);
$$;

grant execute on function public.is_current_user_approved() to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id and approved = false);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id and public.is_current_user_approved())
with check (auth.uid() = id and public.is_current_user_approved());

revoke update on public.profiles from authenticated;
grant update (full_name, preferred_currency) on public.profiles to authenticated;

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
on public.trades
for select
using (auth.uid() = user_id and public.is_current_user_approved());

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
on public.trades
for insert
with check (auth.uid() = user_id and public.is_current_user_approved());

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
on public.trades
for update
using (auth.uid() = user_id and public.is_current_user_approved())
with check (auth.uid() = user_id and public.is_current_user_approved());

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
on public.trades
for delete
using (auth.uid() = user_id and public.is_current_user_approved());

drop policy if exists "trade_screenshots_select_own" on storage.objects;
create policy "trade_screenshots_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and public.is_current_user_approved()
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trade_screenshots_insert_own" on storage.objects;
create policy "trade_screenshots_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and public.is_current_user_approved()
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trade_screenshots_update_own" on storage.objects;
create policy "trade_screenshots_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and public.is_current_user_approved()
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'trade-screenshots'
  and public.is_current_user_approved()
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "trade_screenshots_delete_own" on storage.objects;
create policy "trade_screenshots_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and public.is_current_user_approved()
  and auth.uid()::text = (storage.foldername(name))[1]
);
