Supabase integration notes — Diplosoft Media Concept

1) Where to put keys
- Insert your anon (public) key into `assets/js/supabase.js` replacing the placeholder.
- DO NOT commit your service_role key or paste it into the client-side code.

2) Create the `contacts` table
- Open Supabase > SQL Editor and run the SQL in `supabase/sql/create_contacts.sql`.
- After creating the table, enable Row Level Security (RLS) and add policies appropriate for your use-case.

3) Recommended RLS policy for testing (authenticated users)
- In Supabase SQL editor run:

  ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow authenticated inserts" ON public.contacts
  FOR INSERT USING (auth.role() = 'authenticated');

4) For anonymous public submissions (not recommended without protections)
- Use a serverless function to validate CAPTCHA and then insert using the service_role key.
- Or create a limited RLS policy with strict column checks and rate limiting.

5) Local testing
- Start your local server (tools/serve.ps1) and open `http://localhost:8000/contact.html`.
- After replacing the anon key in `assets/js/supabase.js` the contact form will attempt to insert into Supabase.

6) Next steps
- I can add a serverless endpoint to accept contact posts and validate recaptcha before inserting (recommended).
- I can also add simple form UI feedback (loading indicator) if you want.
