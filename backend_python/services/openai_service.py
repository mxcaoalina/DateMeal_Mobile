from models.schemas import Restaurant
import logging
import random
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.openai import OpenAIClient

logger = logging.getLogger(__name__)

# Initialize Azure OpenAI client
client = OpenAIClient(
    endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    credential=AzureKeyCredential(os.getenv("AZURE_OPENAI_API_KEY"))
)

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
        response = client.chat.completions.create(
            model="gpt-4",  # or your specific deployment name
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

    except Exception as e:
        logger.error(f"Error generating recommendation: {str(e)}")
        return None
