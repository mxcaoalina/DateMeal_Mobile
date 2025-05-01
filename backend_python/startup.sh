#!/bin/bash

# Print environment details
echo "Starting DateMeal API backend..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Find Python
echo "Finding Python..."
which python3 || echo "Python3 not found directly"
python_cmd=$(which python3 2>/dev/null || which python 2>/dev/null || echo "/usr/bin/python3")
echo "Using Python at: $python_cmd"

# Install dependencies
echo "Installing dependencies..."
$python_cmd -m pip install --upgrade pip
$python_cmd -m pip install -r requirements.txt

# Create static directory for images
mkdir -p static/images

# Set environment variables if not already set
if [ -z "$PORT" ]; then
    export PORT=8000
    echo "PORT not set, using default: $PORT"
fi

if [ -z "$AZURE_OPENAI_DEPLOYMENT_NAME" ]; then
    export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
    echo "AZURE_OPENAI_DEPLOYMENT_NAME not set, using default: $AZURE_OPENAI_DEPLOYMENT_NAME"
fi

# Start the application using Gunicorn with Uvicorn workers
echo "Starting application on port $PORT..."
$python_cmd -m gunicorn main:app --bind 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker --timeout 600 --access-logfile - --error-logfile -
