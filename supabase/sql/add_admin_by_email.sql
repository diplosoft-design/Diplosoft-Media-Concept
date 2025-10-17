-- Helper: find a user by email in auth.users and add them to public.admins
-- Run this in the Supabase SQL editor. Replace the email below and execute.

-- Example usage:
-- \set admin_email 'admin@example.com'
-- Then run the statements below (or replace :admin_email with a literal string)

DO $$
DECLARE
  admin_email text := 'admin@example.com'; -- <-- change this to the admin's email
  uid uuid;
BEGIN
  -- Ensure admins table exists
  CREATE TABLE IF NOT EXISTS public.admins (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'admin',
    created_at timestamptz DEFAULT now()
  );

  -- Find user id in auth.users by email
  SELECT id INTO uid FROM auth.users WHERE email = admin_email LIMIT 1;
  IF uid IS NULL THEN
    RAISE NOTICE 'No auth user with email % found. Create the user first in Auth > Users.', admin_email;
  ELSE
    -- Insert mapping if not exists
    INSERT INTO public.admins (id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Admin mapping inserted for % (uid=%).', admin_email, uid;
  END IF;
END$$;

-- After running: verify with
-- SELECT * FROM public.admins;
