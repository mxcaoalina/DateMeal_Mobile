#!/bin/bash

# Print environment details
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Find Python installation
echo "Looking for Python installation..."
which python3 || echo "python3 not found"
which python || echo "python not found"
find / -name python3 -type f 2>/dev/null || echo "No python3 found in filesystem"

# Try to use the system Python or Python managed by App Service
PYTHON_PATH=$(find /usr/bin /usr/local/bin /opt/python /home/site/wwwroot/env/bin -name "python*" -type f 2>/dev/null | grep -E 'python3(\.[0-9]+)?' | sort -r | head -1)
echo "Using Python at: $PYTHON_PATH"

# If Python is found, use it
if [ -n "$PYTHON_PATH" ]; then
    # Create and activate a virtual environment
    echo "Creating virtual environment..."
    $PYTHON_PATH -m venv /tmp/venv
    source /tmp/venv/bin/activate
    
    # Verify Python and pip
    python --version
    pip --version
    
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
    python -m gunicorn main:app --bind 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker --timeout 600
else
    # Fallback to path discovery
    echo "Python not found directly. Checking paths..."
    echo "PATH: $PATH"
    
    # Try to add common Python paths and try again
    export PATH=$PATH:/usr/local/bin:/usr/bin:/opt/python/latest/bin
    
    python3 --version || python --version
    
    if command -v python3 &>/dev/null; then
        echo "Found python3, creating venv..."
        python3 -m venv /tmp/venv
        source /tmp/venv/bin/activate
        python3 --version
        pip3 --version
        
        # Install dependencies
        pip3 install --upgrade pip
        pip3 install -r requirements.txt
        
        # Start with Python3
        python3 -m gunicorn main:app --bind 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker --timeout 600
    else
        echo "ERROR: Could not find Python. App Service may not be configured correctly."
        exit 1
    fi
fi
