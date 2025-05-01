#!/bin/bash

# Check Python version and warn if not 3.10+
python --version

# Print working directory and list files
echo "Current directory: $(pwd)"
ls -la

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set fallback for Azure OpenAI if not set
if [ -z "$AZURE_OPENAI_DEPLOYMENT_NAME" ]; then
    export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
    echo "AZURE_OPENAI_DEPLOYMENT_NAME not set, using default: $AZURE_OPENAI_DEPLOYMENT_NAME"
fi

# Start the application
echo "Starting application..."
gunicorn main:app --bind 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker --timeout 600
