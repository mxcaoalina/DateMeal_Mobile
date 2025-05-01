from fastapi import APIRouter, HTTPException
from models.schemas import AdviseRequest, AdviseResponse, Restaurant
from services.openai_service import generate_azure_openai_recommendation
# from services.bing_service import search_bing_for_restaurant, BING_API_KEY
from services.restaurant_data import RESTAURANT_DATA
import random
import logging

# Setup logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

# Collection of restaurant image search terms
restaurant_image_ids = [
    "italian,restaurant,romantic",
    "french,bistro,wine",
    "japanese,sushi,cozy",
    "mexican,upscale,cocktails",
    "american,steakhouse,romantic",
    "seafood,fine-dining,ocean",
    "vegan,restaurant,green"
]

def get_vibe_description(vibe: str, restaurant_name: str, cuisine: str) -> str:
    return f"{restaurant_name} is a lovely {cuisine} restaurant that perfectly captures a {vibe.lower()} vibe. It's a great place for your date!"

def get_website_url(restaurant_data):
    """Helper function to format website URLs safely."""
    if 'website' in restaurant_data and restaurant_data['website']:
        return restaurant_data['website']
    
    name = restaurant_data.get('name', 'samplerestaurant')
    clean_name = name.lower().replace(' ', '').replace("'", '')
    return f"https://www.{clean_name}.com"

router = APIRouter()

@router.post("/advise", response_model=AdviseResponse)
async def get_recommendation(request: AdviseRequest):
    try:
        vibe = request.vibe or "romantic"
        ambience = request.ambience
        location = request.location or "NYC"
        cuisine = request.cuisines[0].lower() if request.cuisines and len(request.cuisines) > 0 else "italian"
        budget = request.budget or "$$"
        dietary_restrictions = request.dietaryRestrictions or []
        absolute_nogos = request.absoluteNogos or []
        
        logger.info(f"Received recommendation request: vibe={vibe}, ambience={ambience}, cuisine={cuisine}, location={location}, budget={budget}")
        if dietary_restrictions:
            logger.info(f"Dietary restrictions: {', '.join(dietary_restrictions)}")
        if absolute_nogos:
            logger.info(f"Absolute no-gos: {', '.join(absolute_nogos)}")
        
        # Try to get recommendations from Azure OpenAI
        restaurants = await generate_azure_openai_recommendation({
            "vibe": vibe,
            "ambience": ambience,
            "location": location,
            "cuisines": request.cuisines,
            "budget": budget,
            "partySize": request.partySize,
            "dietaryRestrictions": dietary_restrictions,
            "absoluteNogos": absolute_nogos
        })
        
        # If we got restaurants from Azure OpenAI, use the first one
        if restaurants and len(restaurants) > 0:
            restaurant_data = restaurants[0]
            logger.info(f"Using AI-generated restaurant: {restaurant_data.get('name')}")
            
            # Process menu items if available
            menu_items = []
            if "menuItems" in restaurant_data:
                menu_items = restaurant_data["menuItems"]
            else:
                # Generate some basic menu items based on cuisine
                menu_items = [
                    {
                        "name": f"{cuisine.capitalize()} Special",
                        "description": f"Chef's special {cuisine} dish",
                        "price": "$" + str(random.randint(15, 30)),
                        "category": "Main"
                    },
                    {
                        "name": f"Traditional {cuisine.capitalize()} Appetizer",
                        "description": f"Classic {cuisine} starter",
                        "price": "$" + str(random.randint(8, 15)),
                        "category": "Appetizer"
                    }
                ]
            
            description_templates = [
                "Looking for a {vibe} spot with {cuisine} cuisine in {location}? I have just the place for you: {name}! {description}",
                "Based on your vibe for {vibe} and love for {cuisine}, you should definitely check out {name} in {location}! {description}",
                "For your perfect {vibe} experience, {name} in {location} serves amazing {cuisine} dishes. {description}",
                "Feeling like {vibe}? {name} in {location} is a fantastic {cuisine} restaurant that fits your style! {description}",
                "{name} is a {cuisine} gem in {location} that matches your {vibe} vibe perfectly. {description}",
            ]

            recommendation_text = random.choice(description_templates).format(
                vibe=vibe.lower(),
                cuisine=cuisine.lower(),
                location=location,
                name=restaurant_data.get('name', 'this spot'),
                description=restaurant_data.get('description', '')
            )

            restaurant = Restaurant(
                id=f"ai-{random.randint(1000, 9999)}",
                name=restaurant_data.get('name', 'Sample Restaurant'),
                cuisineType=restaurant_data.get('cuisine', cuisine.capitalize()),
                priceRange=restaurant_data.get('priceRange', budget),
                location=restaurant_data.get('location', location),
                rating=restaurant_data.get('rating', 4.5),
                description=restaurant_data.get('description', 'A delightful spot for your meal.'),
                address=restaurant_data.get('fullAddress', f"{random.randint(1,999)} Main St, {location}"),
                phone=restaurant_data.get('phone', f"[Sample] ({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"),
                clean_name=restaurant_data.get('name', 'samplerestaurant').lower().replace(' ', '').replace("'", ''),
                website=get_website_url(restaurant_data),
                imageUrl=restaurant_data.get('imageUrl', f"https://source.unsplash.com/featured/?{cuisine},restaurant"),
                openingHours=restaurant_data.get('openingHours', ["11:00 AM - 10:00 PM"] * 7),
                highlights=restaurant_data.get('highlights', [cuisine.capitalize(), vibe.capitalize(), location]),
                reasonsToRecommend=[
                    f"Perfect for a {vibe} experience",
                    f"Authentic {cuisine} cuisine",
                    f"Matches your {budget} budget"
                ],
                menuItems=menu_items
            )

            return AdviseResponse(response=recommendation_text, restaurant=restaurant)

        # Fallback to static sample
        fallback_data = random.choice(RESTAURANT_DATA.get(cuisine, RESTAURANT_DATA["italian"]))
        logger.warning("Using fallback data.")

        cuisine_keyword = cuisine.replace(' ', '+')
        image_url = f"https://source.unsplash.com/featured/?{cuisine_keyword},restaurant"
        
        restaurant = Restaurant(
            id=f"static-{random.randint(1000, 9999)}",
            name=fallback_data["name"],
            cuisineType=cuisine.capitalize(),
            priceRange=fallback_data.get("priceRange", "$$"),
            location=location,
            rating=fallback_data.get("rating", 4.5),
            description=fallback_data["description"],
            address=f"{random.randint(1,999)} Park Ave, {location}",
            phone=f"[Sample] ({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}",
            website=get_website_url(fallback_data),
            imageUrl=image_url,
            openingHours=["11:00 AM - 10:00 PM"] * 7,
            highlights=["Locally loved", "Charming setting", "Great food"],
            reasonsToRecommend=[
                f"Perfect for a {vibe} experience",
                f"Classic {cuisine} dishes",
                f"Great ambiance and value"
            ],
            menuItems=[]
        )

        response_text = f"Based on your vibe for {vibe}, you might enjoy {restaurant.name} in {location}."
        return AdviseResponse(response=response_text, restaurant=restaurant)

    except Exception as e:
        logger.exception("Error generating recommendation")
        raise HTTPException(status_code=500, detail="Internal server error")

