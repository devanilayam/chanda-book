# Supabase queries

Schema, row-level security and seed data for Chandabook.

Run each section in order in the Supabase SQL editor (or copy it into a
migration). Every statement is idempotent, so re-running a section is safe.

## The model in one line

A community is a **building**; a profile is a **key** cut for one resident.
Signing up gets you a key with no building stamped on it yet. Picking a
community stamps it. Nothing in the app can re-stamp a key — only an
administrator with the service role can, which is exactly the "cannot change
the community once assigned" rule.

```
auth.users ──1:1──> public.profiles ──N:1──> public.communities
 (Supabase)          (id, community_id)       (id, name, address)
```

`profiles` exists because `auth.users` is Supabase's own table: it can't take
app columns, and anything stored in user metadata is writable by the client,
which would make the immutability rule unenforceable.

## 1. Tables

```sql
-- Communities are administrator-managed. The app only ever reads them.
create table if not exists public.communities (
   id      uuid primary key default gen_random_uuid(),
   name    text not null,
   address text not null
);

-- One row per signed-up user, created automatically by the trigger in §2.
-- community_id stays null until the user makes their one-time choice.
create table if not exists public.profiles (
   id           uuid primary key references auth.users (id) on delete cascade,
   community_id uuid references public.communities (id) on delete restrict,
   created_at   timestamptz not null default now()
);

-- Speeds up "who belongs to this community", and is needed by the
-- on-delete-restrict check above.
create index if not exists profiles_community_id_idx
   on public.profiles (community_id);
```

Notes on the choices:

- **`on delete cascade`** on `profiles.id` — deleting the auth user removes
  their profile, so no orphan rows survive an account deletion.
- **`on delete restrict`** on `community_id` — a community with members can't
  be deleted out from under them. Postgres refuses the delete instead.
- **`gen_random_uuid()`** — random ids are safe to expose in URLs. Swap for
  `bigint generated always as identity` if you prefer short numeric ids.
- `communities` carries only the three columns specified. Add
  `created_at timestamptz not null default now()` if you want audit ordering.

## 2. Create a profile on first sign-in

Signup happens inside Supabase's auth schema, so the profile row is created by
a trigger rather than by the app. This means feature 1 (sign-in) needs no
database call from the client at all — `supabase.auth.signUp({ email,
password })` is enough, and the profile appears on its own.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer          -- runs as the owner, so it can bypass RLS on insert
set search_path = ''      -- resolve every name explicitly; blocks path hijacking
as $$
begin
   insert into public.profiles (id)
   values (new.id)
   on conflict (id) do nothing;
   return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
   after insert on auth.users
   for each row execute function public.handle_new_user();
```

Backfill for any users who signed up before the trigger existed:

```sql
insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;
```

## 3. Enforce the one-time community choice

RLS alone can't express "this column may be written once". A trigger can, and
it holds for **every** write path — PostgREST, the SQL editor, a future admin
panel — not just the client.

```sql
create or replace function public.enforce_community_immutable()
returns trigger
language plpgsql
as $$
begin
   -- Null -> value is the one allowed transition. Value -> anything else
   -- (including back to null) is rejected. `is distinct from` is used rather
   -- than `<>` so a null on either side compares correctly.
   if old.community_id is not null
      and new.community_id is distinct from old.community_id then
      raise exception 'community_id cannot be changed once assigned'
         using errcode = '23514';   -- check_violation
   end if;
   return new;
end;
$$;

drop trigger if exists profiles_community_immutable on public.profiles;

create trigger profiles_community_immutable
   before update on public.profiles
   for each row execute function public.enforce_community_immutable();
```

## 4. Row-level security

RLS is deny-by-default: once enabled, only what a policy explicitly permits
gets through. Absent policies are why nothing here can insert or delete
`communities` from the client — that path is left to the service role.

Worth knowing how the two refusals differ: a blocked `insert` raises
`new row violates row-level security policy`, but a blocked `delete` or
`update` simply matches no rows and reports `DELETE 0`. Silence there means
the policy did its job, not that the statement was ignored.

```sql
alter table public.communities enable row level security;
alter table public.profiles    enable row level security;

-- Feature 2: any signed-in user can read the full list to choose from.
drop policy if exists "authenticated can list communities" on public.communities;
create policy "authenticated can list communities"
   on public.communities
   for select
   to authenticated
   using (true);

-- Feature 3: a user reads only their own profile row.
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
   on public.profiles
   for select
   to authenticated
   using ((select auth.uid()) = id);

-- Feature 2: a user writes only their own profile row. The trigger in §3
-- decides whether the community_id in that write is actually allowed.
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
   on public.profiles
   for update
   to authenticated
   using ((select auth.uid()) = id)
   with check ((select auth.uid()) = id);
```

`(select auth.uid())` rather than a bare `auth.uid()` is deliberate: wrapping it
in a subquery lets Postgres evaluate it once per statement instead of once per
row, which matters as `profiles` grows.

No `insert` policy on `profiles` — §2's trigger owns creation. No `delete`
policy anywhere — profiles disappear with their auth user.

## 5. Seed communities

Development data, so the selection screen isn't empty. The `where not exists`
guard makes this a no-op once the table has any row in it.

```sql
insert into public.communities (name, address)
select v.name, v.address
from (values
   ('Devanilayam Trust',   '12-4-17, Temple Street, Vijayawada, Andhra Pradesh 520001'),
   ('Sri Rama Colony',     'Plot 88, Sector 4, Kukatpally, Hyderabad, Telangana 500072'),
   ('Ganesh Nagar Sangam', '3rd Cross, Ganesh Nagar, Guntur, Andhra Pradesh 522002')
) as v(name, address)
where not exists (select 1 from public.communities);
```

## 6. The queries the app runs

Three reads and one write, one per feature. Shown as SQL; through
`supabase-js` these are the equivalent `.select()` / `.update()` calls, and RLS
supplies the `where` clauses on the user's id automatically.

```sql
-- Feature 2a — list communities to choose from.
select id, name, address
from public.communities
order by name;

-- Feature 2b — assign the chosen community (one time only).
-- Succeeds when community_id is null; raises 23514 on a second attempt.
update public.profiles
set community_id = :chosen_community_id
where id = auth.uid()
returning community_id;

-- Feature 3 — the assigned community's details.
select c.id, c.name, c.address
from public.profiles p
join public.communities c on c.id = p.community_id
where p.id = auth.uid();

-- Routing helper — has this user chosen yet? Decides whether they land on
-- the selection screen or the details screen after login.
select community_id is not null as has_community
from public.profiles
where id = auth.uid();
```

## 7. Verify the rules hold

Run as a signed-in user (Supabase SQL editor runs as service role, which
bypasses RLS — use the app or an API call with a user JWT for a true test).

```sql
-- Should return 1 — your own row, and no one else's.
select count(*) from public.profiles;

-- Should return every seeded community (3 with the seed above).
select count(*) from public.communities;

-- First one succeeds. Second must fail with:
--   ERROR: community_id cannot be changed once assigned
update public.profiles set community_id =
   (select id from public.communities order by name limit 1)
where id = auth.uid();

update public.profiles set community_id =
   (select id from public.communities order by name desc limit 1)
where id = auth.uid();

-- Should fail — communities has no insert policy for authenticated users.
insert into public.communities (name, address) values ('Nope', 'Nowhere');
```

## Google sign-in (dashboard, not SQL)

Google is the app's only sign-in method — there is no email-and-password form,
and `/login` is the single door. Nothing in the schema changes: Supabase writes
the same row to `auth.users` on a first sign-in, so `on_auth_user_created`
creates the profile and the community gate behaves as described above. Email
and password can stay disabled in the dashboard.

Two things have to be set up outside this file:

1. **Google Cloud console** — create an OAuth 2.0 Web application client, and
   give it the authorised redirect URI Supabase shows on the provider page:
   `https://<project-ref>.supabase.co/auth/v1/callback`. Note the client ID and
   secret.
2. **Supabase dashboard** — Authentication → Sign In / Providers → Google:
   enable it and paste that client ID and secret. Until this is done the button
   fails with `Unsupported provider: provider is not enabled`.

Then, under Authentication → URL Configuration, add the app's own callback to
the redirect allow list — `http://localhost:3000/confirm` for development, plus
the deployed origin's `/confirm`. That is the URL `useGoogleAuth` asks Google to
return to, and Supabase refuses any redirect target not on the list.

## Changing a user's community anyway

There is no client path, by design. An administrator does it in the SQL editor
(service role), which still fires the immutability trigger — so it has to be
disabled for the length of the change:

```sql
begin;
   alter table public.profiles disable trigger profiles_community_immutable;
   update public.profiles
   set community_id = '<new-community-uuid>'
   where id = '<user-uuid>';
   alter table public.profiles enable trigger profiles_community_immutable;
commit;
```
