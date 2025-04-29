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
            
            # Try to enrich with Bing Search data if Bing API key is available
            # if BING_API_KEY:
            #     logger.info(f"Attempting to enrich with Bing data for: {restaurant_data.get('name')}")
            #     bing_data = await search_bing_for_restaurant(restaurant_data["name"], location)
                
            #     # If we got image data from Bing, use it
            #     if bing_data.get("imageUrl"):
            #         logger.info(f"Using Bing image: {bing_data['imageUrl']}")
            #         restaurant_data["imageUrl"] = bing_data["imageUrl"]
            #      else:
            #         logger.warning("No image found from Bing")
                
            # If we got a website from Bing, use it
            # if bing_data.get("url"):
            #     logger.info(f"Using Bing URL: {bing_data['url']}")
            #     restaurant_data["website"] = bing_data["url"]
            # else:
            #     logger.warning("No URL found from Bing")
            # else:
            #     logger.warning("Bing API key not available, skipping enrichment")
            
            # Generate a personalized response using the recommendation
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
                description=restaurant_data.get('description', 'A wonderful dining experience awaits you.')
            )

            
            # Create a unique ID for this recommendation
            unique_id = f"real-ai-{random.randint(1000, 9999)}"
            
            # Default to a reliable static image URL for cuisine if we don't find one
            cuisine_formatted = cuisine.lower().replace(' ', '-')
            cuisine_sum = sum(ord(c) for c in cuisine)
            # image_id = restaurant_image_ids[cuisine_sum % len(restaurant_image_ids)]
            # default_image_url = f"https://images.unsplash.com/photo-{image_id}?w=800&q=80"
            cuisine_keyword = cuisine.lower().replace(' ', '+')
            default_image_url = f"https://source.unsplash.com/featured/?{cuisine_keyword},restaurant"
            
            # Properly handle the address - use fullAddress if provided, otherwise construct a realistic sample
            restaurant_address = ""
            if "fullAddress" in restaurant_data:
                restaurant_address = restaurant_data["fullAddress"]
            elif "address" in restaurant_data:
                restaurant_address = restaurant_data["address"]
            else:
                restaurant_address = f"{random.randint(1, 999)} {random.choice(['Main', 'Park', 'Broadway', 'Madison', 'Fifth'])} {random.choice(['St', 'Ave', 'Blvd'])}, {restaurant_data.get('location', location)}, {location}"
            
            # Handle image URL - if OpenAI returns one, check if it's a real URL (not example.com)
            restaurant_image = default_image_url
            if "imageUrl" in restaurant_data and "example.com" not in restaurant_data["imageUrl"]:
                restaurant_image = restaurant_data["imageUrl"]
            
            restaurant = Restaurant(
                id=unique_id,
                name=restaurant_data["name"],
                description=restaurant_data.get("description", "A wonderful dining experience awaits you."),
                cuisineType=restaurant_data.get("cuisine", cuisine.capitalize()),
                priceRange=restaurant_data.get("priceRange", budget),
                location=restaurant_data.get("location", location),
                rating=restaurant_data.get("rating", 4.8),
                imageUrl=restaurant_image,
                address=restaurant_address,
                phone=restaurant_data.get("phone") if "phone" in restaurant_data else f"[Sample] ({random.randint(200, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
                website=restaurant_data.get("website") if "website" in restaurant_data and restaurant_data.get("website") else (
                    lambda name: "https://www." + name.lower().replace(" ", "").replace("'", "") + ".com"
                )(restaurant_data['name']),
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
                ],
                menuItems=restaurant_data.get("menuItems", menu_items)
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
        cuisine_keyword = cuisine.lower().replace(' ', '+')
        cuisine_image_url = f"https://source.unsplash.com/featured/?{cuisine_keyword},restaurant"
        
        # Generate a realistic address
        restaurant_address = f"{random.randint(1, 999)} {random.choice(['Main', 'Park', 'Broadway', 'Madison', 'Fifth'])} {random.choice(['St', 'Ave', 'Blvd'])}, {random.choice(['Greenwich Village', 'SoHo', 'Upper East Side', 'Brooklyn Heights', 'Williamsburg'])}, {location}"
        
        # Create a realistic website
        restaurant_name = restaurant_data['name'].lower().replace(' ', '')
        restaurant_name = restaurant_name.replace("'", "")  # Handle single quotes outside the f-string
        restaurant_website = "https://www." + restaurant_name + ".com"
        
        # Generate sample menu items based on cuisine
        menu_items = [
            {
                "name": f"{cuisine.capitalize()} Specialty",
                "description": f"House specialty {cuisine} dish",
                "price": "$" + str(random.randint(15, 35)),
                "category": "Main"
            },
            {
                "name": f"{cuisine.capitalize()} Appetizer Sampler",
                "description": f"Selection of traditional {cuisine} starters",
                "price": "$" + str(random.randint(10, 20)),
                "category": "Appetizer"
            },
            {
                "name": f"Chef's {cuisine.capitalize()} Selection",
                "description": f"Chef's daily special {cuisine} creation",
                "price": "$" + str(random.randint(20, 40)),
                "category": "Main"
            },
            {
                "name": f"Traditional {cuisine.capitalize()} Dessert",
                "description": f"Authentic {cuisine} sweet",
                "price": "$" + str(random.randint(8, 15)),
                "category": "Dessert"
            }
        ]
        
        # Create restaurant object
        restaurant = Restaurant(
            id=unique_id,
            name=restaurant_data["name"],
            description=restaurant_data["description"],
            cuisineType=cuisine.capitalize(),
            priceRange=restaurant_data.get("priceRange", "$$"),
            location=location,
            rating=restaurant_data.get("rating", 4.5),
            imageUrl=cuisine_image_url,
            address=restaurant_address,
            phone=f"[Sample] ({random.randint(200, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            website=restaurant_website,
            openingHours=[
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 10:00 PM",
                "11:00 AM - 11:00 PM",
                "11:00 AM - 11:00 PM",
                "12:00 PM - 9:00 PM"
            ],
            highlights=restaurant_data.get("highlights", ["Cozy ambiance", "Great for dates", "Highly rated by locals"]),
            reasonsToRecommend=[
                f"Perfect for a {vibe} experience",
                f"Authentic {cuisine} cuisine",
                f"Matches your {budget} budget"
            ],
            menuItems=menu_items
        )

        logger.info(f"Returning fallback recommendation for: {restaurant.name}")
        return AdviseResponse(response=recommendation_text, restaurant=restaurant)

    except Exception as e:
        logger.exception(f"Error processing recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

