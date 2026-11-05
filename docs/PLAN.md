# Overseer plan

## Purpose

One pinned page that shows every Claude Code session and every repository Simon works on, and puts the things that need him at the top. No server. The page reads live data as the viewer through claude.ai connectors and keeps its own small database for session reports and Simon's notes.

## Data layers

The layers are ordered by how much cooperation they need from sessions.

### 1. Live session feed (zero cooperation)

`list_sessions` from the Claude Code Remote connector returns every session on the account, cloud containers and the Mac bridge alike. Each row carries:

- a status bucket: working, blocked, review_ready, completed or failed
- an unread flag
- a one-line summary of the most recent action
- sometimes a needs-action line, when the session is waiting on Simon

This is enough for the inbox and for a first grouping into projects. Nothing has to change in any repo for it to work.

### 2. GitHub layer (zero cooperation)

Per repository, through the GitHub connector:

- last push time
- open pull requests and the state of their checks
- `claude/*` branches with commits not merged into the default branch

The last item is the abandoned-work detector. A session that pushed a branch and never opened a pull request leaves exactly this trace.

### 3. Session protocol (needs cooperation)

Each session writes one document to the Overseer database at handoff or at the end of a turn. It does this from any machine with the `ArtifactData` tool, so it does not depend on anything being pushed. The fields are:

- repo
- machine
- branch
- unpushed (bool)
- services or background processes left running
- items waiting on Simon
- next steps
- timestamp

A shared handoff skill does the writing. One line in Simon's global CLAUDE.md tells every session to run it. Several of his repos already keep a HANDOFF.md, so this formalises a habit that exists. The full field list is in `PROTOCOL.md`.

## Mapping sessions to projects

Session titles are freeform: "Cloud", "SEO", "Personal01", "Soulstone02", "Wrackline06". They do not name a repository reliably. Two fixes:

1. Sessions tag themselves `project:<repo>` on start with `set_session_tags`. The dashboard filters on that tag.
2. The page holds an editable mapping table, title pattern to project, for sessions that predate the rule.

In Phase 0, before either fix exists, the page infers the project by stripping trailing digits from the title.

## What the page shows

**Needs me.** An inbox at the top. Sessions that are blocked, review-ready or unread, each with its needs-action text when there is one and a direct link to the session.

**Project lanes.** One lane per project: the latest session and which machine it is on, its status, its last summary, the branch, the age of the last push, open pull requests, and the protocol fields from the latest handoff document.

**Risk flags.** Unpushed work on a session older than a day. A `claude/*` branch with unmerged commits. Services left running. A handoff document older than the latest session activity for that project.

**Scheduled tasks.** Each task with its last run result.

**Machines.** PC, Mac and edge-lab, online or not.

**History strip.** Sessions per project per week, short.

## What makes it useful

- Actions from the page: send a session a fixed message ("status?" or "push and hand off"), fire a scheduled task, archive a session.
- Simon's annotations per project: priority, parked, target date, a note. Lanes sort by his priority.
- A nightly roll-up scheduled task that writes a digest and sends a push notification only when something needs him.
- One handoff habit for all projects instead of a different one per repo.

## Phases

| Phase | Scope | Effort | Status |
| --- | --- | --- | --- |
| 0 | Read-only page on the live session feed. Needs-me inbox and project grouping by title. | An afternoon | live |
| 1 | GitHub layer. Abandoned-branch and unpushed flags. | A day | in progress |
| 2 | Database, handoff protocol, shared skill, Simon's annotations. | A day, plus adoption | in progress |
| 3 | Buttons that message sessions, fire tasks and archive. Nightly roll-up. | Half a day | not started |
| 4 | History strip and metrics. | As wanted | not started |

## Unverified

- Whether a page's call to `list_sessions`, running under the viewer's grant, returns Mac bridge sessions the same way the call does from inside a session.
- The exact display name of the GitHub connector as the page must reference it.
- Session summaries are not always populated. When one is missing the inbox falls back to the status bucket plus the unread flag.
