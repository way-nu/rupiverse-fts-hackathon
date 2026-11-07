# ClickUp setup (10 minutes, free plan)

ClickUp is the squad's single source of truth: every ticket, spec and agent report lives there.
The agents call the ClickUp REST API with curl, reading the token from `~/.config/rupiverse/clickup.env` (written by `setup.sh`).

1. **Workspace.** Create a free ClickUp workspace.
2. **Space.** Create a Space named `RupiVerse`.
3. **List.** In it, create a List named `Features`. Open the List's **⋯ → Task statuses → Use custom statuses**, and add, in order:

   | Group | Statuses |
   | --- | --- |
   | Not started | `BACKLOG`, `READY` |
   | Active | `TEST DESIGN`, `BUILDING`, `TESTING`, `IN REVIEW`, `PM VERIFY`, `AWAITING MERGE`, `BLOCKED` |
   | Closed | `COMPLETE` |

   Keep `BLOCKED` in **Active**, not Done, or ClickUp counts blocked work as finished.
4. **Specs folder.** In the `RupiVerse` space, create a Folder named `Specs`. The PM keeps one Spec Doc per ticket there, with four report pages inside it (Build log, Test report, Review, PM verification).
5. **Starter ticket.** `setup.sh` finds the `Features` list in the `RupiVerse` space and adds **RV5 · Theme toggle** to BACKLOG. If your names differ, pass `--clickup-list-id <id>`.
6. **API token.** Avatar → **Settings → Apps → API Token → Generate**. Copy the `pk_…` value; `setup.sh` asks for it and stores it in `~/.config/rupiverse/clickup.env` (chmod 600).

## Why the REST API, not the ClickUp MCP server

On the Free Forever plan the ClickUp MCP server allows about 100 calls per 24 hours for the whole workspace, and four agents use that up in an hour. The REST API has no daily cap (100 requests per minute per token); agents wait 60 s and retry on HTTP 429.

## Free-plan limits to keep in mind

- **Storage is small:** never attach screenshots or files to tickets. Evidence lives on the PR; ClickUp gets links.
- **One token is shared by all four agents:** 100 requests per minute is plenty for handoffs.
