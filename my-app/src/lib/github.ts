import "server-only";
import type {
  GitHubRepo,
  GitHubUser,
  LanguageMap,
  ContributionDay
} from "@/types/github";

const GITHUB_API = "https://api.github.com";
const GH_USER = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
const GH_TOKEN = process.env.GITHUB_TOKEN ?? "";

if (!GH_USER || GH_USER.trim() === "") {
  throw new Error("Missing NEXT_PUBLIC_GITHUB_USERNAME in .env.local");
}

type HeadersInitSafe = {
  Accept: string;
  Authorization?: string;
  "Content-Type"?: string;
};

function authHeader(): HeadersInitSafe {
  // GitHub REST accepts "token xxx" and "Bearer xxx". Use "token" for widest compatibility.
  return GH_TOKEN
    ? { Accept: "application/vnd.github+json", Authorization: `token ${GH_TOKEN}` }
    : { Accept: "application/vnd.github+json" };
}

async function ghFetch(
  url: string,
  init?: Omit<RequestInit, "headers"> & { headers?: HeadersInitSafe; requireAuth?: boolean }
): Promise<Response> {
  const headers = { ...(init?.headers ?? authHeader()) };
  const requireAuth = init?.requireAuth === true;

  console.log("[github] fetch", url, { requireAuth, hasToken: Boolean(GH_TOKEN) });

  let res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (res.status === 401 && !requireAuth && headers.Authorization) {
    console.log("[github] 401 with token, retrying unauthenticated", url);
    const noAuthHeaders: HeadersInitSafe = { Accept: "application/vnd.github+json" };
    res = await fetch(url, { ...init, headers: noAuthHeaders, cache: "no-store" });
  }
  return res;
}

export async function fetchUser(): Promise<GitHubUser> {
  const url = `${GITHUB_API}/users/${GH_USER}`;
  console.log("[github] fetchUser", url);
  const res = await ghFetch(url);
  if (!res.ok) {
    console.log("[github] fetchUser error", res.status, await safeText(res));
    throw new Error(`GitHub user fetch failed: ${res.status}`);
  }
  return (await res.json()) as GitHubUser;
}

export async function fetchRepos(limit: number = 12): Promise<GitHubRepo[]> {
  const url = `${GITHUB_API}/users/${GH_USER}/repos?sort=updated&per_page=100&type=owner`;
  console.log("[github] fetchRepos", url);
  const res = await ghFetch(url);
  if (!res.ok) {
    console.log("[github] fetchRepos error", res.status, await safeText(res));
    throw new Error(`GitHub repos fetch failed: ${res.status}`);
  }
  const all = (await res.json()) as GitHubRepo[];
  const preferred = new Set(["TypeScript", "JavaScript", "Go", "Java", "Python"]);
  const cleaned = all
    .filter((r: GitHubRepo) => !r.fork && !r.archived)
    .sort((a: GitHubRepo, b: GitHubRepo) => {
      const prefA = preferred.has(a.language ?? "");
      const prefB = preferred.has(b.language ?? "");
      if (prefA !== prefB) return prefA ? -1 : 1;
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    })
    .slice(0, limit);
  console.log(
    "[github] repos selected",
    cleaned.map((r: GitHubRepo) => `${r.name}:${r.language}`).join(", ")
  );
  return cleaned;
}

export async function fetchRepoLanguages(repo: GitHubRepo): Promise<LanguageMap> {
  console.log("[github] fetchRepoLanguages", repo.name, repo.languages_url);
  const res = await ghFetch(repo.languages_url);
  if (!res.ok) {
    console.log("[github] fetchRepoLanguages error", repo.name, res.status);
    return {};
  }
  return (await res.json()) as LanguageMap;
}

export async function fetchRepoCommitCount(repo: GitHubRepo): Promise<number> {
  const url = `${GITHUB_API}/repos/${repo.owner.login}/${repo.name}/commits?sha=${repo.default_branch}&per_page=1`;
  console.log("[github] fetchRepoCommitCount", repo.name, url);
  const res = await ghFetch(url);
  if (!res.ok) {
    console.log("[github] fetchRepoCommitCount error", repo.name, res.status);
    return 0;
  }
  const link = res.headers.get("link");
  if (link && link.includes('rel="last"')) {
    const match = link.match(/&page=(\d+)>; rel="last"/);
    if (match && match[1]) {
      const last = Number(match[1]);
      console.log("[github] commitCount via Link", repo.name, last);
      return last;
    }
  }
  const arr = (await res.json()) as unknown[];
  const count = Array.isArray(arr) ? arr.length : 0;
  console.log("[github] commitCount fallback", repo.name, count);
  return count;
}

export async function aggregateStats(repos: GitHubRepo[]): Promise<{
  totalStars: number;
  totalForks: number;
  topLanguages: { name: string; bytes: number }[];
}> {
  let totalStars = 0;
  let totalForks = 0;
  const langTotals: Record<string, number> = {};
  await Promise.all(
    repos.map(async (r: GitHubRepo) => {
      totalStars += r.stargazers_count;
      totalForks += r.forks_count;
      const langs = await fetchRepoLanguages(r);
      for (const name of Object.keys(langs)) {
        const bytes = langs[name] as number;
        langTotals[name] = (langTotals[name] ?? 0) + bytes;
      }
    })
  );
  const topLanguages = Object.entries(langTotals)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, bytes]: [string, number]) => ({ name, bytes }));
  console.log("[github] aggregateStats", { totalStars, totalForks, topLanguages });
  return { totalStars, totalForks, topLanguages };
}

export async function fetchContributionCalendar(): Promise<ContributionDay[]> {
  if (!GH_TOKEN) {
    console.log("[github] contributions skipped — no GITHUB_TOKEN");
    return [];
  }
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`;
  console.log("[github] fetchContributionCalendar GraphQL for", GH_USER);
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" } as HeadersInitSafe,
    body: JSON.stringify({ query, variables: { login: GH_USER } }),
    cache: "no-store"
  });
  if (res.status === 401) {
    console.log("[github] GraphQL 401 — invalid token; returning empty calendar");
    return [];
  }
  if (!res.ok) {
    console.log("[github] fetchContributionCalendar error", res.status, await safeText(res));
    return [];
  }
  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            weeks?: { contributionDays: { date: string; contributionCount: number }[] }[];
          };
        };
      };
    };
  };
  const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
  const days: ContributionDay[] = weeks.flatMap(
    (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
      w.contributionDays.map((d: { date: string; contributionCount: number }) => ({
        date: d.date,
        count: d.contributionCount
      }))
  );
  console.log("[github] contributions days loaded", days.length);
  return days;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}