from fastapi import APIRouter, HTTPException
from models.schemas import RefineRequest, RefineResponse
import random
import logging

# Setup logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/restaurant/refine", response_model=RefineResponse)
async def refine_recommendations(request: RefineRequest):
    """
    Refine previous restaurant recommendations based on user feedback message.
    """
    try:
        logger.info(f"Received refine request based on feedback: {request.userMessage}")

        # For now, just a very simple mock refinement: shuffle restaurants
        refined_restaurants = request.previousRecommendations.copy()

        # Simulate refinement by reordering / slight random change
        random.shuffle(refined_restaurants)

        reasoning = f"Updated recommendations based on your feedback: '{request.userMessage}'. Hope you like these better!"

        return RefineResponse(
            recommendations=refined_restaurants,
            reasoning=reasoning
        )

    except Exception as e:
        logger.exception(f"Error refining recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))
