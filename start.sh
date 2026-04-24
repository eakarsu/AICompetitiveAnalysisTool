#!/bin/bash
echo "🏆 Starting AI Competitive Analysis Tool..."

# Kill existing processes on ports
for port in 3000 3001; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  fi
done

# Database setup
DB_NAME="ai_competitive_analysis_db"
echo "Setting up database: $DB_NAME"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE $DB_NAME"
psql -U postgres -d $DB_NAME -f backend/schema.sql
psql -U postgres -d $DB_NAME -f backend/seed.sql

# Backend
echo "Installing backend dependencies..."
cd backend && npm install
echo "Starting backend on port 3001..."
npx nodemon server.js &
cd ..

# Frontend
echo "Installing frontend dependencies..."
cd frontend && npm install
echo "Starting frontend on port 3000..."
PORT=3000 npm start &
cd ..

echo ""
echo "✅ AI Competitive Analysis Tool is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Login: admin@test.com / password123"
