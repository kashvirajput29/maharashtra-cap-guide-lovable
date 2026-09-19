ALTER TABLE public.important_dates
ADD COLUMN IF NOT EXISTS last_checked date;

COMMENT ON COLUMN public.important_dates.last_checked IS
'Date when this schedule item was last checked against its official source.';