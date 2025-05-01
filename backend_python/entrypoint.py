#!/usr/bin/env python3
import os
import sys
import subprocess
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("entrypoint")

def run_server():
    """Simple function to start the uvicorn server for FastAPI."""
    try:
        logger.info("Python version: %s", sys.version)
        logger.info("Current directory: %s", os.getcwd())
        logger.info("Directory contents: %s", os.listdir())
        
        # Install dependencies
        logger.info("Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        # Set fallback for Azure OpenAI if not set
        if not os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME"):
            os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4"
            logger.info("AZURE_OPENAI_DEPLOYMENT_NAME not set, using default: %s", 
                        os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"])
        
        # Start the application with uvicorn directly
        logger.info("Starting uvicorn server...")
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
        
    except Exception as e:
        logger.error(f"Error starting server: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    run_server() 