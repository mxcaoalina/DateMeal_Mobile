import os
import json
import httpx
import logging

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# Load environment variables
AZURE_API_KEY = os.getenv("AZURE_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME", "gpt-4o")
headers = {
    "Content-Type": "application/json",
    "api-key": AZURE_API_KEY
}

logger = logging.getLogger(__name__)

async def generate_azure_openai_recommendation(preferences: dict):
    """Generate restaurant recommendations using Azure OpenAI."""
    try:
        vibe = preferences.get("vibe") or "romantic"
        ambience = preferences.get("ambience")
        location = preferences.get("location") or "NYC"
        cuisine = preferences.get("cuisines", ["Fine Dining"])[0] if preferences.get("cuisines") else "Fine Dining"
        budget = preferences.get("budget") or "$$"
        dietary_restrictions = preferences.get("dietaryRestrictions", [])
        absolute_nogos = preferences.get("absoluteNogos", [])

        logger.info(f"Generating recommendations for {cuisine} cuisine with {vibe} vibe in {location}")

        # Check if API key and endpoint are available
        if not AZURE_API_KEY or not AZURE_ENDPOINT:
            logger.warning("Azure OpenAI configuration is incomplete. Missing API key or endpoint.")
            return []

        system_prompt = """
            You are a recommendation engine for restaurants. 
            Always output responses ONLY in strict JSON format without any additional text.
            
            IMPORTANT: Provide real, accurate information for restaurant addresses, phone numbers, and websites.
            Do not use placeholder values like 'example.com' for websites or sample addresses.
            If you don't know the exact information, it's better to omit these fields than to provide fake data.

            Example format:

            {
                "restaurants": [
                    {
                    "name": "Restaurant Name",
                    "cuisine": "Cuisine Type",
                    "priceRange": "$$",
                    "location": "Neighborhood or City",
                    "fullAddress": "123 Example St, Brooklyn, NY 11211",
                    "phone": "(212) 555-1234",
                    "rating": 4.7,
                    "description": "Brief description of the restaurant.",
                    "website": "https://example.com",
                    "imageUrl": "https://example.com/image.jpg",
                    "highlights": ["Great wine list", "Rooftop dining"],
                    "menuItems": [
                        {
                        "name": "Dish Name",
                        "description": "Dish description",
                        "price": "$15",
                        "category": "Main"
                        }
                    ]
                    }
                ]
            }
        """

        user_prompt = f"""
        Preferences:
        - Vibe: {vibe}
        - Ambience: {ambience or "Flexible"}
        - Location: {location}
        - Cuisine: {cuisine}
        - Budget: {budget}
        - Party Size: {preferences.get("partySize", "2")}
        - Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else "None"}
        - No-go Items: {', '.join(absolute_nogos) if absolute_nogos else "None"}

        Please provide recommendations for real restaurants that match these preferences.
        
        IMPORTANT: For each restaurant, please include:
        - Real, accurate full address (fullAddress field)
        - Actual website URL (not example.com)
        - Real phone number if known
        
        If you don't know the exact information for any of these fields, omit them rather than providing placeholder data.
        
        For each restaurant, return the following:
        - Restaurant Name
        - Cuisine
        - Price Range
        - Location (Neighborhood or City)
        - fullAddress
        - phone number
        - Rating
        - Short Description
        - Website URL (if possible)
        - Image URL (if possible)
        - 2-3 Highlights
        - 3-5 Popular Menu Items (with name, description, price, and category)

        Respond ONLY as a valid JSON array called "restaurants".
        """

        async with httpx.AsyncClient(timeout=30.0) as client:
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

        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            logger.info(f"OpenAI response: {content[:200]}...")  # Log first 200 chars of response
            result = json.loads(content)
            return result.get("restaurants", [])

        logger.error(f"Azure API error {response.status_code}: {response.text}")
        return []

    except Exception as e:
        logger.exception("Error generating OpenAI recommendations")
        return []
