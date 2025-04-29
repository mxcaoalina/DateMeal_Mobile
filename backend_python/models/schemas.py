from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

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
    menuItems: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class AdviseRequest(BaseModel):
    vibe: Optional[str] = "romantic"
    ambience: Optional[str] = None
    partySize: Optional[str] = "2"
    budget: Optional[str] = "$$"
    cuisines: Optional[List[str]] = []
    location: Optional[str] = "NYC"
    dietaryRestrictions: Optional[List[str]] = []
    absoluteNogos: Optional[List[str]] = []

class AdviseResponse(BaseModel):
    response: str
    restaurant: Restaurant

class RefineRequest(BaseModel):
    previousRecommendations: List[Restaurant]
    userMessage: str

class RefineResponse(BaseModel):
    recommendations: List[Restaurant]
    reasoning: str
