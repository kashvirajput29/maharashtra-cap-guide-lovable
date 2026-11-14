# Maharashtra CAP Guide

Build a Maharashtra MHT-CET CAP counselling guidance website called "Maharashtra CAP Guide".

The website is for students and parents trying to understand Maharashtra engineering CAP counselling.

IMPORTANT:

Use the already-connected Supabase database.

Do NOT create a new database.

Do NOT replace or rename the existing tables.

Do NOT create duplicate tables.

The existing Supabase tables are:

1. colleges

2. cutoffs

3. important_dates

Use these tables as the source of truth for all dynamic data.

Database structure:

colleges:

- id

- college_name

- city

- district

- university_affiliation

- branches_offered

- tier_tag

- website_link

- short_description

- created_at

cutoffs:

- id

- college_name

- year

- branch

- category

- round

- closing_percentile

- created_at

important_dates:

- id

- activity

- round

- start_date

- end_date

- status

- link

- created_at

Create these pages:

1. Home

2. Colleges

3. College Detail

4. CAP Process

5. Important Dates

6. FAQ

Navigation should be available throughout the site.

HOME PAGE:

Create a clean student-friendly landing page.

Headline:

"Your Maharashtra CAP Counselling, Simplified."

Add a short story explaining the problem:

MHT-CET CAP counselling can be confusing because students have to understand colleges, branches, cutoffs, categories, rounds and deadlines across many different sources. Maharashtra CAP Guide brings the important information into one simple place.

Add three prominent buttons:

- View Colleges

- CAP Process

- Important Dates

COLLEGES PAGE:

Fetch colleges dynamically from Supabase table "colleges".

Display college cards or a clean table.

Each college should show:

- college_name

- city

- district

- university_affiliation

- tier_tag

- short_description

Add filters:

- City

- Tier

Tier options:

- Top Tier

- Good Tier

- Emerging

Add search by college name.

Clicking a college should open its College Detail page.

COLLEGE DETAIL PAGE:

Show:

- College name

- City

- District

- University affiliation

- Tier

- Branches offered

- Website

- Description

Below that, show cutoff data dynamically from the "cutoffs" table.

The cutoff table should contain:

- Year

- Branch

- Category

- Round

- Closing Percentile

Add filters for:

- Year

- Branch

- Category

- Round

The college detail page must filter cutoffs using the selected college_name.

CAP PROCESS PAGE:

Create a clean vertical timeline explaining the CAP process.

Include steps such as:

1. Registration

2. Document verification

3. Merit list

4. Preference / choice filling

5. CAP Round result

6. Seat acceptance

7. Reporting to institute

8. Further CAP rounds

Clearly distinguish between student actions and CAP Cell actions.

IMPORTANT DATES PAGE:

Fetch data dynamically from "important_dates".

Display dates grouped by round.

For each activity show:

- activity

- start_date

- end_date

- status

- link

Create a timeline-style presentation.

Use status badges:

- Active

- Upcoming

- Closed

- Declared

FAQ PAGE:

Create 10 static frequently asked questions about Maharashtra MHT-CET CAP counselling.

Examples:

- What is CAP counselling?

- What is the difference between CAP Round 1 and Round 2?

- What is a CAP merit list?

- What is choice filling?

- Can I change my preferences?

- What happens if I do not get my first preference?

- What does a closing percentile mean?

- What is the difference between OPEN and reserved categories?

- What happens after seat allotment?

- Where should students verify official dates?

Design:

- Clean

- Modern

- Student-focused

- Mobile responsive

- Easy to scan

- Professional but not corporate

- Use cards, tables, badges and timelines appropriately

- Avoid excessive animations

- Prioritize readability and fast navigation

Use a consistent Maharashtra-inspired visual identity without making the site look government-designed.

Do not use fake college data.

Do not hard-code college or cutoff data.

Do not hard-code important dates.

All such information must come from Supabase.

Make sure the site works correctly on desktop and mobile.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://maharashtra-cap-guide.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/70dfbf84-13e0-4bc2-8e3e-037bb4d8d1ba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
