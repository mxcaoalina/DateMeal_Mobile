import os
import random
import httpx
import logging

logger = logging.getLogger(__name__)

# Load environment variables
BING_API_KEY = os.getenv("BING_API_KEY")
IS_RAPIDAPI = BING_API_KEY and BING_API_KEY.startswith("2257")

RAPIDAPI_HOST = "bing-image-search1.p.rapidapi.com"
RAPIDAPI_SEARCH_URL = "https://bing-web-search1.p.rapidapi.com/search"
RAPIDAPI_IMAGES_URL = "https://bing-image-search1.p.rapidapi.com/images/search"

BING_SEARCH_URL = "https://api.bing.microsoft.com/v7.0/search"
BING_IMAGES_URL = "https://api.bing.microsoft.com/v7.0/images/search"

# Hard-coded Unsplash fallback images
restaurant_image_ids = [
    "1517248135467-4c7edcad34c4", "1554118811-1e0d58224f24",
    "1514933651103-005eec06c04b", "1466978913421-dad2ebd01d17",
    "1533777857889-4be7c70b33f7", "1555126634-323283e090fa",
    "1414235077428-338989a2e8c0", "1482275548304-a58859dc31b7",
    "1504754524-8c4a1696c38b", "1561758033-d8f159ad5b56",
    "1563245372-4ccd67778a25"
]

async def search_bing_for_restaurant(restaurant_name: str, location: str = "NYC") -> dict:
    """Search Bing (or fallback) for restaurant info."""
    try:
        query = f"{restaurant_name} restaurant {location}"
        logger.info(f"Searching Bing for: {query}")

        if not BING_API_KEY:
            logger.warning("No Bing API key configured. Returning fallback image.")
            return get_fallback_image(restaurant_name)

        # Set up headers
        if IS_RAPIDAPI:
            headers = {
                "X-RapidAPI-Key": BING_API_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST,
            }
            search_url = RAPIDAPI_SEARCH_URL
        else:
            headers = {
                "Ocp-Apim-Subscription-Key": BING_API_KEY,
                "Accept": "application/json",
            }
            search_url = BING_SEARCH_URL

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                search_url,
                headers=headers,
                params={"q": query, "count": 1, "mkt": "en-US"}
            )

        if response.status_code != 200:
            logger.error(f"Bing search error {response.status_code}: {response.text}")
            return get_fallback_image(restaurant_name)

        result = response.json()

        # Standard format
        webpage_url = None
        if result.get("webPages", {}).get("value"):
            webpage_url = result["webPages"]["value"][0]["url"]
        elif result.get("value"):
            webpage_url = result["value"][0]["url"]

        # Always return at least an image URL
        final_result = get_fallback_image(restaurant_name)
        if webpage_url:
            final_result["url"] = webpage_url

        return final_result

    except Exception as e:
        logger.exception(f"Error in Bing search: {e}")
        return get_fallback_image(restaurant_name)

def get_fallback_image(name: str) -> dict:
    """Generate a consistent fallback Unsplash image for a restaurant."""
    name_sum = sum(ord(c) for c in name)
    image_id = restaurant_image_ids[name_sum % len(restaurant_image_ids)]
    return {
        "imageUrl": f"https://images.unsplash.com/photo-{image_id}?w=800&q=80"
    }
