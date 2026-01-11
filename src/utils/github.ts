import type { GitHubRepo } from '@/types'

// Matches GitHub URLs:
// https://github.com/owner/repo
// https://github.com/owner/repo/tree/branch
// https://github.com/owner/repo/tree/branch/path/to/dir
// https://github.com/owner/repo/blob/branch/path/to/file
const GITHUB_URL_REGEX =
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(tree|blob)\/([^\/]+)(?:\/(.+))?)?/

export function isGitHubUrl(url: string): boolean {
  return GITHUB_URL_REGEX.test(url.trim())
}

export function parseGitHubUrl(url: string): GitHubRepo | null {
  const match = url.trim().match(GITHUB_URL_REGEX)
  if (!match) return null

  const [, owner, repo, , branch, path] = match

  // Owner and repo are always captured by the regex if match exists
  if (!owner || !repo) return null

  return {
    owner,
    repo: repo.replace(/\.git$/, ''),
    branch: branch || 'main',
    path: path || undefined,
  }
}

export function buildGitHubApiUrl(repo: GitHubRepo): string {
  const base = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents`
  const path = repo.path ? `/${repo.path}` : ''
  return `${base}${path}?ref=${repo.branch}`
}

export function buildGitHubTreeApiUrl(repo: GitHubRepo): string {
  return `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${repo.branch}?recursive=1`
}
