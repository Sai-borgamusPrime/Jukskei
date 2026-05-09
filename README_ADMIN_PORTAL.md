# Jukskei Admin Portal

This package adds a protected Supabase-backed admin portal to the Jukskei app.

## Files included

Copy these folders/files into your Vite React project:

```text
src/admin/
src/services/adminApi.js
src/services/publicApi.js
src/App.jsx
supabase/jukskei_admin_schema.sql
```

## Install dependencies

You already appear to use these, but confirm:

```bash
npm install @supabase/supabase-js lucide-react react-router-dom
```

## Setup

1. Run `supabase/jukskei_admin_schema.sql` in Supabase SQL Editor.
2. Confirm your `.env` has real Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

3. Add your two admin emails to `admin_allowlist`:

```sql
insert into public.admin_allowlist (email)
values
  ('your-admin-1@example.com'),
  ('your-admin-2@example.com')
on conflict (email) do nothing;
```

4. Create/login those users through Supabase Auth.
5. Make sure their profiles are `super_admin`:

```sql
update public.profiles
set role = 'super_admin'
where lower(email) in (
  lower('your-admin-1@example.com'),
  lower('your-admin-2@example.com')
);
```

## Admin routes

```text
/admin
/admin/teams
/admin/matches
/admin/schedule
/admin/menu
/admin/shop
/admin/gallery
```

## Important

The uploaded public pages currently read from local data arrays. This admin portal writes to Supabase. To make public pages update immediately from the portal, replace those local imports with calls from `src/services/publicApi.js`.

Example:

```js
import { getPublicTeams } from "../services/publicApi";
```

Then use `useEffect` to fetch data instead of importing `../data/teams`.
