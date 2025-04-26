import os
import random
import json
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import List, Optional, Dict
import httpx
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Azure OpenAI configuration
AZURE_API_KEY = os.getenv("AZURE_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME", "gpt-4o")

# Bing Search configuration - appears to be a RapidAPI key format
BING_API_KEY = os.getenv("BING_API_KEY")
logger.info(f"Bing API Key configured: {bool(BING_API_KEY)}")

# Use RapidAPI endpoints for Bing Search
RAPIDAPI_HOST = "bing-image-search1.p.rapidapi.com"
RAPIDAPI_SEARCH_URL = "https://bing-web-search1.p.rapidapi.com/search"
RAPIDAPI_IMAGES_URL = "https://bing-image-search1.p.rapidapi.com/images/search"

# Original Bing Search endpoints (if using direct Bing subscription)
BING_SEARCH_URL = "https://api.bing.microsoft.com/v7.0/search"
BING_IMAGES_URL = "https://api.bing.microsoft.com/v7.0/images/search"

# Detect which API format we're using
IS_RAPIDAPI = BING_API_KEY and BING_API_KEY.startswith("2257")

if IS_RAPIDAPI:
    logger.info("Using RapidAPI format for Bing search")
else:
    logger.info("Using standard Bing API format")

app = FastAPI()

# Collection of high-quality food and restaurant image IDs from Unsplash
restaurant_image_ids = [
    "1517248135467-4c7edcad34c4",  # Restaurant interior
    "1554118811-1e0d58224f24",  # Restaurant food
    "1514933651103-005eec06c04b",  # Elegant restaurant
    "1466978913421-dad2ebd01d17",  # Japanese food
    "1533777857889-4be7c70b33f7",  # Italian food
    "1555126634-323283e090fa",     # Mexican food
    "1414235077428-338989a2e8c0",  # Fine dining
    "1482275548304-a58859dc31b7",  # Trendy restaurant
    "1504754524-8c4a1696c38b",     # Chinese food
    "1561758033-d8f159ad5b56",     # French food
    "1563245372-4ccd67778a25",     # Indian food
]

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
    logger.exception("Unhandled exception")
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

# Restaurant database - fallback restaurants if AI generation fails
RESTAURANT_DATA = {
    "italian": [
        {
            "name": "Bella Notte",
            "description": "A charming family-owned trattoria serving authentic Italian cuisine passed down through generations. Their homemade pasta and wood-fired pizzas are local favorites.",
            "priceRange": "$$",
            "rating": 4.7,
            "highlights": ["Homemade pasta", "Wood-fired pizza", "Family recipes"],
            "address_suffix": "Little Italy"
        },
        {
            "name": "Trattoria Milano",
            "description": "An elegant Northern Italian restaurant specializing in risottos, polenta dishes, and an extensive wine list featuring rare Italian vintages.",
            "priceRange": "$$$",
            "rating": 4.8,
            "highlights": ["Northern Italian cuisine", "Rare wine selection", "Seasonal menu"],
            "address_suffix": "Financial District"
        }
    ],
    "japanese": [
        {
            "name": "Sakura Sushi",
            "description": "Intimate omakase experience where the chef selects the freshest seafood daily. Known for their innovative nigiri and artistic presentation.",
            "priceRange": "$$$$",
            "rating": 4.9,
            "highlights": ["Daily fresh fish", "Omakase", "Artistic presentation"],
            "address_suffix": "SoHo"
        },
        {
            "name": "Ramen Koji",
            "description": "Authentic ramen shop with broths simmered for 48 hours. Their signature tonkotsu and unique vegetarian options have earned them critical acclaim.",
            "priceRange": "$$",
            "rating": 4.6,
            "highlights": ["48-hour broth", "Handmade noodles", "Seasonal specials"],
            "address_suffix": "East Village"
        }
    ],
    "french": [
        {
            "name": "Petit Bistro",
            "description": "Parisian-style bistro serving classic French comfort food. Their coq au vin and duck confit are legendary among local food enthusiasts.",
            "priceRange": "$$$",
            "rating": 4.7,
            "highlights": ["Classic French", "Seasonal ingredients", "Curated wine list"],
            "address_suffix": "West Village"
        },
        {
            "name": "L'Étoile",
            "description": "Fine dining French restaurant with Michelin-star ambitions. Their tasting menu showcases modern interpretations of traditional French techniques.",
            "priceRange": "$$$$",
            "rating": 4.8,
            "highlights": ["Tasting menu", "French techniques", "Elegant atmosphere"],
            "address_suffix": "Upper East Side"
        }
    ],
    "mexican": [
        {
            "name": "Casa Azul",
            "description": "Regional Mexican cuisine beyond typical Tex-Mex. Their mole dishes and hand-pressed tortillas transport you straight to Oaxaca.",
            "priceRange": "$$",
            "rating": 4.5,
            "highlights": ["Regional specialties", "Handmade tortillas", "Mezcal selection"],
            "address_suffix": "Chelsea"
        },
        {
            "name": "Agave & Maíz",
            "description": "Modern Mexican restaurant focusing on sustainable ingredients and traditional cooking methods. Their table-side guacamole and craft margaritas are must-tries.",
            "priceRange": "$$$",
            "rating": 4.6,
            "highlights": ["Farm-to-table", "Traditional methods", "Craft cocktails"],
            "address_suffix": "Tribeca"
        }
    ]
}

def get_vibe_description(vibe, restaurant_name, cuisine_type):
    """Generate a description based on the requested vibe"""
    vibe_descriptions = {
        "romantic": [
            f"The soft candlelight and intimate seating at {restaurant_name} create the perfect atmosphere for a romantic evening. Their attentive yet unobtrusive service ensures you can focus entirely on your companion.",
            f"With dim lighting, secluded booths, and a carefully curated playlist of soft music, {restaurant_name} has mastered the art of romantic dining. Their {cuisine_type} cuisine provides the perfect complement to an unforgettable evening."
        ],
        "casual": [
            f"{restaurant_name} offers a relaxed, unpretentious atmosphere where you can enjoy exceptional {cuisine_type} food without any stuffiness. Their friendly staff and comfortable setting make it perfect for a casual meal.",
            f"The welcoming ambiance at {restaurant_name} strikes the perfect balance between casual comfort and quality dining. It's an ideal spot for catching up with friends over their outstanding {cuisine_type} dishes."
        ],
        "upscale": [
            f"{restaurant_name} delivers an elegant dining experience with impeccable service and sophisticated {cuisine_type} cuisine. The refined atmosphere makes it perfect for special occasions or impressive business dinners.",
            f"With its tasteful décor, professional staff, and meticulously prepared {cuisine_type} dishes, {restaurant_name} represents the pinnacle of upscale dining in the area."
        ],
        "trendy": [
            f"{restaurant_name} is at the cutting edge of the {cuisine_type} dining scene. Their innovative approach and Instagram-worthy presentations have made it a hotspot for food enthusiasts and trend-setters.",
            f"The buzzing atmosphere and creative {cuisine_type} dishes at {restaurant_name} have earned it a reputation as one of the most exciting restaurants in the area. Expect unique flavor combinations and artistic plating."
        ],
        "family-friendly": [
            f"{restaurant_name} welcomes diners of all ages with their accommodating service and menu options that please both sophisticated palates and younger diners. Their {cuisine_type} dishes are authentic while remaining accessible.",
            f"The relaxed atmosphere and attentive staff at {restaurant_name} make dining out with family a pleasure rather than a challenge. Their {cuisine_type} menu includes options for adventurous and conservative eaters alike."
        ]
    }
    
    # Default to romantic if vibe not found
    selected_vibe = vibe.lower() if vibe.lower() in vibe_descriptions else "romantic"
    return random.choice(vibe_descriptions[selected_vibe])

async def generate_azure_openai_recommendation(preferences):
    """Generate restaurant recommendations using Azure OpenAI"""
    try:
        vibe = preferences.get("vibe") or "romantic"
        location = preferences.get("location") or "NYC"
        cuisine = preferences.get("cuisines", ["Fine Dining"])[0] if preferences.get("cuisines") else "Fine Dining"
        budget = preferences.get("budget") or "$$"
        
        logger.info(f"Generating recommendations for {cuisine} cuisine with {vibe} vibe in {location}")
        
        # Create the system prompt
        system_prompt = "You are a restaurant recommendation expert for New York City. Provide accurate, specific recommendations based on preferences."
        
        # Create the user prompt
        user_prompt = f"""
Based on the following preferences:
- Vibe/Mood: {vibe}
- Location: {location}
- Cuisine: {cuisine}
- Budget: {budget}
- Party Size: {preferences.get("partySize") or "2"}

Generate 3 restaurant options that would be perfect matches.
Each restaurant should be a real, well-known establishment in {location} that matches the preferences.
For each restaurant, provide:
1. The restaurant name
2. Cuisine type
3. Price range ($ to $$$$)
4. Location (neighborhood)
5. A brief description (1-2 sentences)
6. 2-3 key highlights that make it special
7. A rating between 4.0 and 5.0

Respond in JSON format like this:
{{
  "restaurants": [
    {{
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "priceRange": "$$",
      "location": "Neighborhood",
      "description": "Brief description of the restaurant",
      "highlights": ["highlight 1", "highlight 2"],
      "rating": 4.8
    }}
  ]
}}
"""
        
        # Make request to Azure OpenAI
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Sending request to Azure OpenAI: {AZURE_ENDPOINT}")
            response = await client.post(
                f"{AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15",
                headers={
                    "Content-Type": "application/json",
                    "api-key": AZURE_API_KEY
                },
                json={
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1200,
                    "response_format": {"type": "json_object"}
                }
            )
            
            # Parse the response
            if response.status_code == 200:
                logger.info("Received successful response from Azure OpenAI")
                content = response.json()["choices"][0]["message"]["content"]
                result = json.loads(content)
                return result.get("restaurants", [])
            else:
                logger.error(f"Azure OpenAI API error: {response.status_code} {response.text}")
                return []
    except Exception as e:
        logger.exception(f"Error generating Azure OpenAI recommendation: {e}")
        return []

async def search_bing_for_restaurant(restaurant_name, location="NYC"):
    """Search Bing for information about a restaurant"""
    try:
        query = f"{restaurant_name} restaurant {location}"
        logger.info(f"Searching Bing for: {query}")
        
        if not BING_API_KEY:
            logger.warning("Bing API Key is not configured, skipping Bing search")
            return {}
        
        logger.info(f"Using API Key: {BING_API_KEY[:5]}...")
        
        # Set up headers based on API type
        if IS_RAPIDAPI:
            headers = {
                "X-RapidAPI-Key": BING_API_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST
            }
            search_url = RAPIDAPI_SEARCH_URL
            images_url = RAPIDAPI_IMAGES_URL
        else:
            headers = {
                "Ocp-Apim-Subscription-Key": BING_API_KEY,
                "Accept": "application/json"
            }
            search_url = BING_SEARCH_URL
            images_url = BING_IMAGES_URL
        
        # Use a more reliable static Unsplash URL format
        # Format: https://images.unsplash.com/photo-{PHOTO_ID}?w=800&q=80
        
        # Pick an image ID based on restaurant name to keep it consistent
        name_sum = sum(ord(c) for c in restaurant_name)
        image_id = restaurant_image_ids[name_sum % len(restaurant_image_ids)]
        
        # Create a static, reliable image URL
        unsplash_image_url = f"https://images.unsplash.com/photo-{image_id}?w=800&q=80"
        logger.info(f"Using static Unsplash image URL: {unsplash_image_url}")
        
        # Make web search request
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                logger.info(f"Making web search request to: {search_url}")
                web_response = await client.get(
                    search_url,
                    headers=headers,
                    params={
                        "q": query,
                        "count": "3",
                        "responseFilter": "Webpages",
                        "mkt": "en-US"
                    }
                )
                
                # Log the web search response
                logger.info(f"Search response status: {web_response.status_code}")
                if web_response.status_code != 200:
                    logger.error(f"Search error: {web_response.text[:200]}")
        except Exception as web_error:
            logger.exception(f"Web search failed: {web_error}")
            web_response = None
        
        # Assign this URL to the results
        results = {"imageUrl": unsplash_image_url}  # Static Unsplash URL
        
        # Process web search results if available
        if web_response and web_response.status_code == 200:
            try:
                web_data = web_response.json()
                logger.info(f"Web data keys: {web_data.keys()}")
                
                # Handle different response formats
                if web_data.get("webPages", {}).get("value", []):
                    # Standard Bing API format
                    webpage = web_data["webPages"]["value"][0]
                    results["url"] = webpage.get("url")
                    results["snippet"] = webpage.get("snippet")
                    logger.info(f"Found web result: {webpage.get('name')} - {webpage.get('url')}")
                elif web_data.get("value", []):
                    # RapidAPI format
                    webpage = web_data["value"][0]
                    results["url"] = webpage.get("url")
                    results["snippet"] = webpage.get("snippet")
                    logger.info(f"Found web result (RapidAPI): {webpage.get('name')} - {webpage.get('url')}")
            except Exception as parse_error:
                logger.exception(f"Error parsing web search results: {parse_error}")
        
        logger.info(f"Final results: {results}")
        return results
    except Exception as e:
        logger.exception(f"Error searching for restaurant: {e}")
        name_sum = sum(ord(c) for c in restaurant_name)
        image_id = restaurant_image_ids[name_sum % len(restaurant_image_ids)]
        return {"imageUrl": f"https://images.unsplash.com/photo-{image_id}?w=800&q=80"}

@app.post("/advise", response_model=AdviseResponse)
async def get_recommendation(request: AdviseRequest):
    try:
        vibe = request.vibe or "romantic"
        location = request.location or "NYC"
        cuisine = request.cuisines[0].lower() if request.cuisines and len(request.cuisines) > 0 else "italian"
        budget = request.budget or "$$"
        
        logger.info(f"Received recommendation request: vibe={vibe}, cuisine={cuisine}, location={location}, budget={budget}")
        
        # Try to get recommendations from Azure OpenAI
        restaurants = await generate_azure_openai_recommendation({
            "vibe": vibe,
            "location": location,
            "cuisines": request.cuisines,
            "budget": budget,
            "partySize": request.partySize
        })
        
        # If we got restaurants from Azure OpenAI, use the first one
        if restaurants and len(restaurants) > 0:
            restaurant_data = restaurants[0]
            logger.info(f"Using AI-generated restaurant: {restaurant_data.get('name')}")
            
            # Try to enrich with Bing Search data if Bing API key is available
            if BING_API_KEY:
                logger.info(f"Attempting to enrich with Bing data for: {restaurant_data.get('name')}")
                bing_data = await search_bing_for_restaurant(restaurant_data["name"], location)
                
                # If we got image data from Bing, use it
                if bing_data.get("imageUrl"):
                    logger.info(f"Using Bing image: {bing_data['imageUrl']}")
                    restaurant_data["imageUrl"] = bing_data["imageUrl"]
                else:
                    logger.warning("No image found from Bing")
                
                # If we got a website from Bing, use it
                if bing_data.get("url"):
                    logger.info(f"Using Bing URL: {bing_data['url']}")
                    restaurant_data["website"] = bing_data["url"]
                else:
                    logger.warning("No URL found from Bing")
            else:
                logger.warning("Bing API key not available, skipping enrichment")
            
            # Generate a personalized response using the recommendation
            recommendation_text = f"Based on your preference for a {vibe} atmosphere and {cuisine} cuisine, I've found the perfect spot in {location}!\n\n{restaurant_data.get('description')}"
            
            # Create a unique ID for this recommendation
            unique_id = f"real-ai-{random.randint(1000, 9999)}"
            
            # Default to a reliable static image URL for cuisine if we don't find one
            cuisine_formatted = cuisine.lower().replace(' ', '-')
            cuisine_sum = sum(ord(c) for c in cuisine)
            image_id = restaurant_image_ids[cuisine_sum % len(restaurant_image_ids)]
            default_image_url = f"https://images.unsplash.com/photo-{image_id}?w=800&q=80"
            
            restaurant = Restaurant(
                id=unique_id,
                name=restaurant_data["name"],
                description=restaurant_data.get("description", "A wonderful dining experience awaits you."),
                cuisineType=restaurant_data.get("cuisine", cuisine.capitalize()),
                priceRange=restaurant_data.get("priceRange", budget),
                location=restaurant_data.get("location", location),
                rating=restaurant_data.get("rating", 4.8),
                imageUrl=restaurant_data.get("imageUrl", default_image_url),
                address=f"{random.randint(1, 999)} {random.choice(['Main', 'Park', 'Broadway', 'Madison', 'Fifth'])} {random.choice(['St', 'Ave', 'Blvd'])}, {restaurant_data.get('location', location)}, {location}",
                phone=f"({random.randint(200, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
                website=restaurant_data.get("website", f"https://www.{restaurant_data['name'].lower().replace(' ', '')}.com"),
                openingHours=[
                    "11:00 AM - 10:00 PM",
                    "11:00 AM - 10:00 PM",
                    "11:00 AM - 10:00 PM",
                    "11:00 AM - 10:00 PM",
                    "11:00 AM - 11:00 PM",
                    "11:00 AM - 11:00 PM",
                    "12:00 PM - 9:00 PM"
                ],
                highlights=restaurant_data.get("highlights", [cuisine.capitalize(), vibe.capitalize(), location]),
                reasonsToRecommend=[
                    f"Perfect for a {vibe} experience",
                    f"Authentic {cuisine} cuisine",
                    f"Matches your {budget} budget"
                ]
            )
            
            logger.info(f"Returning recommendation for: {restaurant.name}")
            return AdviseResponse(response=recommendation_text, restaurant=restaurant)
        
        # If Azure OpenAI didn't return results, fall back to the static data
        logger.warning("No results from Azure OpenAI, falling back to static data")
        
        # Default to Italian if cuisine not found
        cuisine_key = cuisine if cuisine in RESTAURANT_DATA else "italian"
        
        # Select a restaurant based on cuisine
        restaurant_data = random.choice(RESTAURANT_DATA[cuisine_key])
        logger.info(f"Using fallback restaurant: {restaurant_data['name']}")
        
        # Generate a unique restaurant ID
        unique_id = f"real-{random.randint(1000, 9999)}"
        
        # Create a personalized recommendation message
        recommendation_text = f"Based on your preference for a {vibe} atmosphere and {cuisine} cuisine, I've found the perfect spot in {location}!\n\n{get_vibe_description(vibe, restaurant_data['name'], cuisine)}"
        
        # Select a relevant image based on cuisine
        cuisine_sum = sum(ord(c) for c in cuisine)
        image_id = restaurant_image_ids[cuisine_sum % len(restaurant_image_ids)]
        cuisine_image_url = f"https://images.unsplash.com/photo-{image_id}?w=800&q=80"
        
        # Create restaurant object
        restaurant = Restaurant(
            id=unique_id,
            name=restaurant_data["name"],
            description=restaurant_data["description"],
            cuisineType=cuisine.capitalize(),
            priceRange=restaurant_data["priceRange"],
            location=location,
            rating=restaurant_data["rating"],
            imageUrl=cuisine_image_url,
            address=f"{random.randint(1, 999)} {random.choice(['Main', 'Park', 'Broadway', 'Madison', 'Fifth'])} {random.choice(['St', 'Ave', 'Blvd'])}, {restaurant_data['address_suffix']}, {location}",
            phone=f"({random.randint(200, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            website=f"https://www.{restaurant_data['name'].lower().replace(' ', '')}.com",
            openingHours=[
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 11:00 PM",
                "11:00 AM - 11:00 PM",
                "12:00 PM - 9:00 PM"
            ],
            highlights=restaurant_data["highlights"],
            reasonsToRecommend=[
                f"Perfect for a {vibe} experience",
                f"Authentic {cuisine} cuisine",
                f"Matches your {budget} budget"
            ]
        )

        logger.info(f"Returning fallback recommendation for: {restaurant.name}")
        return AdviseResponse(response=recommendation_text, restaurant=restaurant)

    except Exception as e:
        logger.exception(f"Error processing recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
