#!/usr/bin/env bash
# RupiVerse squad: local setup for everything Switch doesn't do itself.
#
# Run it AFTER squad.template.yaml has created the four agents (each with its own clone).
# It is safe to run again; every step skips what is already in place.
#
#   ./squad/setup.sh --root <folder holding pm/ builder/ tester/ reviewer/>
#
# Options:
#   --root DIR          Parent folder of the four agent clones (required)
#   --pg-admin URL      Postgres URL with rights to create roles and databases
#                       (default: postgresql://$USER@localhost:5432/postgres)
#   --db-password PW    Password for the "rupiverse" Postgres role (default: generated, printed once)
#   --skip-db           Don't touch Postgres
#   --skip-clickup      Don't ask for or check the ClickUp token
#   --skip-labels       Don't create GitHub labels
#   --skip-deps         Don't install dependencies and git hooks in the clones (slow on first run)
#   --clickup-list-id N Use this ClickUp list for the starter ticket instead of RupiVerse → Features
#
# What it does, per step:
#   1. Checks the tools the agents need (git, gh, psql, node, npx, uv, claude, curl, openssl).
#   2. Each clone: fetches every branch (Switch clones shallow, single-branch).
#   3. Each clone: writes .claude/settings.local.json (what the agent may and may never do).
#   4. ClickUp: stores your API token in ~/.config/rupiverse/clickup.env (chmod 600), checks it, and creates the
#      starter ticket(s) from squad/demo/*.md in BACKLOG (once; skipped if the RV number already exists).
#   5. Postgres: role "rupiverse" (CREATEDB) + one dev database per agent; tests make throwaway ones.
#   6. Each working clone: backend/.env and frontend/.env with that agent's ports and database.
#   7. GitHub: review:approved / review:changes labels.
#   8. Each working clone: local git ignores, then uv sync, npm install (husky hook) and the backend pre-commit hook.
set -euo pipefail

SQUAD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT=""
PG_ADMIN="postgresql://${USER:-$(whoami)}@localhost:5432/postgres"
DB_PASSWORD=""
SKIP_DB=0
SKIP_CLICKUP=0
SKIP_LABELS=0
SKIP_DEPS=0
CLICKUP_LIST_ID=""

while [ $# -gt 0 ]; do
    case "$1" in
        --root) ROOT="$2"; shift 2 ;;
        --pg-admin) PG_ADMIN="$2"; shift 2 ;;
        --db-password) DB_PASSWORD="$2"; shift 2 ;;
        --skip-db) SKIP_DB=1; shift ;;
        --skip-clickup) SKIP_CLICKUP=1; shift ;;
        --skip-labels) SKIP_LABELS=1; shift ;;
        --skip-deps) SKIP_DEPS=1; shift ;;
        --clickup-list-id) CLICKUP_LIST_ID="$2"; shift 2 ;;
        -h|--help) sed -n '2,31p' "$0"; exit 0 ;;
        *) echo "Unknown option: $1 (try --help)" >&2; exit 2 ;;
    esac
done

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  ✓ %s\n' "$*"; }
warn() { printf '  ! %s\n' "$*"; }
die()  { printf '  ✗ %s\n' "$*" >&2; exit 1; }

# set_env FILE KEY VALUE: replace KEY's line, or append it.
set_env() {
    local f="$1" k="$2" v="$3" tmp
    touch "$f"
    if grep -q "^${k}=" "$f"; then
        tmp="$(mktemp)"
        awk -v k="$k" -v v="$v" 'index($0, k"=") == 1 { print k "=" v; next } { print }' "$f" > "$tmp"
        mv "$tmp" "$f"
    else
        printf '%s=%s\n' "$k" "$v" >> "$f"
    fi
}
# get_env FILE KEY: the value, or empty.
get_env() { grep "^${2}=" "$1" 2>/dev/null | head -1 | cut -d= -f2- || true; }
secret() { openssl rand -base64 48 | tr -d '\n/+='; }

AGENTS=(pm builder tester reviewer)
WORKERS=(builder tester reviewer)
backend_port() { case "$1" in builder) echo 8001 ;; tester) echo 8002 ;; reviewer) echo 8003 ;; esac; }
web_port()     { case "$1" in builder) echo 8081 ;; tester) echo 8082 ;; reviewer) echo 8083 ;; esac; }

# ── 1. Tools ──────────────────────────────────────────────────────────────
say "1. Checking tools"
[ -n "$ROOT" ] || die "--root is required: the folder holding pm/ builder/ tester/ reviewer/"
ROOT="$(cd "$ROOT" && pwd)"
needed=(git gh node npx uv claude curl openssl)
[ "$SKIP_DB" = 1 ] || needed+=(psql)
for t in "${needed[@]}"; do
    if command -v "$t" >/dev/null 2>&1; then ok "$t"; else die "$t is not installed"; fi
done
if gh auth status >/dev/null 2>&1; then ok "gh is signed in"; else die "run: gh auth login"; fi

# ── 2. Clones ─────────────────────────────────────────────────────────────
say "2. Agent clones in $ROOT"
for a in "${AGENTS[@]}"; do
    d="$ROOT/$a"
    [ -d "$d/.git" ] || die "$d is not a git clone. Create the squad from squad.template.yaml first, or clone the repo there."
    git -C "$d" config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
    if [ "$(git -C "$d" rev-parse --is-shallow-repository)" = "true" ]; then
        git -C "$d" fetch --unshallow --quiet origin
    fi
    git -C "$d" fetch --all --prune --quiet
    ok "$a: all branches fetched"
done

# ── 3. Permissions ────────────────────────────────────────────────────────
say "3. Claude Code permissions (.claude/settings.local.json)"
for a in "${AGENTS[@]}"; do
    mkdir -p "$ROOT/$a/.claude"
    sed "s#__HOME__#$HOME#g" "$SQUAD_DIR/claude/settings.local.json.tmpl" > "$ROOT/$a/.claude/settings.local.json"
    ok "$a: allow branches/PRs/staging/ClickUp; deny merge, push to master, force-push"
done

# ── 4. ClickUp ────────────────────────────────────────────────────────────
if [ "$SKIP_CLICKUP" = 0 ]; then
    say "4. ClickUp"
    mkdir -p "$HOME/.config/rupiverse"
    envf="$HOME/.config/rupiverse/clickup.env"
    if [ -z "$(get_env "$envf" CLICKUP_TOKEN)" ]; then
        printf '  ClickUp API token (ClickUp → Settings → Apps → API Token, starts with pk_): '
        read -rs token; echo
        [ -n "$token" ] || die "no token entered"
        umask 077; printf 'CLICKUP_TOKEN=%s\n' "$token" > "$envf"; chmod 600 "$envf"
    fi
    if curl -sSf https://api.clickup.com/api/v2/team -H "Authorization: $(get_env "$envf" CLICKUP_TOKEN)" >/dev/null; then
        ok "ClickUp token works (agents read it from ~/.config/rupiverse/clickup.env and call the REST API with curl)"
    else
        warn "ClickUp rejected the token; fix $envf and run again"
    fi
    # Starter ticket: squad/demo/*.md → one BACKLOG task per file in the "Features" list (skipped if it exists).
    tok="$(get_env "$envf" CLICKUP_TOKEN)"
    cu() { curl -sS "https://api.clickup.com/api/v2/$1" -H "Authorization: $tok" "${@:2}"; }
    js() { node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);const r=('"$1"');if(r!==undefined&&r!==null)console.log(r)})'; }
    list_id="$CLICKUP_LIST_ID"
    if [ -z "$list_id" ]; then
        team_id="$(cu team | js 'j.teams&&j.teams[0]&&j.teams[0].id')"
        space_id="$(cu "team/$team_id/space?archived=false" | js '(j.spaces||[]).find(s=>s.name.toLowerCase()==="rupiverse")?.id')"
        if [ -n "$space_id" ]; then
            list_id="$(cu "space/$space_id/list?archived=false" | js '(j.lists||[]).find(l=>l.name.toLowerCase()==="features")?.id')"
            [ -n "$list_id" ] || list_id="$(cu "space/$space_id/folder?archived=false" | js '(j.folders||[]).flatMap(f=>f.lists||[]).find(l=>l.name.toLowerCase()==="features")?.id')"
        fi
    fi
    if [ -z "$list_id" ]; then
        warn "no \"Features\" list in a \"RupiVerse\" space (see squad/docs/clickup-setup.md); starter ticket not created"
    else
        existing="$(cu "list/$list_id/task?include_closed=true&archived=false")"
        for f in "$SQUAD_DIR"/demo/*.md; do
            [ -f "$f" ] || continue
            name="$(sed -n '1s/^# *//p' "$f")"
            key="$(printf '%s' "$name" | sed -n 's/^\(RV[0-9][0-9]*\).*/\1/p')"
            [ -n "$name" ] || { warn "$(basename "$f"): first line must be '# RV<n> · Title'"; continue; }
            if [ -n "$key" ] && printf '%s' "$existing" | KEY="$key" js '(j.tasks||[]).some(t=>new RegExp("^"+process.env.KEY+"\\b").test(t.name))?"yes":undefined' | grep -q yes; then
                ok "ClickUp already has $key; left it as it is"
                continue
            fi
            body="$(tail -n +2 "$f" | NAME="$name" node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{d=d.replace(/<!--[\s\S]*?-->/g,"").trim();console.log(JSON.stringify({name:process.env.NAME,markdown_content:d,markdown_description:d,status:"BACKLOG"}))})')"
            if cu "list/$list_id/task" -X POST -H "Content-Type: application/json" -d "$body" | js 'j.id' | grep -q .; then
                ok "starter ticket created in BACKLOG: $name"
            elif cu "list/$list_id/task" -X POST -H "Content-Type: application/json" -d "$(printf '%s' "$body" | js 'JSON.stringify(Object.assign(j,{status:undefined}))')" | js 'j.id' | grep -q .; then
                ok "starter ticket created (default status; move it to BACKLOG): $name"
            else
                warn "couldn't create $name; create it by hand from $f"
            fi
        done
    fi
else
    say "4. ClickUp (skipped)"
fi

# ── 5. Postgres ───────────────────────────────────────────────────────────
DB_URL_PW=""
if [ "$SKIP_DB" = 0 ]; then
    say "5. Postgres"
    psql "$PG_ADMIN" -qtAc 'select 1' >/dev/null 2>&1 || die "can't connect with --pg-admin $PG_ADMIN"
    role_exists="$(psql "$PG_ADMIN" -qtAc "select 1 from pg_roles where rolname='rupiverse'")"
    if [ "$role_exists" != "1" ]; then
        [ -n "$DB_PASSWORD" ] || DB_PASSWORD="$(openssl rand -hex 16)"
        psql "$PG_ADMIN" -qc "CREATE ROLE rupiverse WITH LOGIN PASSWORD '$DB_PASSWORD' CREATEDB;"
        ok "role rupiverse created (password: $DB_PASSWORD; it is also written into each clone's backend/.env)"
    else
        ok "role rupiverse exists"
        [ -n "$DB_PASSWORD" ] || DB_PASSWORD="$(get_env "$ROOT/builder/backend/.env" DATABASE_URL | sed -n 's#.*://rupiverse:\([^@]*\)@.*#\1#p')"
        [ -n "$DB_PASSWORD" ] || die "role exists but its password is unknown: pass --db-password"
    fi
    for a in "${WORKERS[@]}"; do
        db="rupiverse_$a"
        if [ "$(psql "$PG_ADMIN" -qtAc "select 1 from pg_database where datname='$db'")" != "1" ]; then
            psql "$PG_ADMIN" -qc "CREATE DATABASE $db OWNER rupiverse;"
            ok "database $db created"
        else
            ok "database $db exists"
        fi
    done
    DB_URL_PW="$DB_PASSWORD"
else
    say "5. Postgres (skipped)"
fi

# ── 6. .env files ─────────────────────────────────────────────────────────
say "6. .env files for builder, tester, reviewer"
for a in "${WORKERS[@]}"; do
    be="$ROOT/$a/backend/.env"; fe="$ROOT/$a/frontend/.env"
    if [ ! -f "$be" ]; then
        if [ -f "$ROOT/$a/backend/.env.example" ]; then cp "$ROOT/$a/backend/.env.example" "$be"; else touch "$be"; fi
    fi
    if [ ! -f "$fe" ]; then
        if [ -f "$ROOT/$a/frontend/.env.example" ]; then cp "$ROOT/$a/frontend/.env.example" "$fe"; else touch "$fe"; fi
    fi
    if [ -n "$DB_URL_PW" ]; then
        set_env "$be" DATABASE_URL "postgresql+asyncpg://rupiverse:${DB_URL_PW}@localhost:5432/rupiverse_$a"
        set_env "$be" TEST_DATABASE_URL "postgresql+asyncpg://rupiverse:${DB_URL_PW}@localhost:5432/postgres"
    fi
    for k in JWT_SECRET CODE_HASH_SECRET; do
        cur="$(get_env "$be" "$k")"
        case "$cur" in ""|change-me*) set_env "$be" "$k" "$(secret)" ;; esac
    done
    set_env "$be" CORS_ORIGINS "http://localhost:$(web_port "$a")"
    [ -n "$(get_env "$be" APP_ENV)" ] || set_env "$be" APP_ENV development
    [ -n "$(get_env "$be" TEST_OUTBOX_ENABLED)" ] || set_env "$be" TEST_OUTBOX_ENABLED false
    set_env "$fe" EXPO_PUBLIC_API_URL "http://localhost:$(backend_port "$a")"
    [ -n "$(get_env "$fe" EXPO_PUBLIC_API_MODE)" ] || set_env "$fe" EXPO_PUBLIC_API_MODE live
    ok "$a: backend :$(backend_port "$a"), web :$(web_port "$a"), db rupiverse_$a"
done
warn "SMTP_* values are left as they are: add your Gmail app password to each backend/.env if you want real emails"

# ── 7. GitHub labels ──────────────────────────────────────────────────────
if [ "$SKIP_LABELS" = 0 ]; then
    say "7. GitHub labels"
    (cd "$ROOT/builder" && gh label create review:approved --color 0E8A16 --force >/dev/null \
                        && gh label create review:changes --color D93F0B --force >/dev/null)
    ok "review:approved, review:changes"
else
    say "7. GitHub labels (skipped)"
fi

# ── 8. Local ignores, dependencies and git hooks ─────────────────────────
say "8. Local git ignores, dependencies and hooks"
for a in "${AGENTS[@]}"; do
    ex="$ROOT/$a/.git/info/exclude"
    for pat in ".claude/settings.local.json" ".switch/" ".worktrees/"; do
        grep -qxF "$pat" "$ex" 2>/dev/null || printf '%s\n' "$pat" >> "$ex"
    done
done
ok "settings.local.json, .switch/ and .worktrees/ are ignored in every clone (never committed)"
if [ "$SKIP_DEPS" = 0 ]; then
    for a in "${WORKERS[@]}"; do
        (cd "$ROOT/$a/backend" && uv sync --quiet) && ok "$a: backend dependencies (uv sync)"
        (cd "$ROOT/$a/frontend" && npm install --silent --no-fund --no-audit >/dev/null) && ok "$a: frontend dependencies + husky hook (npm install)"
        if (cd "$ROOT/$a/backend" && sh scripts/install-hooks.sh >/dev/null 2>&1); then
            ok "$a: backend pre-commit hook"
        else
            warn "$a: backend pre-commit hook needs git 2.54+ (brew upgrade git), then: sh backend/scripts/install-hooks.sh"
        fi
    done
else
    warn "dependencies and hooks skipped (--skip-deps)"
fi

say "Done. Next:"
cat <<EOF
  • GitHub → Settings → General → Pull Requests: allow squash merging only. Branch rule on master: require a PR.
  • In Switch Console, stop any running squad sessions so they pick up the new permissions.
  • In #rupiverse-hq: "@pm hello" — it checks ClickUp, saves the feature-room template, and tells you how to ask for work.
  • Then try the starter ticket: "@pm pick up RV5 from BACKLOG. Ask me what you need, then start it." and watch the room it creates.
EOF
