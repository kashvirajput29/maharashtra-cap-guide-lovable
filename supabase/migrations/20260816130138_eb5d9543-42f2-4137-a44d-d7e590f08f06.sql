GRANT SELECT ON public.colleges_official_2026 TO anon, authenticated;
GRANT SELECT ON public.cutoffs_official_2026 TO anon, authenticated;
GRANT SELECT ON public.post_cap_updates_official TO anon, authenticated;
GRANT SELECT ON public.college_classifications_verified TO anon, authenticated;
GRANT ALL ON public.colleges_official_2026 TO service_role;
GRANT ALL ON public.cutoffs_official_2026 TO service_role;
GRANT ALL ON public.post_cap_updates_official TO service_role;
GRANT ALL ON public.college_classifications_verified TO service_role;

CREATE POLICY "Public read colleges_official_2026" ON public.colleges_official_2026 FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read cutoffs_official_2026" ON public.cutoffs_official_2026 FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read post_cap_updates_official" ON public.post_cap_updates_official FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read college_classifications_verified" ON public.college_classifications_verified FOR SELECT TO anon, authenticated USING (true);