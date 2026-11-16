-- Username rules: 3-30 characters, only letters, digits, "_" and "-",
-- unique regardless of upper/lower case.
--
-- The app checks this too (and gives friendly messages), but the database
-- is the final guard so the rules cannot be bypassed.

-- 1) Format: only enforced for new/changed rows (NOT VALID), so any
--    existing row that does not follow the rule cannot break this migration.
alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[A-Za-z0-9_-]{3,30}$') not valid;

-- 2) Unique ignoring case. A unique index cannot be "not valid", so if two
--    existing usernames only differ by case, stop with a clear message
--    instead of silently skipping the rule.
do $$
begin
  if exists (
    select 1 from public.profiles
    group by lower(username)
    having count(*) > 1
  ) then
    raise exception
      'Cannot add unique username index: existing usernames collide when case is ignored. Rename them first (see docs/SUPABASE-INSTALLNING.md).';
  end if;
end
$$;

create unique index profiles_username_lower_key
  on public.profiles (lower(username));

-- 3) New users: no more fallback to the part of the email before "@"
--    (that could produce an invalid name). The username must come from
--    sign-up and must follow the rules, otherwise sign-up is stopped.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _username text := new.raw_user_meta_data ->> 'username';
begin
  if _username is null or _username !~ '^[A-Za-z0-9_-]{3,30}$' then
    raise exception 'invalid_username';
  end if;

  insert into public.profiles (id, username, email)
  values (new.id, _username, new.email);
  return new;
end;
$$;

-- 4) Lets the app ask "is this username free?" before sign-up. New users
--    are not signed in yet and guests cannot read profiles_public, so this
--    narrow function (answers only true/false) is the only way to check.
create or replace function public.is_username_available(_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    _username ~ '^[A-Za-z0-9_-]{3,30}$'
    and not exists (
      select 1 from public.profiles p
      where lower(p.username) = lower(_username)
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
