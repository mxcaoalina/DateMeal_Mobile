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
        
        # Handle Azure App Service Run-From-Package
        if os.environ.get('WEBSITE_RUN_FROM_PACKAGE') == '1':
            logger.info("Running in Azure Run-From-Package mode")
            # When using Run-From-Package, files are in D:\home\site\wwwroot
            if os.path.exists('D:\\home\\site\\wwwroot'):
                os.chdir('D:\\home\\site\\wwwroot')
                logger.info("Changed to %s", os.getcwd())
                logger.info("Directory contents: %s", os.listdir())
        
        # Find requirements.txt
        req_file = 'requirements.txt'
        if not os.path.exists(req_file):
            # Search for requirements.txt
            for root, dirs, files in os.walk('.'):
                if req_file in files:
                    req_path = os.path.join(root, req_file)
                    logger.info("Found requirements.txt at %s", req_path)
                    req_file = req_path
                    os.chdir(root)
                    logger.info("Changed directory to %s", os.getcwd())
                    break
            else:
                logger.warning("Could not find requirements.txt")
        
        # Install dependencies
        logger.info("Installing dependencies from %s", req_file)
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
        except subprocess.CalledProcessError as e:
            logger.warning("Pip install failed: %s", e)
            # Continue anyway, dependencies might be pre-installed
        
        # Set fallback for Azure OpenAI if not set
        if not os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME"):
            os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4"
            logger.info("AZURE_OPENAI_DEPLOYMENT_NAME not set, using default: %s", 
                        os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"])
        
        # Find main.py
        main_file = 'main.py'
        main_module = 'main:app'
        
        if not os.path.exists(main_file):
            # Search for main.py
            for root, dirs, files in os.walk('.'):
                if main_file in files:
                    main_path = os.path.join(root, main_file)
                    logger.info("Found main.py at %s", main_path)
                    # Calculate the import path
                    rel_path = os.path.relpath(main_path)
                    if rel_path == main_file:
                        main_module = 'main:app'  # In current directory
                    else:
                        # Convert path to module notation
                        module_path = os.path.dirname(rel_path).replace(os.sep, '.')
                        if module_path:
                            main_module = f"{module_path}.main:app"
                        else:
                            main_module = 'main:app'
                    
                    os.chdir(os.path.dirname(main_path))
                    logger.info("Changed directory to %s", os.getcwd())
                    break
            else:
                logger.error("Could not find main.py")
                sys.exit(1)

        # Log current environment for debugging
        logger.info("Current environment variables: %s", 
                   {k: v for k, v in os.environ.items() if not k.startswith('PATH')})
                    
        # Start the application with uvicorn directly
        logger.info("Starting uvicorn server with module %s...", main_module)
        import uvicorn
        uvicorn.run(main_module, host="0.0.0.0", port=8000, log_level="info")
        
    except Exception as e:
        logger.error("Error starting server: %s", e, exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    run_server() 