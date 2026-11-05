---
name: overseer-handoff
description: Write this session's state to the Overseer dashboard at handoff. Use when Simon says "handoff", "hand off", "end of session", or "write status to Overseer", and before leaving a session idle with anything running.
---

# Overseer handoff

Write one `projects/<repo>` document and one `sessions/<session_id>` document to the Overseer database, per `docs/PROTOCOL.md` in the Overseer repo. The page URL is OVERSEER_URL in that repo's README. If it still reads "not yet published", stop and tell Simon the dashboard has no URL yet.

## Steps

1. **Repo and branch.** Run `git rev-parse --show-toplevel` and `git remote get-url origin` to get the repository name, lowercase, without owner. Run `git branch --show-current` for the branch.
2. **Unpushed and uncommitted.** `git status --porcelain` non-empty means `uncommitted: true`. `git log @{upstream}..HEAD --oneline` non-empty, or no upstream at all, means `unpushed: true`.
3. **Machine.** `cloud` if this is a cloud container, `mac` if running under Remote Control on the Mac, `pc` or `edge-lab` if the work was driven there. Use the one where the files live.
4. **Running.** List every service, dev server, game process or background task this session started and did not stop. Empty array if none.
5. **Waiting on Simon.** Short items only he can resolve: approvals, decisions, a go-ahead, a credential. Take them from the conversation.
6. **Next.** Two to five short next steps.
7. **Summary.** One line on where the work stands.
8. **Session id and URL.** Call `get_session` with no id; take `session_id` and build `https://claude.ai/code/<session_id>`.
9. **Write.** Load the tool with `ToolSearch` query `select:ArtifactData`. Then one `batch` call to OVERSEER_URL with two `set` writes: `projects/<repo>` with the full field set, `sessions/<session_id>` with the subset plus `title`. `updated_at` is now, ISO 8601 UTC.
10. **Tag.** Call `set_session_tags` on this session to add `project:<repo>` if it is not already there.
11. **Reply.** Three lines to Simon: where the work stands, what is waiting on him, what is still running. Nothing else.

## Rules

- `set` replaces the document. Write the whole state, not a diff.
- Never put secrets, tokens or file contents in the document.
- If the write fails, say so in the reply and give the JSON so Simon can see the state anyway.
