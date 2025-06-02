start:
	cd backend && (test -d node_modules || npm install) && npm start & \
	cd frontend && (test -d node_modules || npm install) && npm start

backend:
	cd backend && (test -d node_modules || npm install) && npm start

frontend:
	cd frontend && (test -d node_modules || npm install) && npm start 
