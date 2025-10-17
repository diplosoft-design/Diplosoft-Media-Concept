-- RLS and admin mapping for Diplosoft contacts
-- Run these in the Supabase SQL editor after creating the contacts table.

-- 1) Enable Row Level Security on contacts
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;

-- 2) Create an admins table to map auth users who are admins
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- 3) Allow authenticated users to insert into contacts (common for public forms)
--    This policy permits users with the anonymous/anon role or authenticated users to insert.
CREATE POLICY IF NOT EXISTS allow_insert_contacts ON public.contacts
  FOR INSERT USING (true)
  WITH CHECK (true);

-- 4) Restrict SELECT/UPDATE/DELETE on contacts to admin users only
-- Helper: check if current user exists in admins table
-- Note: auth.uid() returns the current authenticated user's id

CREATE POLICY IF NOT EXISTS admins_select ON public.contacts
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY IF NOT EXISTS admins_update ON public.contacts
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY IF NOT EXISTS admins_delete ON public.contacts
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- 5) Example: grant the service_role or a SQL admin the ability to insert/update as needed.
-- Note: service_role key is NOT to be used client-side. Use server functions for privileged operations.

-- 6) Insert initial admin mapping (replace '<ADMIN_UUID>' with the admin user's auth.uid())
-- INSERT INTO public.admins (id, role) VALUES ('<ADMIN_UUID>', 'admin');

-- 7) If you want to allow read access to a specific email (less secure), you could create
--    a policy that checks auth.email() but that requires adding the email check as a claim.

-- After running these, create at least one admin row mapping to an existing auth user.
