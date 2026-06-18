#!/bin/bash
# Run this FIRST in your terminal before starting the backend

echo "Checking PostgreSQL..."

if pg_isready -h localhost -q 2>/dev/null; then
  echo "PostgreSQL is already running."
else
  echo "Starting PostgreSQL..."
  brew services start postgresql@14

  sleep 3

  if ! pg_isready -h localhost -q 2>/dev/null; then
  echo ""
  echo "brew services failed. Try this instead:"
  echo "  /opt/homebrew/opt/postgresql@14/bin/pg_ctl -D /opt/homebrew/var/postgresql@14 start"
  exit 1
  fi
fi

echo "PostgreSQL is running on port 5432."

# Create database if needed
createdb inventory_db 2>/dev/null && echo "Created database: inventory_db" || echo "Database inventory_db exists."

echo ""
echo "Done! Now start the backend:"
echo "  cd ~/inventory-order-management/backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --port 8000"
