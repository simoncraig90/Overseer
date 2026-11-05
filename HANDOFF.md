# HANDOFF

Updated 2026-11-05, later (cloud session, branch `overseer/phase-1-2`).

## Where things stand

- Phase 0 is live: https://claude.ai/artifact/AQEzPc9KAg8UewgEDPL4RQ reads sessions, repos and
  scheduled tasks through the Claude Code Remote connector. Source: `page/overseer.html`.
- Phase 1 (GitHub layer) and Phase 2 (store, handoff protocol, notes) are published (artifact version 2)
  from this branch, commit fea99c9. Verified locally with a stubbed runtime (screenshots, no script
  errors, notes editor writes the right document). Not verified: the real connector calls from the
  page, which only run as the viewer on claude.ai.
- The store holds this session's own report at `projects/overseer` and `sessions/<id>`, written
  with ArtifactData per `docs/PROTOCOL.md`, and this session carries the tag `project:overseer`.

- Red team done: two reviews, 20 findings, 15 fixed, see `docs/REDTEAM-2026-11-05.md`. Page is
  artifact version 3, commit 3b365f5. `tools/redteam.js` (adversarial inputs) and `tools/shot.js`
  (render with stub data) rerun the checks; both green.

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

- The GitHub tool arguments and fields the page uses come from one real probe in this session
  (`docs/PHASE1-GITHUB-PROBE.md`), not from the page itself.

- Phase 3 (buttons that message a session, nightly roll-up task) and Phase 4 (history strip).
- The handoff skill is not installed on any machine yet. See `docs/GLOBAL-CLAUDE-MD-SNIPPET.md`.
