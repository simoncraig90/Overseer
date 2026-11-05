# HANDOFF

Updated 2026-11-05 (cloud session, branch `overseer/phase-1-2`).

## Where things stand

- Phase 0 is live: https://claude.ai/artifact/AQEzPc9KAg8UewgEDPL4RQ reads sessions, repos and
  scheduled tasks through the Claude Code Remote connector. Source: `page/overseer.html`.
- Phase 1 (GitHub layer) and Phase 2 (database, handoff protocol, notes) are in progress on this branch.

## Republishing the page

Publish `page/overseer.html` with the Artifact tool and `url` set to the artifact above. Pass the
capabilities again or they are kept from the stored declaration (omit `capabilities` to keep them).
Current declaration:

```json
{"mcp": {"servers": [
   {"server": "Claude Code Remote", "tools": ["list_sessions", "list_repos", "list_triggers"]},
   {"server": "GitHub", "tools": ["list_pull_requests", "list_branches"]}]},
 "db": {}, "user": {}}
```

## Open items

- The GitHub connector display name is assumed to be "GitHub". Unverified from the cloud session.
  Recommend: open the page and check the GitHub section once, because the page says exactly which
  connector it could not reach if the name is wrong.
- Overseer's first commit went to `main` directly (the repo was empty). Recommend: leave it and
  branch from it, because rewriting the only commit buys nothing.

## Not done

- Phase 3 (buttons that message a session, nightly roll-up task) and Phase 4 (history strip).
- The handoff skill is not installed on any machine yet. See `docs/GLOBAL-CLAUDE-MD-SNIPPET.md`.
