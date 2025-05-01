#!/bin/bash

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the application
gunicorn main:app --bind 0.0.0.0:8000 -k uvicorn.workers.UvicornWorker --timeout 600
