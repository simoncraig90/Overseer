---
name: overseer-handoff
description: Write this session's state to the Overseer dashboard at handoff. Use when Simon says "handoff", "hand off", "end of session", or "write status to Overseer", and before leaving a session idle with anything running.
---

# Overseer handoff

Write one `projects/<repo>` and one `sessions/<session_id>` document to the Overseer database. Fields are in `docs/PROTOCOL.md`. The page is https://claude.ai/artifact/AQEzPc9KAg8UewgEDPL4RQ.

## Procedure

1. **Facts from git.** Run:

   ```
   git rev-parse --abbrev-ref HEAD
   git rev-list --count @{u}..HEAD 2>/dev/null || echo unknown
   git status --porcelain | wc -l
   ```

   Branch is the first output. `unpushed` is true if the count is above 0 or is `unknown`. `uncommitted` is true if the last count is above 0.
2. **Repo.** The repository name, lowercase, without owner. With no GitHub repo, use a short lowercase slug of the project name.
3. **Session id and URL.** Take the id from the session's own context (`get_session` with no id if needed). The URL is `https://claude.ai/code/<session_id>`.
4. **Machine.** `cloud` when running in a cloud container, otherwise the machine's hostname in lowercase.
5. **From the conversation.** `running` (services left running), `waiting_on_simon` (items only he can resolve), `next` (two to five steps), `summary` (one line).
6. **Write.** Load the tool with `ToolSearch` query `select:ArtifactData`. Make two `set` calls with `url` https://claude.ai/artifact/AQEzPc9KAg8UewgEDPL4RQ.

   First, `collection` `projects`, `doc_id` `<repo>`, `data`:

   ```json
   {
     "repo": "example-repo",
     "project": "Example project",
     "session_id": "session_EXAMPLE",
     "session_url": "https://claude.ai/code/session_EXAMPLE",
     "machine": "cloud",
     "branch": "claude/example-branch",
     "unpushed": false,
     "uncommitted": true,
     "running": [],
     "waiting_on_simon": ["example: approve the example change"],
     "next": ["example next step"],
     "summary": "Example one-line summary.",
     "updated_at": "2026-01-01T00:00:00Z"
   }
   ```

   Second, `collection` `sessions`, `doc_id` `<session_id>`, `data` with `repo`, `session_id`, `session_url`, `machine`, `branch`, `unpushed`, `uncommitted`, `summary`, `updated_at` and `title` (the session title). `updated_at` is now, ISO 8601 UTC.
7. **Tag.** Call `mcp__claude-code-remote__set_session_tags` with `session_ids` [own id] and `add` ["project:<repo>"].
8. **Reply.** Three lines to Simon: where the work stands, what is waiting on him, what is still running. Nothing else.

## Rules

- `set` replaces the document. Send every field each time.
- Never write the `notes` collection. Only Simon writes it, from the page.
- Never put secrets, tokens or file contents in a document.
- If a write fails, say so in the reply and give the JSON.
