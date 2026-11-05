#!/bin/sh
# Registers the backend pre-commit hook (scripts/pre-commit.sh) with git.
# Uses git's config-based hooks (git 2.54+), so it runs alongside the frontend's husky hook
# without either project knowing about the other. Run once per clone: sh scripts/install-hooks.sh
set -e

version=$(git --version | sed 's/[^0-9.]//g')
major=$(echo "$version" | cut -d. -f1)
minor=$(echo "$version" | cut -d. -f2)
if [ "$major" -lt 2 ] || { [ "$major" -eq 2 ] && [ "$minor" -lt 54 ]; }; then
    echo "git $version is too old: config-based hooks need git 2.54 or newer." >&2
    exit 1
fi

git config hook.backend-ruff.event pre-commit
git config hook.backend-ruff.command "sh backend/scripts/pre-commit.sh"
echo "Backend pre-commit hook installed:"
git hook list pre-commit
