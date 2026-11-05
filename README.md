# Overseer

Overseer is one page that answers two questions for Simon: what needs me, and where is each project. It is a single pinned claude.ai Artifact, plain HTML, with no server behind it.

Simon runs many Claude Code sessions on many repositories. Some run on cloud containers, some on his Mac through Remote Control, some drive the Windows PC. Each session knows its own state. Nothing today shows all of them at once. Overseer is that view.

The page reads live data as the viewer through claude.ai connectors, using the Artifact runtime's `mcp` capability. It uses the built-in "Claude Code Remote" connector (sessions, repos, scheduled tasks, events, messages) and the "GitHub" connector (pull requests, branches, commits). Sessions report into it by writing small documents to the page's own database (the `db` capability) with the `ArtifactData` tool, from inside any Claude Code session on any machine. Simon's own notes and priorities live in the same database.

## The three layers

1. **Live session feed.** Zero cooperation. `list_sessions` returns every session on the account with its status bucket (working, blocked, review_ready, completed, failed), an unread flag, a one-line recent-action summary and, when the session is waiting on Simon, a needs-action line.
2. **GitHub layer.** Zero cooperation. Per repository: last push, open pull requests and their checks, and unmerged `claude/*` branches, which is the abandoned-work detector.
3. **Session protocol.** Needs cooperation. Each session writes one document to the Overseer database at handoff or end of turn. It carries repo, machine, branch, unpushed and uncommitted flags, services left running, items waiting on Simon, next steps and a timestamp. A shared skill and one line in Simon's global CLAUDE.md make it a habit. See `docs/PROTOCOL.md`.

## Deployment

The page source lives at `page/overseer.html`. It is published as an Artifact from a Claude Code session with the Artifact tool, declaring the `mcp` and `db` capabilities. Republishing the same file updates the page in place, so the URL is stable. Once the page is published its URL goes on the line below and in `docs/PROTOCOL.md`, and sessions write to it.

ARTIFACT_URL: https://claude.ai/artifact/AQEzPc9KAg8UewgEDPL4RQ

The page declares the GitHub connector as "GitHub". That name is unverified until the page is first opened.

## Repo layout

```
README.md                         this file
CLAUDE.md                         repo facts plus Simon's standing rules
HANDOFF.md                        state of play and republish instructions
.gitignore
docs/PLAN.md                      what Overseer shows, the data layers, the phases
docs/PROTOCOL.md                  v0 handoff protocol: document paths, fields, tagging, freshness
docs/GLOBAL-CLAUDE-MD-SNIPPET.md  the lines Simon pastes into his global CLAUDE.md
skills/overseer-handoff/SKILL.md  the Claude Code skill a session runs at handoff
page/                             the page source (published as the Artifact)
```

## Docs

- [Plan](docs/PLAN.md)
- [Handoff protocol](docs/PROTOCOL.md)
- [Global CLAUDE.md snippet](docs/GLOBAL-CLAUDE-MD-SNIPPET.md)
- [Handoff skill](skills/overseer-handoff/SKILL.md)
