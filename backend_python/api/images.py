from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse, Response
from typing import Optional
import uuid
import logging
import os
from pathlib import Path
from utils.imageUtils import ImageUtils
from utils.azure_storage import azure_storage

router = APIRouter()
logger = logging.getLogger(__name__)

def save_local_image(image_data: bytes, filename: str) -> str:
    """Save image to local static directory as fallback"""
    try:
        static_dir = Path("static/images")
        static_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = static_dir / filename
        with open(file_path, "wb") as f:
            f.write(image_data)
            
        return f"/static/images/{filename}"
    except Exception as e:
        logger.error(f"Error saving local image: {e}")
        return ""

@router.post("/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    """
    Upload an image to Azure Blob Storage
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
            
        # Generate a unique filename if one wasn't provided
        if not name:
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            name = f"{uuid.uuid4()}.{file_extension}"
        
        # Try to upload to Azure Blob Storage
        image_url = None
        if azure_storage.initialized:
            image_url = azure_storage.upload_image(contents, name)
            
        # If Azure Storage failed, save locally as fallback
        if not image_url:
            logger.warning("Azure Storage upload failed, saving locally")
            local_url = save_local_image(contents, name)
            
            if not local_url:
                raise HTTPException(status_code=500, detail="Failed to save image")
                
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Image saved locally (Azure Storage not available)",
                    "url": local_url,
                    "name": name,
                    "storage": "local"
                }
            )
            
        return {
            "message": "Image uploaded successfully to Azure",
            "url": image_url,
            "name": name,
            "storage": "azure"
        }
    except Exception as e:
        logger.exception(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@router.get("/images/{image_name}")
async def get_image_info(image_name: str):
    """
    Get information about an image
    """
    try:
        # Check if the image exists in Azure Blob Storage
        if azure_storage.initialized:
            image_data = azure_storage.download_image(image_name)
            if image_data:
                return {
                    "name": image_name,
                    "url": f"{azure_storage.blob_service_client.url}{azure_storage.container_name}/{image_name}",
                    "exists": True,
                    "storage": "azure"
                }
        
        # Check if image exists locally
        local_path = Path(f"static/images/{image_name}")
        if local_path.exists():
            return {
                "name": image_name,
                "url": f"/static/images/{image_name}",
                "exists": True,
                "storage": "local"
            }
        
        # Image not found
        return {
            "name": image_name,
            "exists": False
        }
    except Exception as e:
        logger.exception(f"Error getting image info: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving image info: {str(e)}")

@router.get("/images/{image_name}/content")
async def get_image(image_name: str):
    """
    Get the actual image content
    """
    try:
        # Try to get the image from Azure Blob Storage
        if azure_storage.initialized:
            image_data = azure_storage.download_image(image_name)
            if image_data:
                # Determine content type based on file extension
                content_type = "image/jpeg"  # Default
                if image_name.lower().endswith(".png"):
                    content_type = "image/png"
                elif image_name.lower().endswith(".gif"):
                    content_type = "image/gif"
                elif image_name.lower().endswith(".webp"):
                    content_type = "image/webp"
                    
                return Response(content=image_data, media_type=content_type)
        
        # Check if image exists locally
        local_path = Path(f"static/images/{image_name}")
        if local_path.exists():
            with open(local_path, "rb") as f:
                image_data = f.read()
                
            # Determine content type based on file extension
            content_type = "image/jpeg"  # Default
            if image_name.lower().endswith(".png"):
                content_type = "image/png"
            elif image_name.lower().endswith(".gif"):
                content_type = "image/gif"
            elif image_name.lower().endswith(".webp"):
                content_type = "image/webp"
                
            return Response(content=image_data, media_type=content_type)
        
        # Image not found
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        logger.exception(f"Error retrieving image: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving image: {str(e)}") 