from models.schemas import Restaurant
import logging
import random
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Get API key from .env file
api_key = os.environ.get("AZURE_OPENAI_API_KEY") or os.environ.get("AZURE_API_KEY")
endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT") or os.environ.get("AZURE_ENDPOINT")
deployment_name = os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME") or os.environ.get("AZURE_DEPLOYMENT_NAME") or "gpt-4o"

# Log environment variable status (but not the actual values)
logger.info(f"API key available: {api_key is not None}")
logger.info(f"Endpoint available: {endpoint is not None}")
logger.info(f"Deployment name: {deployment_name}")

# Initialize OpenAI client - compatible with multiple openai package versions
client = None
try:
    # Try to import AzureOpenAI from newer package version (1.0.0+)
    from openai import AzureOpenAI
    logger.info("Using newer OpenAI package with AzureOpenAI client")
    try:
        client = AzureOpenAI(
            api_key=api_key,
            api_version="2024-02-15-preview",
            azure_endpoint=endpoint
        )
        logger.info("AzureOpenAI client initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing AzureOpenAI client: {str(e)}")
except ImportError:
    # Fall back to older version
    logger.info("AzureOpenAI not available, falling back to older package version")
    try:
        import openai
        openai.api_type = "azure"
        openai.api_key = api_key
        openai.api_base = endpoint
        openai.api_version = "2024-02-15-preview"
        client = openai
        logger.info("Using fallback OpenAI configuration")
    except Exception as e:
        logger.error(f"Error configuring fallback OpenAI: {str(e)}")

# Get model deployment name from environment or default to "gpt-4"
MODEL_DEPLOYMENT_NAME = deployment_name

async def generate_azure_openai_recommendation(preferences: dict) -> list:
    """
    Generate restaurant recommendations using Azure OpenAI.
    """
    try:
        # Return sample data if no API access
        if not api_key or not endpoint or client is None:
            logger.warning("Missing API key, endpoint, or client - returning sample data")
            return get_sample_restaurant(preferences)
            
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
            logger.info(f"Calling Azure OpenAI with model {MODEL_DEPLOYMENT_NAME}")
            if hasattr(client, 'chat') and hasattr(client.chat, 'completions'):
                # New OpenAI package
                response = client.chat.completions.create(
                    model=MODEL_DEPLOYMENT_NAME,
                    messages=[
                        {"role": "system", "content": "You are a restaurant recommendation assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                recommendation = response.choices[0].message.content
            else:
                # Old OpenAI package
                response = client.ChatCompletion.create(
                    engine=MODEL_DEPLOYMENT_NAME,
                    messages=[
                        {"role": "system", "content": "You are a restaurant recommendation assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                recommendation = response.choices[0].message.content
                
            logger.info(f"Received response from Azure OpenAI")
            try:
                import json
                restaurant_data = json.loads(recommendation)
                return [restaurant_data]
            except json.JSONDecodeError:
                logger.error("Failed to parse OpenAI response as JSON")
                return get_sample_restaurant(preferences)
                
        except Exception as api_error:
            logger.error(f"API error: {str(api_error)}")
            return get_sample_restaurant(preferences)

    except Exception as e:
        logger.error(f"Error generating recommendation: {str(e)}", exc_info=True)
        return get_sample_restaurant(preferences)

def get_sample_restaurant(preferences):
    """Return a sample restaurant for fallback"""
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
