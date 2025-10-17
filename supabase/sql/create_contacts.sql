-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Example RLS policy notes (enable RLS and add policies via Supabase UI or SQL)
-- Enable RLS:
-- ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: allow inserts from authenticated users
-- CREATE POLICY "Allow authenticated inserts" ON public.contacts
-- FOR INSERT USING (auth.role() = 'authenticated');

-- Policy: allow anonymous inserts via a function or limited policy (be cautious)
-- Example: allow inserts when a valid captcha_token is present (requires server-side verification)

-- After creating table, configure appropriate policies in the Supabase dashboard.
