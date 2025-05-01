from models.schemas import Restaurant
import logging
import random
import os
from openai import AzureOpenAI

logger = logging.getLogger(__name__)

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# Get model deployment name from environment or default to "gpt-4"
MODEL_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")

async def generate_azure_openai_recommendation(preferences: dict) -> list:
    """
    Generate restaurant recommendations using Azure OpenAI.
    """
    try:
        # Construct the prompt based on user preferences
        prompt = f"""
        Based on the following preferences, recommend a restaurant:
        - Cuisine: {preferences.get('cuisines', ['italian'])[0]}
        - Vibe: {preferences.get('vibe', 'romantic')}
        - Location: {preferences.get('location', 'NYC')}
        - Budget: {preferences.get('budget', '$$')}

        Return the recommendation in this JSON format:
        {{
            "name": "Restaurant Name",
            "cuisine": "Cuisine Type",
            "priceRange": "Price Range",
            "location": "Location",
            "rating": 4.5,
            "description": "Detailed description",
            "fullAddress": "Full address",
            "phone": "Phone number",
            "website": "Website URL",
            "imageUrl": "Image URL",
            "openingHours": ["Opening hours for each day"],
            "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
            "menuItems": [
                {{
                    "name": "Dish Name",
                    "description": "Dish description",
                    "price": "Price",
                    "category": "Category"
                }}
            ]
        }}
        """

        # Call Azure OpenAI
        try:
            response = client.chat.completions.create(
                model=MODEL_DEPLOYMENT_NAME,
                messages=[
                    {"role": "system", "content": "You are a restaurant recommendation assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse the response
            recommendation = response.choices[0].message.content
            try:
                import json
                restaurant_data = json.loads(recommendation)
                return [restaurant_data]
            except json.JSONDecodeError:
                logger.error("Failed to parse OpenAI response as JSON")
                return None
                
        except Exception as api_error:
            logger.error(f"API error: {str(api_error)}")
            # Return a fallback sample restaurant
            return [{
                "name": "Sample Restaurant",
                "cuisine": preferences.get("cuisines", ["italian"])[0].capitalize(),
                "priceRange": preferences.get("budget", "$$"),
                "location": preferences.get("location", "NYC"),
                "rating": 4.5,
                "description": "A delightful spot for your meal.",
                "fullAddress": "123 Main St",
                "phone": "(555) 123-4567",
                "website": "https://www.sample.com",
                "imageUrl": "https://source.unsplash.com/featured/?restaurant",
                "openingHours": ["11:00 AM - 10:00 PM"] * 7,
                "highlights": ["Great ambiance", "Friendly staff", "Delicious food"],
                "menuItems": [
                    {
                        "name": "Sample Dish",
                        "description": "A delicious sample dish",
                        "price": "$20",
                        "category": "Main"
                    }
                ]
            }]

    except Exception as e:
        logger.error(f"Error generating recommendation: {str(e)}")
        return None
