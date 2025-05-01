import os
import base64
import time
import logging
import uuid
from typing import List, Optional
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.core.exceptions import ResourceExistsError, ResourceNotFoundError

logger = logging.getLogger(__name__)

# Constants
AZURE_STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = os.environ.get("AZURE_STORAGE_CONTAINER_NAME", "images")
LOCAL_IMAGE_DIR = os.path.join("static", "images")

# Ensure local directory exists
os.makedirs(LOCAL_IMAGE_DIR, exist_ok=True)

def get_blob_service_client():
    """Get Azure Blob Service Client"""
    if not AZURE_STORAGE_CONNECTION_STRING:
        logger.warning("Azure Storage connection string not found. Using local storage.")
        return None
    
    try:
        return BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    except Exception as e:
        logger.error(f"Error creating Azure Blob Service client: {str(e)}")
        return None

def ensure_container_exists(blob_service_client):
    """Ensure the blob container exists"""
    if not blob_service_client:
        return False
    
    try:
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        # Check if container exists
        if not container_client.exists():
            container_client = blob_service_client.create_container(CONTAINER_NAME)
            logger.info(f"Created container: {CONTAINER_NAME}")
        return True
    except ResourceExistsError:
        # Container already exists
        logger.info(f"Container {CONTAINER_NAME} already exists")
        return True
    except Exception as e:
        logger.error(f"Error ensuring container exists: {str(e)}")
        return False

def save_base64_image(base64_string: str, filename_prefix: str = "image") -> Optional[str]:
    """
    Save a base64 encoded image to Azure Blob Storage or local filesystem
    
    Args:
        base64_string: Base64 encoded image data
        filename_prefix: Prefix for the generated filename
        
    Returns:
        URL of the saved image or None if failed
    """
    try:
        # Remove base64 prefix if present
        if "," in base64_string:
            _, base64_string = base64_string.split(",", 1)
        
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        
        # Generate unique filename
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4()).replace("-", "")[:8]
        filename = f"{filename_prefix}_{timestamp}_{unique_id}.jpg"
        
        # Try to save to Azure Blob Storage
        blob_service_client = get_blob_service_client()
        if blob_service_client and ensure_container_exists(blob_service_client):
            # Save to Azure Blob Storage
            blob_client = blob_service_client.get_blob_client(
                container=CONTAINER_NAME, 
                blob=filename
            )
            
            # Upload with content settings for MIME type
            blob_client.upload_blob(
                image_data,
                content_settings=ContentSettings(content_type="image/jpeg")
            )
            
            # Return the blob URL
            return blob_client.url
        
        # Fallback to local storage
        logger.info(f"Using local storage for image {filename}")
        local_path = os.path.join(LOCAL_IMAGE_DIR, filename)
        with open(local_path, "wb") as f:
            f.write(image_data)
        
        # Return local path that can be accessed via static file serving
        return f"/static/images/{filename}"
        
    except Exception as e:
        logger.error(f"Error saving image: {str(e)}")
        return None

def delete_image(image_url: str) -> bool:
    """
    Delete an image from Azure Blob Storage or local filesystem
    
    Args:
        image_url: URL of the image to delete
        
    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        # Check if this is an Azure Blob Storage URL
        if AZURE_STORAGE_CONNECTION_STRING and "blob.core.windows.net" in image_url:
            # Extract the blob name from the URL
            blob_name = image_url.split(f"{CONTAINER_NAME}/")[-1]
            if "?" in blob_name:  # Handle SAS token
                blob_name = blob_name.split("?")[0]
                
            # Delete from Azure Blob Storage
            blob_service_client = get_blob_service_client()
            if blob_service_client:
                blob_client = blob_service_client.get_blob_client(
                    container=CONTAINER_NAME, 
                    blob=blob_name
                )
                blob_client.delete_blob()
                logger.info(f"Deleted blob: {blob_name}")
                return True
                
        # Handle local file
        elif image_url.startswith("/static/images/"):
            filename = image_url.split("/")[-1]
            local_path = os.path.join(LOCAL_IMAGE_DIR, filename)
            if os.path.exists(local_path):
                os.remove(local_path)
                logger.info(f"Deleted local file: {local_path}")
                return True
                
        logger.warning(f"Could not determine how to delete image: {image_url}")
        return False
        
    except ResourceNotFoundError:
        logger.warning(f"Image not found: {image_url}")
        return False
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        return False

def list_images(max_results: int = 100) -> List[str]:
    """
    List images in Azure Blob Storage or local filesystem
    
    Args:
        max_results: Maximum number of results to return
        
    Returns:
        List of image URLs
    """
    result = []
    
    try:
        # Try Azure Blob Storage
        blob_service_client = get_blob_service_client()
        if blob_service_client and ensure_container_exists(blob_service_client):
            container_client = blob_service_client.get_container_client(CONTAINER_NAME)
            blobs = container_client.list_blobs(max_results=max_results)
            
            for blob in blobs:
                blob_client = blob_service_client.get_blob_client(
                    container=CONTAINER_NAME, 
                    blob=blob.name
                )
                result.append(blob_client.url)
        
        # Add local files if needed or if Azure failed
        if not result or not blob_service_client:
            if os.path.exists(LOCAL_IMAGE_DIR):
                local_files = os.listdir(LOCAL_IMAGE_DIR)
                for file in local_files[:max_results]:
                    if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                        result.append(f"/static/images/{file}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error listing images: {str(e)}")
        return result
