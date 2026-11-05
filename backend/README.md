# Rupiverse — Backend

Rupiverse API built with [FastAPI](https://fastapi.tiangolo.com) and Python, managed with [uv](https://docs.astral.sh/uv/).

## Versions

| Tool / Package | Version |
|----------------|---------|
| Python         | 3.14    |
| uv             | 0.11.29 |
| FastAPI        | 0.162.0 |
| Starlette      | 1.10.0  |
| Pydantic       | 2.14.2  |
| Uvicorn        | 0.54.0  |
| Ruff           | 0.17.3  |
| pytest         | 9.2.0   |

## Getting started

```bash
uv sync                          # create .venv and install dependencies
uv run fastapi dev app/main.py   # dev server with auto-reload at http://127.0.0.1:8000
uv run pytest                    # run tests
```

Interactive API docs: http://127.0.0.1:8000/docs

## Project layout

```
app/main.py       FastAPI app and routes (GET /, GET /health)
tests/            pytest tests
scripts/          pre-commit checks
pyproject.toml    dependencies + Ruff and pytest config
```

## Code style

Code follows the default JetBrains PyCharm style: PEP 8, 4-space indent, 120-column lines, 2 blank lines around
top-level functions and classes, sorted imports. [Ruff](https://docs.astral.sh/ruff/) (a Black-compatible formatter
and linter) enforces it; settings are under `[tool.ruff]` in `pyproject.toml`.

```bash
uv run ruff format .        # format
uv run ruff check --fix .   # lint and auto-fix (unused imports, import order, PEP 8, …)
```

**Editors:** open this `backend` folder itself as the project root (not the repo root).

- **Cursor / VS Code:** `.vscode/settings.json` applies. Install the recommended extensions when prompted
  (Ruff, Python, EditorConfig). On save, Ruff formats the file, fixes lint issues and sorts imports.
- **PyCharm:** set the interpreter to `.venv/bin/python`. `.editorconfig` carries the PyCharm code style (`ij_*` keys).
  To format with Ruff on save, enable Settings → Tools → Ruff → "Run Ruff on save" (built in to recent PyCharm
  versions; otherwise install the Ruff plugin).

**Pre-commit hook:** install once per clone (needs git 2.54+):

```bash
sh scripts/install-hooks.sh
```

On every commit, `scripts/pre-commit.sh` then runs `ruff check --fix` and `ruff format` on staged backend Python files
and re-stages them. Files that also have unstaged edits are only checked, never auto-staged. The hook is registered
through git's config-based hooks, so it is independent of the frontend's hook.
