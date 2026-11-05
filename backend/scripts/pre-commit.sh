#!/bin/sh
# Pre-commit checks for the backend: Ruff lint (with auto-fix) and Ruff format on staged Python files.
# Called from the repo's git pre-commit hook; can also be run by hand from anywhere in the repo.
set -e

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root/backend"

# Staged (added/copied/modified/renamed) Python files under backend/, relative to backend/
files=$(git diff --cached --name-only --diff-filter=ACMR --relative -- '*.py')
[ -z "$files" ] && exit 0

# Files that also have unstaged edits are only checked, not auto-fixed,
# so unrelated work-in-progress never gets staged by the hook.
fixable=""
check_only=""
for f in $files; do
    if git diff --quiet -- "$f"; then
        fixable="$fixable $f"
    else
        check_only="$check_only $f"
    fi
done

if [ -n "$fixable" ]; then
    # shellcheck disable=SC2086
    uv run ruff check --fix $fixable
    # shellcheck disable=SC2086
    uv run ruff format $fixable
    # shellcheck disable=SC2086
    git add $fixable
fi

if [ -n "$check_only" ]; then
    # shellcheck disable=SC2086
    uv run ruff check $check_only
    # shellcheck disable=SC2086
    uv run ruff format --check $check_only || {
        echo "Partially staged files need formatting: run 'uv run ruff format' in backend/ and stage again."
        exit 1
    }
fi
