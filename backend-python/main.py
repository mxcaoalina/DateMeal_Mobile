import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Optional

# Load environment variables from .env file
load_dotenv()

# Azure OpenAI settings (not used yet, but ready)
AZURE_DEPLOYMENT_NAME = os.getenv('AZURE_DEPLOYMENT_NAME')
AZURE_ENDPOINT = os.getenv('AZURE_ENDPOINT')
AZURE_API_KEY = os.getenv('AZURE_API_KEY')

# FastAPI setup
app = FastAPI()

# Allow all CORS origins for now (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Simple health check endpoint to test API connectivity
    """
    return "API is running and healthy!"

# Define the expected request model
class AdviseRequest(BaseModel):
    vibe: Optional[str] = "romantic"
    partySize: Optional[str] = "2"
    budget: Optional[str] = "$$"
    cuisines: Optional[List[str]] = []
    location: Optional[str] = "NYC"

# POST endpoint to accept user preferences
@app.post("/advise")
async def get_recommendation(request: AdviseRequest):
    try:
        # Use fields from request to dynamically create a recommendation
        vibe = request.vibe or "romantic"
        location = request.location or "NYC"

        # Example of a dynamic response
        recommendation = f"""For a {vibe} evening in {location}, I highly recommend "The {vibe.capitalize()} Spot". 

Imagine soft lighting, a cozy ambiance, and the perfect setting to match your vibe. 
Savor signature dishes crafted with love, and don't miss out on their house special dessert!"""

        return {"response": recommendation}

    except Exception as e:
        return {"error": str(e)}
