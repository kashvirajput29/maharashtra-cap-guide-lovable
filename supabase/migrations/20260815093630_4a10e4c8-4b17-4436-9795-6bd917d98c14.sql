-- Defense in depth: public/anon and signed-in users get read-only access.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.colleges FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.cutoffs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.important_dates FROM anon, authenticated;

GRANT SELECT ON public.colleges TO anon, authenticated;
GRANT SELECT ON public.cutoffs TO anon, authenticated;
GRANT SELECT ON public.important_dates TO anon, authenticated;

GRANT ALL ON public.colleges TO service_role;
GRANT ALL ON public.cutoffs TO service_role;
GRANT ALL ON public.important_dates TO service_role;

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;