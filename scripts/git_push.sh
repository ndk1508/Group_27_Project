#!/usr/bin/env bash
set -e

# Thư mục repo (1 level lên từ scripts)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT" || { echo "Không vào được repo root"; exit 1; }

# Tham số: [branch] [commit-message] [files...]
BRANCH_ARG="$1"
MSG_ARG="$2"
shift 2 || true

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")"
BRANCH="${BRANCH_ARG:-$CURRENT_BRANCH}"
MSG="${MSG_ARG:-chore: update changes}"

# Nếu truyền file(s) thì stage những file đó, ngược lại stage tất cả
if [ $# -gt 0 ]; then
  FILES="$*"
else
  FILES="."
fi

echo "Repo: $REPO_ROOT"
echo "Branch target: $BRANCH"
echo "Files to stage: $FILES"
echo "Commit message: $MSG"
echo "---- git status ----"
git status --short

# checkout hoặc tạo branch nếu chưa có
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add $FILES

# Commit only if staged changes exist
if git diff --cached --quiet; then
  echo "Không có thay đổi để commit."
else
  git commit -m "$MSG"
fi

# Push (set upstream nếu cần)
UPSTREAM_EXISTS=0
git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1 && UPSTREAM_EXISTS=1 || UPSTREAM_EXISTS=0

if [ "$UPSTREAM_EXISTS" -eq 1 ]; then
  git push
else
  git push -u origin "$BRANCH"
fi

echo "Đã push lên remote: $BRANCH"
