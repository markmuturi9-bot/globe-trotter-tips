-- Tips visibility: make "Who can see your profile" real.
--
-- Before: every tip could be read by anyone, including guests.
-- Now: only signed-in users can read tips, and only from
--   * themselves,
--   * users whose profile is public (privacy_setting = 'public'), or
--   * users they have an accepted friendship with.
-- Blocked users stay hidden, and admins/moderators keep their own policy.
--
-- privacy_setting keeps its existing values ('public' | 'friends_only'),
-- so no data migration is needed.

create or replace function public.can_view_user_content(_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      _owner = auth.uid()
      or exists (
        select 1 from public.profiles p
        where p.id = _owner and p.privacy_setting = 'public'
      )
      or exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and (
            (f.requester_id = _owner and f.addressee_id = auth.uid())
            or (f.addressee_id = _owner and f.requester_id = auth.uid())
          )
      )
    );
$$;

revoke all on function public.can_view_user_content(uuid) from public, anon;
grant execute on function public.can_view_user_content(uuid) to authenticated;

drop policy "Anyone can view tips except from blocked users" on public.tips;

create policy "Signed-in users can view tips they are allowed to see"
on public.tips for select
to authenticated
using (
  public.can_view_user_content(user_id)
  and not exists (
    select 1 from public.blocked_users
    where blocker_id = auth.uid() and blocked_id = tips.user_id
  )
);

-- Guests see no tips and no profiles. (Login by username goes through the
-- login-username Edge Function, which does not use this view.)
revoke select on public.tips from anon;
revoke select on public.profiles_public from anon;
