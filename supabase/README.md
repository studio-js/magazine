# Supabase Content Setup

1. Apply `supabase/schema.sql` in the Supabase SQL editor.
2. Set Edge Function secrets in Supabase:

```sh
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... ADMIN_PASSWORD=promise ALLOWED_ORIGIN=https://studio-js.github.io
```

3. Deploy the write function:

```sh
supabase functions deploy admin-content
```

4. Seed the current static magazine content from a local shell where `SUPABASE_SERVICE_ROLE_KEY` is set:

```sh
npm run seed:supabase
```

Do not put the service role key in frontend code, committed files, or chat. The anon key is public and is used only for RLS-protected reads.
