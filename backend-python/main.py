
import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import List, Optional, Dict

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Add error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )

class Restaurant(BaseModel):
    id: str
    name: str
    description: str
    cuisineType: str
    priceRange: str
    location: str
    rating: float = Field(ge=0, le=5)
    imageUrl: str
    address: str
    phone: str
    website: str
    openingHours: List[str]
    highlights: List[str]
    reasonsToRecommend: List[str]

class AdviseRequest(BaseModel):
    vibe: Optional[str] = Field(default="romantic")
    partySize: Optional[str] = Field(default="2")
    budget: Optional[str] = Field(default="$$")
    cuisines: Optional[List[str]] = Field(default_factory=list)
    location: Optional[str] = Field(default="NYC")

class AdviseResponse(BaseModel):
    response: str
    restaurant: Restaurant

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/advise", response_model=AdviseResponse)
async def get_recommendation(request: AdviseRequest):
    try:
        vibe = request.vibe or "romantic"
        location = request.location or "NYC"
        cuisine = request.cuisines[0] if request.cuisines else "Fine Dining"

        recommendation_text = f"""For a {vibe} evening in {location}, I highly recommend "The {vibe.capitalize()} Spot". 
        
Imagine soft lighting, a cozy ambiance, and the perfect setting to match your vibe. 
Savor signature dishes crafted with love, and don't miss out on their house special dessert!"""

        restaurant = Restaurant(
            id=f"rec-{vibe}-{location}",
            name=f"The {vibe.capitalize()} Spot",
            description=recommendation_text,
            cuisineType=cuisine,
            priceRange=request.budget or "$$",
            location=location,
            rating=4.8,
            imageUrl=f"https://source.unsplash.com/featured/?restaurant,{cuisine}",
            address=f"123 Main St, {location}",
            phone="(212) 555-1234",
            website="https://example.com",
            openingHours=[
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 11:00 PM",
                "11:00 AM - 11:00 PM",
                "12:00 PM - 9:00 PM"
            ],
            highlights=[cuisine, vibe, location],
            reasonsToRecommend=[
                "Based on your preferences",
                f"Perfect for a {vibe} evening",
                f"{request.budget or '$$'} price range"
            ]
        )

        return AdviseResponse(response=recommendation_text, restaurant=restaurant)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
