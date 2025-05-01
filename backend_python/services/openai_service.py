from fastapi import APIRouter, HTTPException
from models.schemas import AdviseRequest, AdviseResponse, Restaurant
from services.openai_service import generate_azure_openai_recommendation
from services.restaurant_data import RESTAURANT_DATA
import logging
import random

router = APIRouter()
logger = logging.getLogger(__name__)

# Fallback image keywords
restaurant_image_keywords = [
    "italian,restaurant,romantic", "french,bistro,wine", "japanese,sushi,cozy",
    "mexican,upscale,cocktails", "american,steakhouse,romantic",
    "seafood,fine-dining,ocean", "vegan,restaurant,green"
]

description_templates = [
    "Looking for a {vibe} spot with {cuisine} cuisine in {location}? I have just the place for you: {name}! {description}",
    "Based on your vibe for {vibe} and love for {cuisine}, you should definitely check out {name} in {location}! {description}",
    "For your perfect {vibe} experience, {name} in {location} serves amazing {cuisine} dishes. {description}",
    "Feeling like {vibe}? {name} in {location} is a fantastic {cuisine} restaurant that fits your style! {description}",
    "{name} is a {cuisine} gem in {location} that matches your {vibe} vibe perfectly. {description}"
]

@router.post("/advise", response_model=AdviseResponse)
async def get_recommendation(request: AdviseRequest):
    try:
        preferences = request.dict()
        vibe = preferences.get("vibe") or "romantic"
        cuisine = preferences.get("cuisines", ["italian"])[0].lower()
        location = preferences.get("location") or "NYC"
        budget = preferences.get("budget") or "$$"

        logger.info(f"Getting recommendation for cuisine={cuisine}, vibe={vibe}, location={location}")

        # Attempt to get recommendations from Azure OpenAI
        restaurants = await generate_azure_openai_recommendation(preferences)

        if restaurants:
            data = restaurants[0]
            logger.info(f"Using AI recommendation: {data.get('name')}")

            menu_items = data.get("menuItems", [
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
            ])

            cuisine_keyword = cuisine.replace(' ', '+')
            default_image_url = f"https://source.unsplash.com/featured/?{cuisine_keyword},restaurant"

            restaurant = Restaurant(
                id=f"ai-{random.randint(1000, 9999)}",
                name=data["name"],
                cuisineType=data.get("cuisine", cuisine.capitalize()),
                priceRange=data.get("priceRange", budget),
                location=data.get("location", location),
                rating=data.get("rating", 4.5),
                description=data.get("description", "A delightful spot for your meal."),
                address=data.get("fullAddress", f"{random.randint(1,999)} Main St, {location}"),
                phone=data.get("phone", f"[Sample] ({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"),
                website=data.get("website", f"https://www.{data['name'].lower().replace(' ', '').replace(\"'\", '')}.com"),
                imageUrl=data.get("imageUrl", default_image_url),
                openingHours=data.get("openingHours", ["11:00 AM - 10:00 PM"] * 7),
                highlights=data.get("highlights", [cuisine.capitalize(), vibe.capitalize(), location]),
                reasonsToRecommend=[
                    f"Perfect for a {vibe} experience",
                    f"Authentic {cuisine} cuisine",
                    f"Matches your {budget} budget"
                ],
                menuItems=menu_items
            )

            response_text = random.choice(description_templates).format(
                vibe=vibe.lower(),
                cuisine=cuisine.lower(),
                location=location,
                name=restaurant.name,
                description=restaurant.description
            )
            return AdviseResponse(response=response_text, restaurant=restaurant)

        # Fallback to static sample
        fallback_data = random.choice(RESTAURANT_DATA.get(cuisine, RESTAURANT_DATA["italian"]))
        logger.warning("Using fallback data.")

        cuisine_keyword = cuisine.replace(' ', '+')
        image_url = f"https://source.unsplash.com/featured/?{cuisine_keyword},restaurant"
        website_name = fallback_data['name'].lower().replace(' ', '').replace("'", '')
        website_url = f"https://www.{website_name}.com"

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
            website=website_url,
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
