# Requirements: local PostgreSQL server running, user 'postgres' with no password (default), or set PGUSER/PGPASSWORD/PGHOST as needed.

start:
	cd backend && (test -d node_modules || npm install) && npm start & \
	cd frontend && (test -d node_modules || npm install) && npm start

backend:
	cd backend && (test -d node_modules || npm install) && npm start

frontend:
	cd frontend && (test -d node_modules || npm install) && npm start

dev:
	@echo "[dev] Ensuring local PostgreSQL is running and database exists..."
	@PGPASSWORD=$${PGPASSWORD:-} psql -U $${PGUSER:-postgres} -h $${PGHOST:-localhost} -tc "SELECT 1 FROM pg_database WHERE datname = 'voucher_store'" | grep -q 1 || \
	  PGPASSWORD=$${PGPASSWORD:-} createdb -U $${PGUSER:-postgres} -h $${PGHOST:-localhost} voucher_store
	@echo "[dev] Starting backend and frontend with local DATABASE_URL..."
	DATABASE_URL="postgres://$${PGUSER:-postgres}:$${PGPASSWORD:-}@localhost:5432/voucher_store" \
	  cd backend && (test -d node_modules || npm install) && npm start & \
	cd frontend && (test -d node_modules || npm install) && npm start

# Docker targets

docker:
	docker-compose up --build

docker-down:
	docker-compose down
