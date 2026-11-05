# Global CLAUDE.md snippet

Paste these lines into `~/.claude/CLAUDE.md`. They apply to every session on every repo.

```
## Overseer
- At session start, tag this session `project:<repo>` with set_session_tags, where <repo> is the GitHub repository name, lowercase.
- Before ending a session, handing off, or leaving anything running, run the `overseer-handoff` skill. It writes the project state to the Overseer dashboard.
```

Install the skill once by copying `skills/overseer-handoff/` into `~/.claude/skills/overseer-handoff/`.
