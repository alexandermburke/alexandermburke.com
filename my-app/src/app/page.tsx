// src/app/page.tsx
import Image from "next/image";
import {
  fetchUser,
  fetchRepos,
  fetchRepoCommitCount,
  aggregateStats,
  fetchContributionCalendar
} from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import AnimatedNumber from "@/components/AnimatedNumber";
import Sparkline, { SeriesPoint } from "@/components/Sparkline";
import type { GitHubRepo } from "@/types/github";
import { getDemoNumbers } from "@/lib/demo";

export const dynamic = "force-dynamic";

type PageSearchParams = Record<string, string | string[] | undefined>;
type PageProps = { searchParams?: Promise<PageSearchParams> };

type ExperienceItem = {
  role: string;
  company: string;
  employmentType: string;
  period: string;
  location?: string;
  highlights: string[];
  skills?: string[];
  logo?: string;
};

type EducationItem = {
  school: string;
  degree: string;
  period: string;
  location?: string;
  details?: string;
  gpa?: string;
  logo?: string;
};

function initials(text: string): string {
  return text
    .split(" ")
    .map(part => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function monthKey(d: string): string {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function toMonthlySeries(days: { date: string; count: number }[]): SeriesPoint[] {
  const buckets: Record<string, number> = {};
  for (const d of days) {
    const k = monthKey(d.date);
    buckets[k] = (buckets[k] ?? 0) + d.count;
  }
  const keys = Object.keys(buckets).sort();
  return keys.map((k, i) => {
    const value = buckets[k];
    return { x: i + 1, y: typeof value === "number" ? value : 0 };
  });
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const demoParam = Array.isArray(resolvedSearchParams?.demo)
    ? resolvedSearchParams?.demo[0]
    : resolvedSearchParams?.demo;
  const isDemo = Boolean(demoParam);
  const demo = getDemoNumbers(isDemo);

  const user = await fetchUser();
  const repos: GitHubRepo[] = await fetchRepos(12);

  const [agg, commitsByRepo, contribDays] = await Promise.all([
    aggregateStats(repos),
    Promise.all(repos.map((r: GitHubRepo) => fetchRepoCommitCount(r))),
    fetchContributionCalendar()
  ]);

  const totalRepoCommitsReal = commitsByRepo.reduce((acc: number, n: number) => acc + n, 0);
  const totalContribsLastYearReal = contribDays.reduce(
    (acc: number, d: { date: string; count: number }) => acc + d.count,
    0
  );

  const totalRepoCommits = demo.inflate(totalRepoCommitsReal);
  const totalContribsLastYear = demo.inflate(totalContribsLastYearReal);
  const stars = demo.inflate(agg.totalStars);
  const forks = demo.inflate(agg.totalForks);
  const followers = demo.inflate(user.followers);
  const reposCount = demo.inflate(user.public_repos);

  const monthlySeriesRaw = toMonthlySeries(contribDays);
  const monthlySeries =
    monthlySeriesRaw.length > 0 ? monthlySeriesRaw : Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 0 }));

  const fallbackLangs: { name: string; bytes: number }[] = [
    { name: "TypeScript", bytes: 1_000_000 },
    { name: "JavaScript", bytes: 420_000 },
    { name: "Go", bytes: 260_000 },
    { name: "Python", bytes: 180_000 },
    { name: "Java", bytes: 90_000 },
    { name: "HTML", bytes: 60_000 }
  ];

  const usingFallbackLanguages = agg.topLanguages.length === 0;
  const languages = usingFallbackLanguages ? fallbackLangs : agg.topLanguages;
  const totalLanguageBytes = languages.reduce((acc, lang) => acc + (lang.bytes ?? 0), 0);

  const linkedinExperience: ExperienceItem[] = [
    {
      role: "Data Analyst",
      company: "Cole International",
      employmentType: "Full-time",
      period: "Nov 2024 — Present",
      location: "Phoenix, AZ • On-site",
      highlights: [
        "Handle data entry and customs analysis for cross-border logistics operations.",
        "Use CargoWise and Excel to prepare and review compliance documentation."
      ],
      skills: ["CargoWise", "Data Analysis", "Excel"],
      logo: "/Cole.jpeg"
    },
    {
      role: "Software Developer",
      company: "Cadexlaw LLC",
      employmentType: "Part-time",
      period: "Mar 2024 — Present",
      location: "Scottsdale, AZ",
      highlights: [
        "Build legal-tech tooling with Next.js and TypeScript for law students.",
        "Collaborate with classmates to iterate quickly on product feedback."
      ],
      skills: ["Next.js", "TypeScript", "Product Design"],
      logo: "/Cadex.jpeg"
    },
    {
      role: "Audio Visual Specialist",
      company: "TNPAV",
      employmentType: "Contract",
      period: "Jan 2024 — Dec 2024",
      location: "Phoenix, AZ",
      highlights: [
        "Set up and operated audio, video, and lighting equipment for live events.",
        "Coordinated with corporate clients to ensure seamless event execution."
      ],
      skills: ["Live Production", "Client Support"],
      logo: "/TNPAV.jpeg"
    },
    {
      role: "Property Manager",
      company: "Public Storage",
      employmentType: "Full-time",
      period: "Feb 2023 — Nov 2024",
      location: "Scottsdale, AZ",
      highlights: [
        "Managed day-to-day operations for a self-storage facility, including sales and leasing.",
        "Delivered top-tier customer service while overseeing site security and reporting."
      ],
      skills: ["Customer Service", "Operations", "Sales"],
      logo: "/PS.jpeg"
    }
  ];

  const education: EducationItem[] = [
    {
      school: "Arizona State University",
      degree: "Bachelor of Engineering, Computer Science",
      period: "Jan 2025 — 2027",
      location: "Tempe, AZ",
      logo: "/ASU.jpeg"
    },
    {
      school: "Paradise Valley Community College",
      degree: "Associate's Degree, Computer Science",
      period: "Sep 2024 — Jun 2026",
      location: "Phoenix, AZ",
      details: "Associate pathway in Computer Science",
      gpa: "3.5",
      logo: "/PVCC.jpeg"
    }
  ];

  const formatLanguagePercent = (bytes: number): string => {
    if (!totalLanguageBytes) return "0%";
    const pct = (bytes / totalLanguageBytes) * 100;
    return `${Math.round(pct * 10) / 10}%`;
  };

  const formatLanguageBytes = (bytes: number): string => {
    if (bytes >= 1_000_000) {
      return `${(bytes / 1_000_000).toFixed(1)}M bytes`;
    }
    if (bytes >= 1_000) {
      return `${(bytes / 1_000).toFixed(1)}k bytes`;
    }
    return `${bytes} bytes`;
  };

  console.log("[page] demo mode:", isDemo, demo.note);
  console.log("[page] monthly points:", monthlySeries.length);
  console.log("[page] languages:", languages.map(l => l.name).join(", "));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 body-grid">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr] items-center">
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-white/10">
            <Image
              src="/header.png"
              alt={user.name ?? user.login}
              fill
              sizes="112px"
              className="object-cover object-center scale-110"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Alex Burke</h1>
            <div className="text-white/60">{user.bio ?? "Software / ML Developer"}</div>
            <div className="mt-1 text-sm text-white/50">
              <span className="mr-3">📍 {user.location ?? "Arizona, USA"}</span>
              <a
                className="hover:text-accent"
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{user.login}
              </a>
              <span className="ml-3 rounded bg-white/10 px-2 py-0.5 text-xs text-white/70 border border-white/15">
                {demo.note}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <a
            className="card px-4 py-2 hover:text-accent hover-lift"
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a className="card px-4 py-2 hover:text-accent hover-lift" href="mailto:ab@alexandermburke.com">
            Email
          </a>
          <a
            className="card px-4 py-2 hover:text-accent hover-lift"
            href="https://www.linkedin.com/in/alex-burke-052a88289"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="card p-4">
          <div className="text-sm text-white/60">Public Repos</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={reposCount} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Followers</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={followers} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Stars (public)</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={stars} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Forks (public)</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={forks} />
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Commits (selected repos)</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={totalRepoCommits} />
          </div>
          <div className="mt-1 text-xs text-white/40">Commit counts use GitHub Link header on default branches.</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-white/60">Contributions (1y)</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={totalContribsLastYear} />
          </div>
          <div className="mt-1 text-xs text-white/40">From GitHub GraphQL when token provided.</div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Experience</h2>
          <div className="text-sm text-white/50">LinkedIn highlights</div>
        </div>
        <div className="space-y-4">
          {linkedinExperience.map(exp => (
            <article
              key={`${exp.company}-${exp.period}`}
              className="card p-5 flex flex-col gap-3 hover-lift"
            >
              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {exp.logo ? (
                    <Image src={exp.logo} alt={exp.company} fill sizes="48px" className="object-contain p-1.5" />
                  ) : (
                    <span className="text-sm font-semibold text-white/70">{initials(exp.company)}</span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold tracking-tight">{exp.role}</div>
                      <div className="text-sm text-white/60">
                        {exp.company}
                        <span className="text-white/30"> • </span>
                        {exp.employmentType}
                      </div>
                    </div>
                    <div className="text-xs text-white/50 text-right">
                      <div>{exp.period}</div>
                      {exp.location && <div>{exp.location}</div>}
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-white/60 list-disc pl-4 marker:text-white/50">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={`${exp.company}-${idx}`}>{highlight}</li>
                    ))}
                  </ul>
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map(skill => (
                        <span
                          key={`${exp.company}-${skill}`}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Education</h2>
          <div className="text-sm text-white/50">Academic journey</div>
        </div>
        <div className="space-y-4">
          {education.map(school => (
            <article
              key={`${school.school}-${school.period}`}
              className="card p-5 flex items-start gap-4 hover-lift"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                {school.logo ? (
                  <Image src={school.logo} alt={school.school} fill sizes="48px" className="object-contain p-1.5" />
                ) : (
                  <span className="text-sm font-semibold text-white/70">{initials(school.school)}</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-lg font-semibold tracking-tight">{school.school}</div>
                <div className="text-sm text-white/60">{school.degree}</div>
                <div className="text-xs text-white/50">
                  <span>{school.period}</span>
                  {school.location && <span className="text-white/30"> • {school.location}</span>}
                </div>
                {school.details && <div className="text-xs text-white/50">{school.details}</div>}
                {school.gpa && <div className="text-xs text-white/50">GPA: {school.gpa}</div>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Activity (last 12 months)</h2>
            <div className="text-xs text-white/50">Live data • No private repos</div>
          </div>
          <Sparkline data={monthlySeries} className="w-full" />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Languages</h2>
          <div className="text-sm text-white/50">
            {usingFallbackLanguages ? "Fallback snapshot" : "Sorted by bytes"}
          </div>
        </div>
        <div className="card p-5">
          <ul className="space-y-4">
            {languages.map(lang => {
              const bytes = lang.bytes ?? 0;
              const pct = totalLanguageBytes ? (bytes / totalLanguageBytes) * 100 : 0;
              const barWidth = Math.min(100, Math.max(6, Math.round(pct)));
              return (
                <li key={lang.name} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-base font-medium tracking-tight">{lang.name}</span>
                    <span className="text-sm text-white/50">{formatLanguagePercent(bytes)} • {formatLanguageBytes(bytes)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-white/70 to-white/40"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <div className="text-sm text-white/50">Live data from GitHub • no private repos</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {repos.map((r, i) => (
            <div key={r.id} className="hover-lift">
              <ProjectCard
                name={r.name}
                description={r.description}
                htmlUrl={r.html_url}
                homepage={r.homepage}
                language={r.language}
                stars={demo.inflate(r.stargazers_count)}
                forks={demo.inflate(r.forks_count)}
                commits={demo.inflate(commitsByRepo[i] ?? 0)}
                updatedAt={r.updated_at}
                topics={r.topics}
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-16 pb-10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} Alex Burke • Built with Next.js + Tailwind • Data from GitHub
      </footer>
    </main>
  );
}
