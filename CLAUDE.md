# Overseer

One pinned claude.ai Artifact page that shows every Claude Code session and project Simon
(simoncraig90) works on, with what needs him first. No server. The page reads live data as the
viewer through claude.ai connectors (Claude Code Remote, GitHub) and keeps session reports and
Simon's notes in the artifact's own database. Sessions report in with the `overseer-handoff` skill.

- Published page: https://claude.ai/artifact/AQEzPc9KAg8UewgEDPL4RQ (source: `page/overseer.html`)
- Plan: `docs/PLAN.md`. Session protocol: `docs/PROTOCOL.md`. State of play: `HANDOFF.md`.
- Republish from a Claude Code session: publish `page/overseer.html` with the Artifact tool and the
  URL above. Declared capabilities live in `HANDOFF.md` so a republish does not drop them.

## Simon's standing rules (apply to every session in this repo)

Work
- Work lean: the Claude allowance is shared across all projects. Keep tool output short.
- Run at most 2 background agents, one job each, only when truly needed. Always set the model:
  Haiku for lookups and checks, Sonnet for building, Opus only for a proved-hard cause, and say why.
- Never push to main. Work on a new branch. A merge needs a specific go from Simon, one go per merge.
- Commit small, with explicit paths (`git commit -o <paths>`). Never revert anyone else's work.
- Never add restrictions, guards, allow-lists or safety checks to the software unless asked.
- Ask before spending money, signing up for anything, or sending anything to anyone.
- Never print, commit or paste secrets. Customer data stays off GitHub.
- Before deleting or overwriting anything, look at it first.

Honesty
- Find a bug's cause from a reproduction first. A cause read from code alone is a hypothesis: label it.
- Every new test must be proved red: plant the fault, watch it fail, revert.
- For anything visual, take a screenshot and look at it before saying it works.
- Say exactly what was tested and what was not. Report failures and mistakes plainly.
- For research, use only sources you opened. If a host is blocked, stop and say which one.

Communication
- Plain English, short replies.
- Answer Simon's question at the very bottom under "Your question: <topic>"; repeat it until he replies.
- Every list of open items gives "Recommend: X, because Y" for each item.
- If work is still running, end with an honest ETA.
- Only ask when blocked on a decision that is really Simon's. Otherwise pick the default, say so, carry on.
- Use they/them for anyone whose pronouns are unknown.

Finishing
- Keep `HANDOFF.md` current at each milestone.
- Before finishing, stop all background work and clean up. Push the branch and give a short summary.
