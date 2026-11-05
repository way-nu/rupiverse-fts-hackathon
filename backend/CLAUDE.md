# RupiVerse backend — rules for agents

FastAPI · async SQLAlchemy 2.0 · Alembic · asyncpg · Pydantic v2 · Supabase Postgres (prod) / local Postgres in Docker (dev + tests).
No Supabase SDK, ever. Only the `public` schema is ours; never read or write Supabase's `auth` schema.

## Commands

- Install: `uv sync`
- Run: `uv run uvicorn app.main:app --reload --port $PORT`
- Test: `uv run pytest -q` (one module: `uv run pytest tests/api/auth -q`)
- Lint/format: `uv run ruff check . && uv run ruff format --check .`
- Types: `uv run mypy app`
- Migrate: `uv run alembic upgrade head` · new: `uv run alembic revision --autogenerate -m "<what>"` · back one: `uv run alembic downgrade -1`

## Architecture: modules with ports at the edges

A modular monolith. Each feature is a module with the same layers inside it. External systems (email, LLM, bank
statement parsing, clock) sit behind ports so they can be swapped and faked in tests. This is hexagonal where it
pays off (the edges) and plain layering inside, without mapping every ORM row to a separate domain class.

```
backend/
├── app/
│   ├── main.py                  # create_app(): lifespan, middleware, exception handlers, include routers. Nothing else.
│   ├── core/                    # cross-cutting, no feature logic
│   │   ├── config.py            # Settings (pydantic-settings), one cached get_settings()
│   │   ├── security.py          # password hashing, JWT encode/decode, token hashing
│   │   ├── errors.py            # AppError base + the global handler -> {"error", "detail"}
│   │   ├── logging.py           # logging setup + redaction filter
│   │   └── deps.py              # shared Depends: get_session, get_current_user
│   ├── db/
│   │   ├── base.py              # DeclarativeBase, constraint naming convention, AuditMixin (id, *_at, *_by), OwnedMixin (user_id)
│   │   ├── engine.py            # async engine + async_sessionmaker
│   │   └── models.py            # imports every module's models (Alembic reads metadata from here)
│   ├── modules/                 # one folder per feature, named after the feature
│   │   └── auth/
│   │       ├── router.py        # HTTP only: parse -> call service -> return schema
│   │       ├── schemas.py       # Pydantic request/response models
│   │       ├── models.py        # SQLAlchemy tables for this module
│   │       ├── repository.py    # every query for this module's tables
│   │       ├── service.py       # use cases and business rules; owns the transaction
│   │       ├── ports.py         # typing.Protocol for anything external this module needs (e.g. EmailSender)
│   │       ├── errors.py        # this module's AppError subclasses
│   │       ├── constants.py     # TTLs, limits, magic numbers
│   │       └── deps.py          # Depends wiring: build repository + adapters -> service
│   └── adapters/                # implementations of ports, grouped by what they talk to
│       ├── email/
│       │   ├── smtp.py          # Gmail SMTP sender
│       │   └── outbox.py        # test-only in-memory outbox (never enabled in production)
│       └── llm/                 # later: Ollama categoriser, etc.
├── alembic/                     # env.py is async and imports app.db.models
├── tests/
│   ├── conftest.py              # app, AsyncClient, DB session with per-test rollback, fakes for every port
│   ├── unit/<module>/           # services with fake repository/ports, no DB, no HTTP
│   ├── api/<module>/            # httpx AsyncClient against the app + real local DB
│   └── acceptance/              # Tester-owned: test_rv<n>_*.py, mapped to acceptance criteria
├── pyproject.toml
└── .env.example                 # every key, dummy values
```

### Dependency rules (what may import what)

- `router` → `service` (via `deps`), `schemas`. Routers never touch `repository`, `models` or a session.
- `service` → `repository`, `ports`, `errors`, `constants`, `core.security`. Services never import `fastapi`,
  `adapters`, or `Request`/`Response`. They raise `AppError`s, not `HTTPException`.
- `repository` → `models`, `sqlalchemy`. The only layer that builds queries.
- `models` → `db.base` only.
- `adapters` → the port they implement + their library. Never imported by services; wired in `deps.py`.
- Cross-module: call the other module's **service** (through its `deps`). Never import another module's repository or
  run queries on its tables. A foreign key to `users.id` is fine.
- `core/` never imports from `modules/`.

### Adding a feature module

Create only the files it needs, in this order: `models.py` → migration → `repository.py` → `ports.py` (if it talks to
something external) → `service.py` → `schemas.py` → `router.py` → `deps.py` → register router in `main.py` → tests.

## Reuse before building

Check in order: this repo (`core/`, existing modules) → FastAPI / SQLAlchemy / Pydantic built-ins (read the versioned
docs) → a well-maintained library (recent release, typed, used widely; add with `uv add`) → build it small.
Say why in the PR when adding a library.

## Data and database

- Primary keys: `UUID` (`uuid4`, server default `gen_random_uuid()`).
- Default columns on every table, from the `AuditMixin` in `db/base.py` (never redeclare them per model):

  | Column | Type | Set by |
  | --- | --- | --- |
  | `id` | `UUID` PK | DB default `gen_random_uuid()` |
  | `created_at` | `TIMESTAMPTZ NOT NULL` | DB default `now()` |
  | `created_by` | `UUID NULL` → `users.id` | service, on insert |
  | `updated_at` | `TIMESTAMPTZ NOT NULL` | DB default `now()`, ORM `onupdate` |
  | `updated_by` | `UUID NULL` → `users.id` | service, on every update |
  | `deleted_at` | `TIMESTAMPTZ NULL` | service, on soft delete |
  | `deleted_by` | `UUID NULL` → `users.id` | service, on soft delete |

- Timestamps are always UTC; never naive datetimes.
- `*_by` is the acting user's id. It is `NULL` only when no user is acting (self-signup, system jobs such as the
  nightly reconciliation). For `users`, a self-signup row has `created_by = NULL`.
- `*_by` foreign keys use `ON DELETE SET NULL` and are not indexed unless a query needs them.
- Services set `*_by`, never routers and never the client. Repository write methods take an `actor_id` argument.
- Soft delete sets `deleted_at` and `deleted_by` together; nothing is hard-deleted from user-owned tables.
  Repositories filter `deleted_at IS NULL` by default.
- Multi-tenant: every user-owned table has `user_id` (FK, indexed) and every repository method that reads user data
  takes `user_id` and filters on it. No query on user data without it.
- Money: `BIGINT` in paise (integer minor units). Never `float`, never `NUMERIC` in Python floats.
- Emails stored lowercased; uniqueness enforced by a unique index, not just app code.
- Constraint naming convention is set in `db/base.py` so Alembic output is stable; never name constraints by hand.
- Relationships use `lazy="raise"`. Load what you need explicitly (`selectinload`, `joinedload`, or a `join` in the
  select). Lazy loading in async code is a bug.
- Sessions: one per request from `get_session`, `expire_on_commit=False`. The service commits once per use case;
  repositories only `add`/`flush`.
- Raw SQL only through `text()` with bound parameters. Never f-strings or `%` into SQL.

## Migrations (production data lives here — be careful)

- Every schema change is an Alembic migration. Read the generated file before committing; autogenerate is a draft.
- Renames: autogenerate writes drop + add, which deletes data. Rewrite it as
  `op.alter_column("table", "old", new_column_name="new")` / `op.rename_table(...)`.
- Never `drop_column` / `drop_table` without the PM's written approval in the room. Breaking changes use
  expand → migrate data → contract across separate PRs.
- Every migration has a working `downgrade()`. Run `upgrade head`, `downgrade -1`, `upgrade head` locally before the PR.
- Migrations run against Supabase over the direct/session connection (port 5432), never the transaction pooler.

## API conventions

- Routes are plural nouns under a module prefix (`/auth/...`, `/transactions/...`); status codes are deliberate
  (201 create, 204 no body, 409 conflict, 422 validation, 429 rate limit).
- Every response is a Pydantic schema (`response_model`), never an ORM object or a dict. Schemas use
  `model_config = ConfigDict(from_attributes=True)` when built from models.
- Errors are always `{"error": "<snake_case_code>", "detail": "<human text>"}` via `AppError(code, status, detail)`.
  Codes are part of the API contract; the frontend maps them to friendly text.
- Pagination: `limit` + `cursor`, never offset on large tables.

## Security

- Passwords: bcrypt; validate 8–72 **bytes** (UTF-8) and reject longer, never truncate.
- Secrets compared with `hmac.compare_digest`. Random values from `secrets`.
- Refresh tokens and one-time codes are stored only as hashes. JWTs carry `sub`, `type`, `iat`, `exp`.
- Never log or return passwords, codes, tokens, hashes or full emails. The logging filter redacts them; don't bypass it.
- Config and secrets only from env via `Settings`; `.env` is gitignored, `.env.example` is kept current.
- Test-only switches (like the email outbox) default off, and the app refuses to start if one is on with
  `ENV=production`.

## Testing

- `pytest` with `pytest-asyncio` (auto mode) and `httpx.AsyncClient` against the app.
- Tests use the local Docker Postgres (database from `DATABASE_URL` in your `.env`), never Supabase. Each test runs in
  a transaction that is rolled back.
- Ports are faked in tests (fake `EmailSender` records sent codes). No real email, no network.
- Unit tests cover service rules and edge cases; API tests cover every endpoint's success and every error code.
- Acceptance tests live in `tests/acceptance/test_rv<n>_*.py` and name the acceptance criterion they prove.
- See "Pull requests" for which checks gate which stage.

## Pull requests

PRs open early so everyone can see and comment on the work. Checks get stricter as the PR moves along:

| Stage | What must be true |
| --- | --- |
| Open as **draft** | Structure follows this file. `ruff format` and `ruff check --fix` run. Nothing else. |
| Hand to Tester | The app starts and `alembic upgrade head` applies. Tests may still fail. |
| Hand to Reviewer | Tester has passed the acceptance criteria this PR covers. |
| Awaiting merge | Everything green: ruff, mypy, all tests, migration upgrade → downgrade → upgrade. |

- All feedback lives on the PR, not in chat: the Tester and Reviewer post review comments (inline on the line when
  they can), and the Builder replies on each comment when it's fixed. Room messages only point to the PR.
- One PR per part of the feature; keep each reviewable in one sitting.

## Gotchas

- Supabase transaction pooler (port 6543) + asyncpg: set `statement_cache_size=0` in `connect_args`, or prepared
  statement errors appear under load.
- Async SQLAlchemy: accessing an unloaded relationship raises (by design, `lazy="raise"`); load it in the query.
- `expire_on_commit=False` is required, or attributes vanish after commit in async code.
- bcrypt silently truncates past 72 bytes in some libraries; we validate first so it never happens.
- Alembic `env.py` must import `app.db.models`, or autogenerate thinks every table was deleted.
- Each agent runs on its own port and database (see its instructions); never point two agents at one DB.

## Hygiene

- No trash: when a change makes a file, function, setting or dependency unused, delete it in the same PR.
- Keep tool output (`.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`, `.switch/`) out of git.

## Code style

- 4-space indent, type hints on every function, `ruff format`, line length 120 (PyCharm's default).
- Names: modules and files `snake_case`, classes `PascalCase`, constants `UPPER_SNAKE`.
- No `print`; use the module logger.
- Small functions; a service method reads as the use case it implements.
