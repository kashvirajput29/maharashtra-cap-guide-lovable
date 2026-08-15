ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.colleges TO anon, authenticated;
GRANT SELECT ON public.cutoffs TO anon, authenticated;
GRANT SELECT ON public.important_dates TO anon, authenticated;
GRANT ALL ON public.colleges TO service_role;
GRANT ALL ON public.cutoffs TO service_role;
GRANT ALL ON public.important_dates TO service_role;

CREATE POLICY "Public can read colleges" ON public.colleges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read cutoffs" ON public.cutoffs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read important dates" ON public.important_dates FOR SELECT TO anon, authenticated USING (true);