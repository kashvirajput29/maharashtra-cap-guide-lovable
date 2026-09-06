-- Institute code is the authoritative unique identifier for a college.
CREATE UNIQUE INDEX IF NOT EXISTS colleges_official_2026_institute_code_key
  ON public.colleges_official_2026 (institute_code)
  WHERE institute_code IS NOT NULL AND btrim(institute_code) <> '';

-- Fallback identity while official codes are not yet published.
CREATE UNIQUE INDEX IF NOT EXISTS colleges_official_2026_identity_key
  ON public.colleges_official_2026 (
    lower(btrim(coalesce(nullif(btrim(institute_code), ''), college_name)))
  );

-- Official CAP cutoff uniqueness key (six fields, institute code authoritative).
CREATE UNIQUE INDEX IF NOT EXISTS cutoffs_official_2026_identity_key
  ON public.cutoffs_official_2026 (
    lower(btrim(coalesce(nullif(btrim(institute_code), ''), college_name))),
    lower(btrim(coalesce(branch, ''))),
    lower(btrim(coalesce(academic_year, ''))),
    lower(btrim(coalesce(cap_round, ''))),
    lower(btrim(coalesce(category, ''))),
    lower(btrim(coalesce(candidature_type, '')))
  );