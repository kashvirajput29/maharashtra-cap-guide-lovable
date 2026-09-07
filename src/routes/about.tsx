import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { statsQuery } from "@/lib/stats-query";
import { PageBackground } from "@/components/page-background";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  GraduationCap,
  LayoutList,
  Lightbulb,
  ListChecks,
  Scale,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import homeBg from "@/assets/home-bg.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Maharashtra CAP Guide | Official Data Methodology" },
      {
        name: "description",
        content:
          "Learn how Maharashtra CAP Guide sources official MHT-CET CAP data, handles missing 2026 cutoffs, and keeps college, cutoff and post-CAP information accurate and verifiable.",
      },
      {
        property: "og:title",
        content: "About Maharashtra CAP Guide | Official Data Methodology",
      },
      {
        property: "og:description",
        content:
          "Learn how Maharashtra CAP Guide sources official MHT-CET CAP data, handles missing 2026 cutoffs, and keeps college, cutoff and post-CAP information accurate and verifiable.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: stats } = useQuery(statsQuery);
  const collegeCount = stats?.colleges;

  return (

    <div className="theme-accent-library">
      <PageBackground image={homeBg.url} />

      <section className="border-b border-border/70 bg-gradient-to-b from-secondary/25 to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          <Badge
            variant="outline"
            className="border-teal/30 bg-teal/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal"
          >
            Official data first
          </Badge>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            About Maharashtra CAP Guide
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A student-built, non-commercial website that provides clear,
            structured, and officially sourced information for candidates
            participating in the Maharashtra State CET Cell’s Centralised
            Admission Process (CAP) for First-Year Engineering (FY B.Tech /
            B.E.).
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border-border/70">
          <CardContent className="space-y-12 p-6 md:p-10">
            {/* The problem */}
            <section>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  The problem
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every year, lakhs of students appear for MHT-CET and/or JEE
                (Main) to seek admission to engineering colleges in Maharashtra.
                During the CAP process, they must:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  Understand multiple rounds of counselling, different categories
                  (State Level, Home University, Other Than Home University,
                  etc.), and institute-level admission processes after CAP.
                </li>
                <li>
                  Evaluate dozens or hundreds of engineering colleges across
                  Maharashtra.
                </li>
                <li>
                  Find reliable, up-to-date information on:
                  <ul className="mt-2 list-[circle] space-y-1 pl-5">
                    <li>Which branches each college offers</li>
                    <li>
                      Official CAP cutoffs for each branch and category
                    </li>
                    <li>Post-CAP ACAP/ILS notices and admission timelines</li>
                    <li>
                      Verified institutional indicators like NAAC grades, NIRF
                      rankings, NBA accreditation, and government/aided status
                    </li>
                  </ul>
                </li>
              </ul>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                In practice, most students rely on private counselling websites,
                social media groups, Telegram channels, unofficial blogs and
                YouTube videos. These sources often mix facts with opinions, use
                outdated data, or present predictions as if they are official.
                This creates confusion, anxiety, and sometimes poor college
                choices.
              </p>
            </section>

            <hr className="border-border/70" />

            {/* Our approach */}
            <section>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Our approach: official data first
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Maharashtra CAP Guide is built on a simple principle: if it is not
                officially verifiable, we do not present it as fact.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">
                All core data comes from:
              </h3>
              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      Maharashtra State CET Cell FE Engineering Portal
                    </strong>{" "}
                    — the official portal for First-Year Engineering CAP:{" "}
                    <a
                      href="https://fe2026.mahacet.org/StaticPages/HomePage"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 font-medium text-aqua underline-offset-4 hover:underline"
                    >
                      fe2026.mahacet.org
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                  <span className="text-muted-foreground">
                    Official college websites and official admission/notice pages
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                  <span className="text-muted-foreground">
                    Official institutional indicators from NIRF, NAAC, NBA,
                    AICTE, affiliating universities, and government/aided status
                    records
                  </span>
                </li>
              </ul>

              <h3 className="mt-6 font-semibold text-foreground">
                We do not use:
              </h3>
              <ul className="mt-3 space-y-3">
                {[
                  "Private counselling sites as final sources",
                  "Aggregators that repackage data without clear sourcing",
                  "Blogs, Wikipedia, or social media posts as authoritative sources",
                  "Predicted cutoffs, “expected closing ranks”, or sample data as if they are real",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="border-border/70" />

            {/* Missing data */}
            <section>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  How we handle missing or unpublished data
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                For the 2026 admission cycle, many colleges do not yet have
                officially published CAP cutoffs or post-CAP notices at the time
                of launch. Instead of guessing:
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Card className="border-border/70 bg-muted/40">
                  <CardContent className="p-5">
                    <p className="font-semibold text-foreground">
                      Missing 2026 cutoffs
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      We show <em>data_status: Not published yet</em>, a blank
                      closing percentile, and a link to the CET Cell portal as the
                      authoritative source to watch.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-muted/40">
                  <CardContent className="p-5">
                    <p className="font-semibold text-foreground">
                      Missing ACAP/ILS notice
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      We show <em>status: Check official notice</em> and a link
                      to the college’s official admission or notices page.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                This is intentional. We would rather show “Not published yet” than
                present unofficial numbers that could mislead you.
              </p>
            </section>

            <hr className="border-border/70" />

            {/* Current dataset */}
            <section>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  What the guide covers (current dataset)
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                At launch, this guide includes{" "}
                <strong className="text-foreground">
                  {collegeCount === undefined ? "the" : collegeCount} engineering colleges
                  across Maharashtra
                </strong>
                , covering major regions such as:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Mumbai and Thane",
                  "Pune",
                  "Nagpur and Vidarbha",
                  "Chhatrapati Sambhajinagar (Aurangabad)",
                  "Nashik",
                  "Kolhapur, Solapur, Amravati, and other districts",
                ].map((region) => (
                  <Badge
                    key={region}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {region}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                For each college, you will find city, district, university
                affiliation, major branches offered, official college website
                and source links, official 2026 CAP cutoffs where published,
                post-CAP ACAP/ILS update status and notice links, and verified
                institutional indicators such as NAAC grade, government/aided
                status, and autonomous status.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The dataset is curated and verified manually using official
                sources. It is not automatically scraped, and every college entry
                is tied to at least one official source URL.
              </p>
            </section>

            <hr className="border-border/70" />

            {/* Key features */}
            <section>
              <div className="flex items-center gap-2">
                <LayoutList className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Key features
                </h2>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Official-data-first college profiles",
                    body: "Each college page shows only verified information, with clear source links.",
                  },
                  {
                    title: "Cutoffs with data status",
                    body: "Official 2026 CAP cutoffs are shown where available; otherwise marked “Not published yet”.",
                  },
                  {
                    title: "Post-CAP updates tracker",
                    body: "A dedicated view of ACAP/ILS notices and admission-related updates, linked to official college notice pages.",
                  },
                  {
                    title: "College classifications",
                    body: "Verified indicators like NAAC grades, NIRF rankings, NBA accreditation, and government/aided status, without inventing unofficial “Tier 1/2/3” labels.",
                  },
                  {
                    title: "Compare up to 3 colleges",
                    body: "Select up to three colleges and compare their branches, locations, affiliations, cutoffs, and classifications side-by-side.",
                  },
                  {
                    title: "Chronological date tracker",
                    body: "A timeline of CAP-related dates and deadlines, with filters for All / Ongoing / Upcoming / Completed events and colour-coded status badges.",
                  },
                  {
                    title: "FAQs and info tooltips",
                    body: "Plain-language explanations of CAP rounds, categories, cutoffs, ACAP/ILS, and other key terms, with tooltips on relevant UI elements.",
                  },
                ].map((feature) => (
                  <li key={feature.title}>
                    <Card className="h-full border-border/70 bg-muted/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="p-5">
                        <p className="font-semibold text-foreground">
                          {feature.title}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {feature.body}
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="border-border/70" />

            {/* Technology */}
            <section>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Technology and implementation
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                This project is built as a modern, lightweight web application:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Frontend & logic:</strong>{" "}
                  Lovable (AI-assisted app builder)
                </li>
                <li>
                  <strong className="text-foreground">Database:</strong>{" "}
                  Supabase (PostgreSQL-based)
                </li>
                <li>
                  <strong className="text-foreground">Data workflow:</strong>{" "}
                  Official data is collected from the CET Cell portal and college
                  websites, structured into CSVs, and imported into Supabase
                  tables. Frontend pages are generated and wired to these
                  tables via Lovable.
                </li>
              </ul>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The focus is on clarity, correctness, and maintainability rather
                than flashy features.
              </p>
            </section>

            <hr className="border-border/70" />

            {/* What’s next */}
            <section>
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  What’s next
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Future improvements may include:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  Expanding beyond the current
                  {collegeCount === undefined ? "" : ` ${collegeCount}`} colleges to cover
                  more engineering
                  institutes participating in CAP.
                </li>
                <li>
                  Adding filters and search (by district, university, branch,
                  category, etc.).
                </li>
                <li>
                  Periodic updates as new official 2026 cutoffs and ACAP/ILS
                  notices are published.
                </li>
                <li>
                  Additional explanatory content for first-time CAP
                  participants.
                </li>
              </ul>
            </section>

            <hr className="border-border/70" />

            {/* Disclaimer */}
            <section>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-aqua" />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Disclaimer
                </h2>
              </div>
              <div className="mt-5 rounded-xl border border-border/70 bg-muted/40 p-5">
                <p className="leading-relaxed text-muted-foreground">
                  This website is a student-built, non-commercial reference tool.
                  It is not affiliated with the Maharashtra State CET Cell, any
                  university, or any college.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                  <li>
                    All core data is sourced from official websites and
                    documents.
                  </li>
                  <li>
                    Where official 2026 data is not yet published, the guide
                    explicitly marks it as “Not published yet” rather than using
                    predictions or unofficial numbers.
                  </li>
                  <li>
                    Users are encouraged to cross-check critical information
                    (especially cutoffs, deadlines, and admission procedures)
                    directly on the{" "}
                    <a
                      href="https://fe2026.mahacet.org"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-aqua underline-offset-4 hover:underline"
                    >
                      Maharashtra State CET Cell FE Engineering Portal
                    </a>{" "}
                    and the official website of the relevant college or
                    university.
                </li>
                </ul>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Use this guide as a structured, official-data-first starting
                  point, not as a substitute for the primary sources.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/colleges">Browse colleges</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/important-dates">View important dates</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
