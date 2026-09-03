-- 1. New trust/traceability columns (nullable, no values invented)
ALTER TABLE public.colleges_official_2026
  ADD COLUMN IF NOT EXISTS institute_code text,
  ADD COLUMN IF NOT EXISTS data_status text NOT NULL DEFAULT 'Awaiting verification';

ALTER TABLE public.cutoffs_official_2026
  ADD COLUMN IF NOT EXISTS institute_code text;

-- 2. Derive college data_status from data that already exists
UPDATE public.colleges_official_2026
SET data_status = CASE
  WHEN official_source_url IS NOT NULL AND official_source_url <> ''
       AND last_verified IS NOT NULL THEN 'Verified'
  ELSE 'Awaiting verification'
END;

-- 3. Remove exact duplicate colleges (keep the oldest physical row)
DELETE FROM public.colleges_official_2026 a
USING public.colleges_official_2026 b
WHERE a.college_name = b.college_name
  AND a.ctid > b.ctid;

-- 4. Remove duplicate cutoff records on the official unique key
DELETE FROM public.cutoffs_official_2026 a
USING public.cutoffs_official_2026 b
WHERE coalesce(a.institute_code, a.college_name) = coalesce(b.institute_code, b.college_name)
  AND coalesce(a.branch, '') = coalesce(b.branch, '')
  AND a.academic_year = b.academic_year
  AND coalesce(a.cap_round, '') = coalesce(b.cap_round, '')
  AND coalesce(a.category, '') = coalesce(b.category, '')
  AND coalesce(a.candidature_type, '') = coalesce(b.candidature_type, '')
  AND a.ctid > b.ctid;

-- 5. Enforce uniqueness going forward
CREATE UNIQUE INDEX IF NOT EXISTS colleges_official_2026_name_key
  ON public.colleges_official_2026 (college_name);
CREATE UNIQUE INDEX IF NOT EXISTS colleges_official_2026_institute_code_key
  ON public.colleges_official_2026 (institute_code)
  WHERE institute_code IS NOT NULL AND institute_code <> '';

CREATE UNIQUE INDEX IF NOT EXISTS cutoffs_official_2026_unique_record
  ON public.cutoffs_official_2026 (
    coalesce(institute_code, college_name),
    coalesce(branch, ''),
    academic_year,
    coalesce(cap_round, ''),
    coalesce(category, ''),
    coalesce(candidature_type, '')
  );

-- 6. Admin roles (separate table, never on a profile)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
