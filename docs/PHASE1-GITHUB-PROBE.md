# GitHub MCP probe — 2026-11-05

Real calls made (read-only) against `simoncraig90/soulstone-lab`:
`get_me` (no args), `list_pull_requests` (state=all, perPage=5),
`list_branches` (perPage=20), `list_commits` (perPage=5).
Tool names as exposed in this session: `mcp__github__<name>`.

Conventions observed in all four: argument names are camelCase for paging
(`perPage`, `page`), snake_case elsewhere; `owner` and `repo` are the only
required args; every response is a bare JSON array (list tools) or object
(`get_me`), with no envelope and no pagination metadata — paging is
"ask for page+1 until an array shorter than perPage comes back".
Timestamps are ISO 8601 UTC strings ending in `Z`.

---

## 1. `get_me`

### Input
No parameters.

### Response (observed)
```
object
  login        string   "simoncraig90"
  id           number   251206523
  profile_url  string   "https://github.com/simoncraig90"
  avatar_url   string   "https://avatars.githubusercontent.com/u/251206523?v=4"
  details      object
    public_repos  number  6
    public_gists  number  0
    followers     number  0
    following     number  0
    created_at    string  "2025-12-23T16:51:12Z"
    updated_at    string  "2025-12-23T17:03:39Z"
```
Login returned: **`simoncraig90`**. Note: this is a trimmed shape, not the raw
REST `/user` object (no `name`, `email`, `html_url`; the URL is `profile_url`).

---

## 2. `list_pull_requests`

### Input
| name        | type              | required | notes |
|-------------|-------------------|----------|-------|
| owner       | string            | yes      | |
| repo        | string            | yes      | |
| state       | enum string       | no       | `open` \| `closed` \| `all` |
| head        | string            | no       | filter by `user:branch` |
| base        | string            | no       | filter by base branch |
| sort        | enum string       | no       | `created` \| `updated` \| `popularity` \| `long-running` |
| direction   | enum string       | no       | `asc` \| `desc` |
| perPage     | number (1..100)   | no       | |
| page        | number (>=1)      | no       | |
| fields      | string[] (enum)   | no       | subset of per-PR fields; omit = all |

`fields` enum (this is the complete list of per-PR keys the tool can emit):
`number, title, body, state, draft, merged, mergeable_state, html_url, user,
labels, assignees, requested_reviewers, merged_by, head, base, additions,
deletions, changed_files, commits, comments, created_at, updated_at,
closed_at, merged_at, milestone`.

### Response
Observed: `[]` — the repo has **no pull requests** (open or closed), so the
per-item shape could NOT be observed from a real payload. What follows is
derived from the tool's own `fields` enum (authoritative for key names) plus
the GitHub REST PR object those keys mirror (types marked "expected").

```
array of object
  number           number   (expected) 12
  title            string
  body             string | null   (largest field; drop via `fields`)
  state            string   "open" | "closed"   (NO "merged" state — use `merged`/`merged_at`)
  draft            boolean
  merged           boolean
  mergeable_state  string   e.g. "clean" | "dirty" | "blocked" | "unstable" | "unknown"
  html_url         string
  user             object   { login, id, profile_url?/html_url?, avatar_url } (trimmed, like get_me)
  labels           array of { name, color, ... }
  assignees        array of user
  requested_reviewers array of user
  merged_by        user | null
  head             object   { ref string, sha string, label?, repo? }   -> head branch name is head.ref
  base             object   { ref string, sha string, label?, repo? }   -> base branch name is base.ref
  additions        number
  deletions        number
  changed_files    number
  commits          number
  comments         number
  created_at       string ISO
  updated_at       string ISO
  closed_at        string ISO | null
  merged_at        string ISO | null
  milestone        object | null
```

Specific answers:
- **state**: `state` ("open"/"closed"); merged-ness via `merged` boolean and `merged_at`.
- **draft**: `draft` boolean.
- **head ref / base ref**: `head.ref`, `base.ref` (nested; also `head.sha`, `base.sha`).
- **updated_at**: `updated_at` (also `created_at`, `closed_at`, `merged_at`).
- **html_url**: `html_url`.
- **checks**: NOT present. No check-run / status / CI field in the enum. Use
  `get_check_run` / `actions_list` or `pull_request_read` for that.
- **mergeable state**: `mergeable_state` IS listed in the `fields` enum, so it
  is emitted; whether it is populated on list calls (GitHub's REST list
  endpoint normally omits it; only the single-PR endpoint computes it) is
  **unverified** — expect `"unknown"`/missing and fall back to
  `pull_request_read` per PR if you need it reliably.
- Age of a PR = now − `created_at`; staleness = now − `updated_at`.

---

## 3. `list_branches`

### Input
| name    | type            | required |
|---------|-----------------|----------|
| owner   | string          | yes |
| repo    | string          | yes |
| perPage | number (1..100) | no |
| page    | number (>=1)    | no |

No filter, sort or `protected` argument.

### Response (observed, 2 items)
```
array of object
  name       string   "ideas-borrow"
  sha        string   "8e79ad6239fbf0e127877301f1841d885627dedf"
  protected  boolean  false
```
(Second item: `main` / `443832eae400fad05fab6bb21dae136234c2a712` / false.)

Specific answers:
- **Commit sha**: YES, as a flat top-level `sha` (not REST's `commit.sha`).
- **Ahead/behind of default branch**: NO. Nothing in the response indicates
  ahead/behind, merge status, last-commit date, or which branch is the
  default. There is also no `compare` tool in this server's tool list.
  Workarounds:
  - "merged into main" ≈ `list_commits` with `sha=main` and check whether the
    branch's `sha` appears (only works for fast-forward/merge-commit history
    within the pages you fetch; squash-merged branches never match).
  - Default branch must be assumed (`main`) or taken from elsewhere; the
    tool does not say.
  - Last activity per branch: `list_commits` with `sha=<branch>`, `perPage=1`,
    read `commit.committer.date` (one extra call per branch).

---

## 4. `list_commits`

### Input
| name    | type            | required | notes |
|---------|-----------------|----------|-------|
| owner   | string          | yes | |
| repo    | string          | yes | |
| sha     | string          | no  | branch, tag or commit sha; default = default branch |
| author  | string          | no  | login or email filter |
| path    | string          | no  | only commits touching this path |
| since   | string          | no  | ISO 8601 (`YYYY-MM-DD` ok) |
| until   | string          | no  | ISO 8601 |
| perPage | number (1..100) | no  | description says 30 default |
| page    | number (>=1)    | no  | |
| fields  | string[] (enum) | no  | `sha, html_url, commit, author, committer` |

### Response (observed, 5 items; newest first)
```
array of object
  sha        string   "443832eae400fad05fab6bb21dae136234c2a712"
  html_url   string   "https://github.com/simoncraig90/soulstone-lab/commit/443832ea..."
  commit     object
    message    string   "Rebuild plan: procs on conditions\n\nCo-Authored-By: ..."   (full body, newline-separated; first line = subject)
    author     object
      name   string   "Simon Craig"
      email  string   "simon@Simons-MacBook-Pro.local"
      date   string   "2026-10-21T02:12:06Z"
    committer  object
      name   string   "Simon Craig"
      email  string   "simon@Simons-MacBook-Pro.local"
      date   string   "2026-10-21T02:12:06Z"
  author     object | (null when email not linked to a GitHub account)
    login        string  "scsmncao"
    id           number  7018790
    profile_url  string  "https://github.com/scsmncao"
    avatar_url   string
  committer  object | null   same shape as author
```
Not present (vs REST): `commit.tree`, `commit.verification`, `parents`,
`stats`, `files`, `node_id`, `url`/`comments_url`.

Specific answers:
- **Author date**: `commit.author.date` (push/rebase time is
  `commit.committer.date`; both identical here).
- **Message**: `commit.message` (full message; split on first `\n` for subject).
- Side note: the top-level `author.login` is `scsmncao`, not `simoncraig90` —
  the commit email maps to a different GitHub account than the token owner.
  Do not use `author.login` to identify "Simon's" commits; use
  `commit.author.name`/`email` or accept both logins.

---

## What the shapes allow (dashboard implications)

- **Last commit date per repo**: 1 call — `list_commits(perPage=1)` →
  `[0].commit.committer.date` (or `.author.date`) + `[0].commit.message`.
- **Open PRs with age**: 1 call — `list_pull_requests(state="open",
  sort="updated", direction="desc", fields=[number,title,draft,html_url,
  head,base,created_at,updated_at,user])`; age = now − `created_at`. No CI
  status in the list; `mergeable_state` may be unpopulated.
- **Unmerged `claude/*` branches**: `list_branches` gives name+sha only, so:
  1. filter `name.startsWith("claude/")`;
  2. "has an open PR?" → match `head.ref` from `list_pull_requests(state="all")`
     (`merged`/`merged_at` tells you if it landed);
  3. "merged without PR / contained in main?" cannot be read directly — the
     closest is scanning `list_commits(sha="main", perPage=100)` for the
     branch `sha` (misses squash merges). There is no ahead/behind signal.
  Branch last-activity needs one `list_commits(sha=branch, perPage=1)` per branch.
