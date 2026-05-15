// Server side GitHub API helpers for fetching profile and repository data
// Uses GITHUB_TOKEN for higher rate limits and applies Next.js ISR revalidation
const GITHUB_API = 'https://api.github.com';

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const base: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) {
    return { ...base, Authorization: `Bearer ${token}` };
  }
  return base;
}

export async function fetchProfile(username: string): Promise<GitHubProfile> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: authHeaders(),
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    throw new Error(`GitHub profile request failed with status ${res.status}`);
  }
  return (await res.json()) as GitHubProfile;
}

export async function fetchRecentRepos(username: string, limit = 3): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=${limit}&type=owner`,
    {
      headers: authHeaders(),
      next: { revalidate: 60 }
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub repos request failed with status ${res.status}`);
  }
  const repos = (await res.json()) as GitHubRepo[];
  return repos.slice(0, limit);
}
