-- =====================================================================
-- TIPIT baseline schema
--
-- This replaces the original 14 incremental migrations. The database
-- behind this project is empty (fresh Supabase project), so instead of
-- replaying the full history — including a couple of intermediate
-- policy mistakes that were fixed in later migrations — this migration
-- creates the final, correct state directly. It also:
--   - adds explicit GRANT statements for every table/view/function the
--     app uses (this project does not auto-expose new tables to the
--     anon/authenticated roles, so without these grants RLS policies
--     alone are not enough)
--   - drops two functions from the old history that ended up unused by
--     the app (is_own_profile, get_email_by_username — see notes below)
--   - fixes two RLS gaps found while consolidating (see notes below)
-- =====================================================================

-- =====================================================================
-- Extensions
-- =====================================================================
create extension if not exists pgcrypto;

-- =====================================================================
-- Enums
-- =====================================================================
create type public.tip_category as enum ('general', 'food', 'attractions', 'activities', 'accommodation', 'other');
create type public.app_role as enum ('admin', 'moderator', 'user');

-- =====================================================================
-- Tables
-- =====================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  privacy_setting text not null default 'friends_only' check (privacy_setting in ('friends_only', 'public')),
  avatar_url text,
  country_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  latitude double precision,
  longitude double precision
);

alter table public.profiles
  add constraint profiles_country_id_fkey foreign key (country_id) references public.countries(id);

create index idx_profiles_country_id on public.profiles(country_id);

create table public.tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  category tip_category not null default 'general',
  title text not null,
  description text not null,
  address text,
  latitude double precision,
  longitude double precision,
  images text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null references public.profiles(id) on delete cascade,
  participant_two uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (participant_one, participant_two)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  tip_reference uuid references public.tips(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  read boolean default false,
  related_user_id uuid references public.profiles(id) on delete set null,
  related_tip_id uuid references public.tips(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  reported_user_id uuid,
  reported_tip_id uuid,
  reported_message_id uuid,
  reason text not null check (reason in ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')),
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint report_has_target check (
    reported_user_id is not null or
    reported_tip_id is not null or
    reported_message_id is not null
  )
);

create index idx_reports_reporter on public.reports(reporter_id);
create index idx_reports_status on public.reports(status);
create index idx_reports_reported_tip on public.reports(reported_tip_id) where reported_tip_id is not null;
create index idx_reports_reported_user on public.reports(reported_user_id) where reported_user_id is not null;

create table public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default now(),
  constraint unique_block unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id != blocked_id)
);

create index idx_blocked_users_blocker on public.blocked_users(blocker_id);
create index idx_blocked_users_blocked on public.blocked_users(blocked_id);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  subject text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);

-- Public view of a profile: everything except the email address.
-- Not security_invoker, so it reads with the view owner's privileges and
-- is not restricted by the profiles table's own RLS (which only allows a
-- user to read their own row). This is what lets any signed-in user (and,
-- via the grant below, guests) see other people's username/avatar.
create view public.profiles_public as
select
  id,
  username,
  avatar_url,
  privacy_setting,
  country_id,
  created_at,
  updated_at
from public.profiles;

-- =====================================================================
-- Functions
-- =====================================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.is_admin_or_moderator(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role in ('admin', 'moderator')
  )
$$;

-- Lets an admin see every profile including email, without opening up
-- direct SELECT access to the profiles table (which stays owner-only).
-- The function itself checks the caller is an admin before returning
-- anything, so the grant below is safe to give to all signed-in users.
create or replace function public.admin_get_all_profiles()
returns table (
  id uuid,
  username text,
  email text,
  created_at timestamptz,
  avatar_url text,
  privacy_setting text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Unauthorized: Admin access required';
  end if;

  return query
  select
    p.id,
    p.username,
    p.email,
    p.created_at,
    p.avatar_url,
    p.privacy_setting
  from public.profiles p
  order by p.created_at desc;
end;
$$;

-- Note: the original history also had is_own_profile() and
-- get_email_by_username() functions. Neither is called from the app
-- (login-username now looks up the email itself with the service-role
-- key), so they were dropped here rather than carried forward as dead
-- code.

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_tips_updated_at
  before update on public.tips
  for each row execute function public.update_updated_at_column();

create trigger update_friendships_updated_at
  before update on public.friendships
  for each row execute function public.update_updated_at_column();

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.countries enable row level security;
alter table public.tips enable row level security;
alter table public.friendships enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.user_roles enable row level security;
alter table public.reports enable row level security;
alter table public.blocked_users enable row level security;
alter table public.support_requests enable row level security;

-- Countries: reference data, safe to read for everyone including guests
-- browsing the map before signing in (tips themselves are also readable
-- by guests — see the tips policy below).
create policy "Countries are publicly readable"
on public.countries for select
using (true);

-- Profiles: only the owner can read their own row directly (this is the
-- only place the email address lives). Everyone else goes through the
-- profiles_public view, or through admin_get_all_profiles() if admin.
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid());

-- Tips: readable by anyone, including guests (auth.uid() is null), except
-- tips from a user the viewer has blocked.
create policy "Anyone can view tips except from blocked users"
on public.tips for select
using (
  auth.uid() is null
  or not exists (
    select 1 from public.blocked_users
    where blocker_id = auth.uid() and blocked_id = tips.user_id
  )
);

create policy "Admins and moderators can view all tips"
on public.tips for select
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

create policy "Users can create their own tips"
on public.tips for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own tips"
on public.tips for update
to authenticated
using (user_id = auth.uid());

create policy "Users can delete their own tips"
on public.tips for delete
to authenticated
using (user_id = auth.uid());

create policy "Admins and moderators can delete any tips"
on public.tips for delete
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

-- Friendships
create policy "Users can view their friendships"
on public.friendships for select
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "Users can send friend requests"
on public.friendships for insert
to authenticated
with check (requester_id = auth.uid());

create policy "Users can update friendships they're part of"
on public.friendships for update
to authenticated
using (addressee_id = auth.uid() or requester_id = auth.uid());

create policy "Users can delete their friendships"
on public.friendships for delete
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Chats
create policy "Users can view their chats"
on public.chats for select
to authenticated
using (participant_one = auth.uid() or participant_two = auth.uid());

create policy "Users can create chats"
on public.chats for insert
to authenticated
with check (participant_one = auth.uid() or participant_two = auth.uid());

-- Messages
create policy "Users can view messages in their chats"
on public.messages for select
to authenticated
using (
  exists (
    select 1 from public.chats
    where chats.id = messages.chat_id
    and (chats.participant_one = auth.uid() or chats.participant_two = auth.uid())
  )
);

create policy "Users can send messages in their chats"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid() and
  exists (
    select 1 from public.chats
    where chats.id = messages.chat_id
    and (chats.participant_one = auth.uid() or chats.participant_two = auth.uid())
  )
);

-- Fix: the app's "delete account" flow (ProfileView.handleDeleteAccount)
-- has always deleted the user's own messages, but no DELETE policy ever
-- existed for this table, so that step silently failed. Added to match
-- the existing own-row-delete pattern used everywhere else.
create policy "Users can delete their own messages"
on public.messages for delete
to authenticated
using (sender_id = auth.uid());

-- Notifications
create policy "Users can view their notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

create policy "Users can update their notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid());

-- Fix: same gap as messages above — delete-account also deletes the
-- user's own notifications, but had no policy allowing it.
create policy "Users can delete their own notifications"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());

-- User roles
create policy "Users can view own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
on public.user_roles for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update roles"
on public.user_roles for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
on public.user_roles for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Reports
create policy "Users can create reports"
on public.reports for insert
to authenticated
with check (reporter_id = auth.uid());

create policy "Users can view own reports"
on public.reports for select
to authenticated
using (reporter_id = auth.uid());

create policy "Moderators can view all reports"
on public.reports for select
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

create policy "Moderators can update reports"
on public.reports for update
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

create policy "Users can delete own pending reports"
on public.reports for delete
to authenticated
using (reporter_id = auth.uid() and status = 'pending');

create policy "Admins can delete reports"
on public.reports for delete
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

-- Blocked users
create policy "Users can block others"
on public.blocked_users for insert
to authenticated
with check (blocker_id = auth.uid());

create policy "Users can view their blocks"
on public.blocked_users for select
to authenticated
using (blocker_id = auth.uid());

create policy "Users can unblock"
on public.blocked_users for delete
to authenticated
using (blocker_id = auth.uid());

-- Support requests: the /support page is reachable without signing in,
-- so guests must be able to submit a request too.
create policy "Anyone can create support requests"
on public.support_requests for insert
with check (true);

create policy "Users can view their own support requests"
on public.support_requests for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all support requests"
on public.support_requests for select
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

create policy "Admins can update support requests"
on public.support_requests for update
to authenticated
using (public.is_admin_or_moderator(auth.uid()));

-- =====================================================================
-- Grants
--
-- RLS policies only restrict rows; without a table-level GRANT the
-- anon/authenticated roles cannot touch a table at all. This project
-- does not rely on any default-privilege auto-grant, so every table,
-- view and function the app uses is granted explicitly here.
-- =====================================================================

grant usage on schema public to anon, authenticated;

-- Countries: read-only reference data, needed by guests too.
grant select on public.countries to anon, authenticated;

-- Profiles: signed-in users only (RLS restricts to their own row).
grant select, insert, update on public.profiles to authenticated;

-- profiles_public view: the app's normal way of reading other users'
-- public info, including for guests browsing tips on the map.
grant select on public.profiles_public to anon, authenticated;

-- Tips: guests can read (RLS handles the blocked-user filtering),
-- signed-in users can manage their own.
grant select on public.tips to anon, authenticated;
grant insert, update, delete on public.tips to authenticated;

grant select, insert, update, delete on public.friendships to authenticated;
grant select, insert on public.chats to authenticated;
grant select, insert, delete on public.messages to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, delete on public.blocked_users to authenticated;

-- Support requests: guests can submit (see RLS policy above).
grant select, insert, update on public.support_requests to anon, authenticated;

grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.is_admin_or_moderator(uuid) to authenticated;
grant execute on function public.admin_get_all_profiles() to authenticated;

-- =====================================================================
-- Storage
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('tip-images', 'tip-images', false)
on conflict (id) do nothing;

create policy "Authenticated users can view tip images"
on storage.objects for select
using (
  bucket_id = 'tip-images'
  and auth.uid() is not null
);

create policy "Authenticated users can upload tip images"
on storage.objects for insert
with check (bucket_id = 'tip-images' and auth.role() = 'authenticated');

create policy "Users can update their own tip images"
on storage.objects for update
using (bucket_id = 'tip-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own tip images"
on storage.objects for delete
using (bucket_id = 'tip-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================================
-- Seed data: countries
-- =====================================================================

insert into public.countries (code, name, latitude, longitude) values
('SE', 'Sweden', 62.0, 15.0),
('NO', 'Norway', 62.0, 10.0),
('DK', 'Denmark', 56.0, 10.0),
('FI', 'Finland', 64.0, 26.0),
('IS', 'Iceland', 65.0, -18.0),
('US', 'United States', 38.0, -97.0),
('CA', 'Canada', 56.0, -106.0),
('MX', 'Mexico', 23.0, -102.0),
('GB', 'United Kingdom', 54.0, -2.0),
('FR', 'France', 46.0, 2.0),
('DE', 'Germany', 51.0, 9.0),
('IT', 'Italy', 42.8, 12.8),
('ES', 'Spain', 40.0, -4.0),
('PT', 'Portugal', 39.5, -8.0),
('NL', 'Netherlands', 52.5, 5.75),
('BE', 'Belgium', 50.8, 4.0),
('CH', 'Switzerland', 47.0, 8.0),
('AT', 'Austria', 47.3, 13.3),
('GR', 'Greece', 39.0, 22.0),
('TR', 'Turkey', 39.0, 35.0),
('JP', 'Japan', 36.0, 138.0),
('CN', 'China', 35.0, 105.0),
('KR', 'South Korea', 36.5, 127.5),
('TH', 'Thailand', 15.0, 100.0),
('VN', 'Vietnam', 16.0, 106.0),
('ID', 'Indonesia', -5.0, 120.0),
('MY', 'Malaysia', 4.0, 109.5),
('SG', 'Singapore', 1.35, 103.8),
('PH', 'Philippines', 12.0, 122.0),
('AU', 'Australia', -25.0, 135.0),
('NZ', 'New Zealand', -41.0, 174.0),
('BR', 'Brazil', -10.0, -55.0),
('AR', 'Argentina', -34.0, -64.0),
('CL', 'Chile', -33.0, -70.0),
('CO', 'Colombia', 4.0, -72.0),
('PE', 'Peru', -10.0, -76.0),
('ZA', 'South Africa', -29.0, 24.0),
('EG', 'Egypt', 27.0, 30.0),
('MA', 'Morocco', 32.0, -5.0),
('KE', 'Kenya', 1.0, 38.0),
('AE', 'United Arab Emirates', 24.0, 54.0),
('IN', 'India', 20.0, 77.0),
('RU', 'Russia', 60.0, 100.0),
('PL', 'Poland', 52.0, 20.0),
('CZ', 'Czech Republic', 49.75, 15.5),
('HR', 'Croatia', 45.1, 15.2),
('HU', 'Hungary', 47.0, 20.0),
('IE', 'Ireland', 53.0, -8.0),
('RO', 'Romania', 46.0, 25.0),
('UA', 'Ukraine', 49.0, 32.0);
