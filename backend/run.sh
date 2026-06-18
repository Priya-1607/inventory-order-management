#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== Inventory Backend Startup ==="

# Start PostgreSQL if not running
if ! pg_isready -h localhost -q 2>/dev/null; then
  echo "PostgreSQL is not running. Starting it..."
  if brew services start postgresql@14 2>/dev/null; then
    sleep 3
  else
    echo "Trying direct start..."
    /opt/homebrew/opt/postgresql@14/bin/pg_ctl -D /opt/homebrew/var/postgresql@14 -l /tmp/postgres.log start
    sleep 2
  fi
fi

if ! pg_isready -h localhost -q 2>/dev/null; then
  echo ""
  echo "ERROR: PostgreSQL still not running."
  echo "Run this manually in a separate terminal:"
  echo "  brew services start postgresql@14"
  echo ""
  echo "Or:"
  echo "  /opt/homebrew/opt/postgresql@14/bin/pg_ctl -D /opt/homebrew/var/postgresql@14 start"
  exit 1
fi

echo "PostgreSQL is running."

# Create database if it doesn't exist
createdb inventory_db 2>/dev/null && echo "Created database: inventory_db" || echo "Database inventory_db ready."

# Activate venv and run server
source venv/bin/activate
echo ""
echo "Starting backend at http://localhost:8000"
echo "API docs at http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
