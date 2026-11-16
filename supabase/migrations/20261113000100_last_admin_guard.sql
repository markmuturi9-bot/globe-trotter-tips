-- Protect the last admin: the number of admins can never drop to zero.
--
-- Fires before an admin role row is deleted, or changed so that it is no
-- longer an admin role for the same user. Deleting a user account removes
-- its role rows too, so the last admin's account cannot be deleted either
-- (intended - make someone else admin first).

create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _other_admins integer;
begin
  if old.role <> 'admin' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  -- For UPDATE: nothing to protect unless the admin role is actually lost.
  if tg_op = 'UPDATE' and new.role = 'admin' and new.user_id = old.user_id then
    return new;
  end if;

  -- Lock all admin rows so two simultaneous removals cannot both pass.
  perform 1 from public.user_roles where role = 'admin' for update;

  select count(*) into _other_admins
  from public.user_roles
  where role = 'admin' and id <> old.id;

  if _other_admins = 0 then
    raise exception 'Cannot remove or change the last admin. Make someone else admin first.';
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

-- Only the trigger runs this function; nobody should call it directly.
revoke all on function public.prevent_last_admin_removal() from public, anon, authenticated;

create trigger prevent_last_admin_removal
  before update or delete on public.user_roles
  for each row execute function public.prevent_last_admin_removal();
