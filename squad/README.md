# The RupiVerse squad: four AI agents and you, in Slack, through Switch

A test-first dev team that runs in team chat. In `#rupiverse-research` the **PM** agent reads what users say about competing apps and ranks what to build. In `#rupiverse-hq` you pick a feature; the PM turns it into a ClickUp ticket and spec, then opens a Switch room for that ticket where a **Builder**, a **Tester** and a **Reviewer** take it to a pull request that only you can merge. Each agent works on each ticket in its own worktree, ports and database, so several feature rooms can be open at once.

```
you ──review / competitor──▶ #rupiverse-research ── pm: ranked opportunities doc in ClickUp
                          │ you pick one
                          ▼
you (Slack) ──ask──▶ #rupiverse-hq ── pm writes ticket + spec in ClickUp
                          │
                 "approved, start RV<n>"
                          ▼
            pm runs the Switch template "rupiverse-feature-room"
                          ▼
   #rv<n>-<slug>:  builder finalises the API contract
                   tester writes failing tests (draft PRs)
                   builder builds FE + BE in parallel until they pass
                   tester verifies, reviewer reviews, pm checks every acceptance criterion
                          ▼
                  you squash-merge to master
```

**Agents can't grade their own homework.** The tests are written first, by a different agent, against a contract the builder fixed in advance. The builder may change how a test reaches the code, never what it checks, and the reviewer rejects any loosened assertion.

## What's in this folder

| Path | What it is |
| --- | --- |
| `templates/squad.template.yaml` | Switch template: creates the four agents (each with its own clone of your repo, model and instructions) and `#rupiverse-hq` |
| `templates/feature-room.template.yaml` | Switch template the PM runs per ticket: the room, its instructions, a `playbook` room document, and the kickoff |
| `templates/research-room.template.yaml` | Switch template for `#rupiverse-research`, where the PM turns competitors' reviews into ranked feature ideas |
| `agents/*.md` | Each agent's full instructions. The agents read them from the repo at the start of every session |
| `setup.sh` | Everything Switch doesn't do: per-agent permissions, `.env` files, Postgres databases, the ClickUp token, GitHub labels |
| `claude/settings.local.json.tmpl` | Claude Code permissions per clone: what agents may do, and what they may never do |
| `docs/clickup-setup.md` | The ClickUp space, statuses and token |
| `demo/RV5-theme-toggle.md` | A starter ticket. `setup.sh` puts it in your ClickUp BACKLOG so you can watch the squad build it |

## Setup (about 30 minutes)

### You need
- macOS or Linux, with Docker (for Switch's local server) and a local PostgreSQL 13+ (`brew install postgresql@17`)
- [Switch Console](https://docs.switchagents.ai/switch-rooms/getting-started), with a server running
- Claude Code signed in (`claude auth login`), the GitHub CLI signed in (`gh auth login`), Node 20+, `uv`
- A Slack workspace you can install apps in (or use the Mattermost that ships with Switch)
- A free ClickUp workspace

### 1. Fork the app repo
Fork this repository. The agents push branches and open PRs on your fork. In the fork's **Settings → General → Pull Requests**, allow **squash merging only**, and add a branch rule on `master` that requires a pull request.

### 2. Connect your chat app to Switch
Switch Console → server **Home → Messaging apps → Connect**. For Slack, follow [Connect Slack](https://docs.switchagents.ai/switch-rooms/deploy/messaging-apps/slack) and link your own Slack account when asked.

### 3. Create the squad from the template
Switch Console → **Templates → Import** `squad/templates/squad.template.yaml` → **Use**. Fill in:
- **repo**: your fork's HTTPS URL
- **bridge**: your Slack (or Mattermost) connection

Under the advanced options you can set the models (Sonnet for Tester and Reviewer saves usage) and the agents' directory. Note the folder that holds the four agent folders; `setup.sh` needs it.

This creates `pm`, `builder`, `tester` and `reviewer`, each in its own clone, plus `#rupiverse-hq` with you and the PM in it.

### 4. Set up ClickUp
Follow [`docs/clickup-setup.md`](docs/clickup-setup.md) and keep the API token handy.

### 5. Run the setup script
From any clone of the repo:
```bash
./squad/setup.sh --root <folder holding pm/ builder/ tester/ reviewer/>
```
It asks for the ClickUp token once, installs each clone's dependencies and git hooks (backend hook needs git 2.54+), and keeps agent-local files out of git. Useful options: `--pg-admin <postgres URL>` (if your local Postgres superuser isn't `$USER`), `--db-password`, `--skip-db`, `--skip-clickup`, `--skip-labels`, `--skip-deps`. It is safe to run again.

### 6. Say hello
In Switch Console, stop any running squad sessions so they pick up the new permissions. Then, in `#rupiverse-hq`:
```
@pm hello
```
The PM checks ClickUp, saves the `rupiverse-feature-room` and `rupiverse-research-room` templates, opens `#rupiverse-research`, and tells you how to ask for work.

### 7. Watch the squad build the starter ticket
`setup.sh` created **RV5 · Theme toggle** in your ClickUp BACKLOG (from [`demo/RV5-theme-toggle.md`](demo/RV5-theme-toggle.md)). Open it in ClickUp, then in `#rupiverse-hq`:
```
@pm pick up RV5 from BACKLOG. Ask me what you need, then start it.
```
Answer the PM's questions and approve. A room `#rv5-…` appears; watch the contract, the failing tests, the build, the review, and the PR waiting for your merge. Expect roughly an hour of agent time.

To add your own starter tickets, drop more `RV<n> · Title` files into `squad/demo/` and run `setup.sh` again.

## Running on a cloud machine

Everything above can run on a remote Linux host instead of your laptop: AWS EC2, Google Cloud, DigitalOcean, Azure or any VPS you can SSH into (Ubuntu 22.04/24.04; start at 2 vCPU, 4 GB RAM, 20 GB disk, and give it more if four agents will run tests at once).

1. Get SSH to the machine working from your terminal, and install Docker and PostgreSQL on it.
2. Switch Console → **Settings → Remote hosts → Add host**, pick its SSH alias, install what it reports missing, and wait for **Ready** ([Switch docs](https://docs.switchagents.ai/switch-rooms/deploy/host-remotely)). Run your Switch server there too if you want rooms to stay live with your laptop closed.
3. On the host, sign in to Claude Code and `gh`. Switch doesn't clone onto a remote host, so clone your fork four times there (`pm/`, `builder/`, `tester/`, `reviewer/` under one folder).
4. Use `squad.template.yaml` with **location** set to that host and **directory** pointing at those clones.
5. Run `./squad/setup.sh --root <that folder>` on the host.

You keep working in Slack. When a PR is ready, pull its branch into any IDE on your own machine, or review it on GitHub, and merge.

## Using it

0. **Research (optional).** In `#rupiverse-research`, paste a review, a screenshot or a competitor's name, or ask `@pm what do users of budgeting apps keep asking for?`. The PM writes a ranked research Doc in ClickUp (every quote linked) and posts the top 5. Pick one and it becomes a BACKLOG ticket.
1. **Ask** in `#rupiverse-hq`, e.g. `@pm users want to export their transactions as CSV`.
2. **Answer the PM's questions.** It writes the ticket, the Spec and four report pages in ClickUp, then posts the links.
3. **Approve**: `@pm approved, start RV<n>`. A room `#rv<n>-<slug>` appears with the squad already working.
4. **Watch or don't.** Every handoff names the next agent, the PR and the commit. Feedback lives on the PR. Questions about scope go to the PM, technical ones to the Builder.
5. **Merge.** When the ticket reaches `AWAITING MERGE`, review the PR, test on staging if you like, and squash-merge. The PM closes the ticket and posts the numbers.

In chat apps without autocomplete (free Slack), type agent names in full: `@pm`, `@builder`, `@tester`, `@reviewer`. A 👀 on your message means an agent picked it up.

## Why it doesn't loop or go rogue

| Guard | Enforced by |
| --- | --- |
| Only one agent acts per ticket status; the rest reply "not my stage" | Agent instructions + the room's playbook |
| Hard caps: 3 bug rounds, 2 review rounds, 1 clarification round, then the PM, then you | Agent instructions |
| Every handoff carries a PR number and a commit SHA; nobody acts twice on the same SHA | Agent instructions |
| Tests are written first by a different agent; loosened tests are rejected | Tester + Reviewer instructions |
| An agent that tries to create the same room twice pauses the whole run until you continue it | **Switch** (built into template runs) |
| Agents can never merge, push to `master`, or force-push | **Claude Code permissions** (`settings.local.json` deny list) |
| Agents only talk to their owner and each other | **Switch** addressing (`owner-agents`) |
| Two feature rooms never collide | Each agent works per ticket in `.worktrees/rv<n>-<part>`, on ports `8000/9000 + 10·n + agent` and database `rupiverse_<agent>_rv<n>` |
| "STOP" from you halts everyone; only you merge | Room instructions + permissions |

## Free-plan limits

| Service | Limit that matters | How the squad handles it |
| --- | --- | --- |
| Claude | Usage windows; four agents use them fast | Run Tester and Reviewer on Sonnet; keep tickets small |
| ClickUp | MCP: ~100 calls/day. REST: 100 requests/min | Agents call the REST API with curl, never the MCP server |
| Slack (free) | No agent-name autocomplete | Type names in full |
| Supabase (free) | Pauses after 7 days of low activity | Unpause it in the dashboard; agents use local Postgres anyway |

## Troubleshooting

- **An agent says it's blocked on a permission:** a command isn't in the allow list. Add it to `squad/claude/settings.local.json.tmpl` (through a PR), rerun `setup.sh`, and restart that agent's session.
- **An agent doesn't answer:** check the name's spelling, that its session is running in Switch Console, and that the ticket is in that agent's status.
- **The PM can't run the template:** ask it to `list_templates`. If `rupiverse-feature-room` is missing, ask it to save `squad/templates/feature-room.template.yaml` again.
- **ClickUp calls fail:** run `curl -sS https://api.clickup.com/api/v2/team -H "Authorization: $(sed -n 's/^CLICKUP_TOKEN=//p' ~/.config/rupiverse/clickup.env)"` yourself. A 401 means the token is wrong.
