DROP INDEX IF EXISTS public.colleges_official_2026_name_key;

INSERT INTO public.user_roles (user_id, role)
VALUES ('5951f66f-3112-4c3d-844c-c912251d56ae', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;