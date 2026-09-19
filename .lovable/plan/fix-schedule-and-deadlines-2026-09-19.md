# Fix schedule and deadlines

## Scope
Update only the schedule/deadline experience and its homepage summary. Leave colleges, cutoffs, matchmaker, comparison, and option-form behavior unchanged.

## Schedule data and status rules
- Add a nullable `last_checked` date to `important_dates` without changing existing schedule values.
- Keep the existing public read-only access rules and grants intact.
- Extend the schedule query to return event name, CAP round, start/end dates, official URL, and last checked date.
- Calculate one status from dates at display time using the Maharashtra time zone:
  - missing or invalid official start/end date: **Not published yet**
  - today before start date: **Upcoming**
  - today from start through end, inclusive: **Ongoing**
  - today after end date: **Completed**
- Ignore stored free-text status when presenting the schedule, eliminating contradictory labels.
- Display missing dates and missing last-checked values honestly as “Not published yet” / “Not recorded”; do not backfill or estimate data.

## Schedule page
- Keep the current mobile-friendly card/timeline layout, but show each field explicitly: event, start, end, calculated status, official source, last checked, and CAP round.
- Add combined filters for status and CAP round, including a clear all-rounds option.
- Keep chronological grouping for published dates and place unpublished items in a clearly labelled group.
- Add an **Add to calendar** action that downloads an `.ics` event only when start date, end date, official source URL, and last-checked date are present and valid. Otherwise show no export action.
- Preserve the official-source link and disclaimer.

## Homepage Current CAP Status
- Extend the existing homepage data request with a schedule summary derived from the same official schedule rows and the same status helper.
- Add one unframed Current CAP Status section showing:
  - the current active event, or “No CAP activity is ongoing”
  - the nearest upcoming verified deadline, or “Not published yet”
  - a link to the full schedule
  - a link to the relevant official CET Cell source when available
- Do not alter existing statistics, directory, cutoff, recommendation, or option-form logic.

## Technical details
- Put date-only parsing, Maharashtra-current-date handling, status derivation, verification checks, and calendar generation in a shared schedule utility so homepage and schedule cannot disagree.
- Treat an event as verified for reminders only when both dates are valid, an official source URL exists, and `last_checked` is recorded.
- Use semantic design tokens and existing buttons, badges, selects, cards, and responsive patterns.
- Add route metadata fields currently required by the app (`og:type` and `twitter:card`) while touching the schedule route.

## Verification
- Check boundary cases: before start, start day, end day, after end, and unavailable dates.
- Verify filters combine correctly and never show conflicting statuses.
- Verify `.ics` export appears only for verified events and contains an inclusive all-day date range plus source URL.
- Test homepage summary and schedule at desktop and mobile widths.
- Run the project type check and confirm no browser/runtime errors on `/` and `/important-dates`.
