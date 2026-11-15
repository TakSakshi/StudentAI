#!/bin/bash
# StudentInsight AI — Unified Development Runner
# Algions AI Labs Private Limited Assessment

echo "=========================================================="
echo " Starting StudentInsight AI (Backend + Frontend)"
echo "=========================================================="

# Check Python environment
if [ ! -d "venv" ]; then
    echo "Creating Python 3.11 virtual environment..."
    python3.11 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

# Ensure model artifacts exist
if [ ! -f "models/best_model.pkl" ]; then
    echo "Training ML model and generating artifacts..."
    ./venv/bin/python data/generate_data.py
    ./venv/bin/python -m src.train
fi

PORT=${PORT:-8001}
echo "Starting FastAPI Backend on http://localhost:${PORT}..."
./venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT} &
BACKEND_PID=$!

echo "Starting React Frontend on http://localhost:5173..."
npm run dev --prefix frontend &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

echo ""
echo ">> FastAPI Backend: http://localhost:${PORT} (API Docs: http://localhost:${PORT}/docs)"
echo ">> React Frontend:  http://localhost:5173"
echo "Press Ctrl+C to stop both servers."
wait

