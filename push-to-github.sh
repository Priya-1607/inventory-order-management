#!/bin/bash
set -e

cd "$(dirname "$0")"

REPO_NAME="${1:-inventory-order-management}"

echo "=== Pushing to GitHub ==="

# Initialize git if needed
if [ ! -d .git ] || [ ! -f .git/config ]; then
  rm -rf .git 2>/dev/null || true
  git init
  git branch -M main
fi

# Stage and commit
git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "$(cat <<'EOF'
Initial commit: Inventory & Order Management System

Full-stack app with FastAPI backend, React frontend, PostgreSQL, and Docker.
EOF
)"
fi

# Create repo and push via GitHub CLI (if authenticated)
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  if ! git remote get-url origin &>/dev/null; then
    echo "Creating GitHub repository: $REPO_NAME"
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  else
    echo "Pushing to existing remote..."
    git push -u origin main
  fi
  echo ""
  echo "Done! Repository URL:"
  gh repo view --web 2>/dev/null || git remote get-url origin
else
  echo ""
  echo "GitHub CLI not authenticated. Run these steps manually:"
  echo ""
  echo "1. Re-authenticate:"
  echo "   gh auth login"
  echo ""
  echo "2. Create repo and push:"
  echo "   gh repo create $REPO_NAME --public --source=. --remote=origin --push"
  echo ""
  echo "Or create the repo at https://github.com/new then:"
  echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
  echo "   git push -u origin main"
fi
