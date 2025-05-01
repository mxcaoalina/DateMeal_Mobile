#!/usr/bin/env python3
import os
import subprocess
import sys
import time

print("Starting DateMeal API...")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

# Create necessary directories
os.makedirs("static/images", exist_ok=True)

# Install dependencies if not already installed
try:
    import uvicorn
    import fastapi
    print("Dependencies already installed")
except ImportError:
    print("Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

# Start the application
print("Starting FastAPI application...")
port = int(os.environ.get("PORT", 8000))
host = os.environ.get("HOST", "0.0.0.0")

# Import the app after dependencies are installed
from main import app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=host, port=port)
