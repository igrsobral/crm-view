-- Debug RLS Issues
-- Run these queries in Supabase SQL Editor to troubleshoot RLS problems

-- 1. Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'deals', 'activities');

-- 2. Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'deals', 'activities');

-- 3. Check current user authentication
SELECT auth.uid() as current_user_id, auth.role() as current_role;

-- 4. Test basic contact insertion (replace 'your-user-id' with actual user ID)
-- First get your user ID:
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then test insertion with explicit user_id:
-- INSERT INTO public.contacts (user_id, name, email, status) 
-- VALUES ('your-user-id-here', 'Test Contact', 'test@example.com', 'lead');

-- 5. Check if there are any contacts for the current user
SELECT id, name, email, user_id, created_at 
FROM public.contacts 
WHERE user_id = auth.uid()
LIMIT 5;

-- 6. If RLS policies need to be recreated, use these commands:
-- DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
-- CREATE POLICY "Users can insert their own contacts" ON public.contacts
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Temporarily disable RLS for testing (NOT recommended for production):
-- ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable it after testing:
-- ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;