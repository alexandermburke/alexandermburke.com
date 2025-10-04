export type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  blog: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  default_branch: string;
  pushed_at: string;
  updated_at: string;
  created_at: string;
  owner: { login: string };
  languages_url: string;
  archived: boolean;
  fork: boolean;
  homepage: string | null;
};

export type LanguageMap = Record<string, number>;

export type ContributionDay = {
  date: string;
  count: number;
};