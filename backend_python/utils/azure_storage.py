import os
import logging
from typing import Optional
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError

logger = logging.getLogger(__name__)

class AzureStorageUtils:
    """Utility for interacting with Azure Blob Storage"""
    
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER", "images")
        self.initialized = False
        
        if self.connection_string:
            try:
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                self.initialized = True
                # Ensure container exists
                self._ensure_container()
            except Exception as e:
                logger.error(f"Failed to initialize Azure Blob Storage: {e}")
        else:
            logger.warning("Azure Storage not configured - blob operations will be disabled")
    
    def _ensure_container(self) -> None:
        """Create the container if it doesn't exist"""
        if not self.initialized:
            return
            
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            if not container_client.exists():
                container_client = self.blob_service_client.create_container(self.container_name)
                logger.info(f"Created container: {self.container_name}")
        except ResourceExistsError:
            # Container already exists
            pass
        except Exception as e:
            logger.error(f"Error creating container: {e}")
    
    def upload_image(self, image_data: bytes, blob_name: str) -> Optional[str]:
        """
        Upload an image to Azure Blob Storage
        
        Args:
            image_data: Image content as bytes
            blob_name: Name for the blob (filename)
            
        Returns:
            URL to the uploaded blob or None if upload fails
        """
        if not self.initialized:
            logger.warning("Azure Storage not initialized - can't upload image")
            return None
            
        try:
            # Create blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            
            # Upload the image
            blob_client.upload_blob(image_data, overwrite=True)
            
            # Return the URL to the blob
            return blob_client.url
        except Exception as e:
            logger.error(f"Error uploading image to Azure Blob Storage: {e}")
            return None
    
    def download_image(self, blob_name: str) -> Optional[bytes]:
        """
        Download an image from Azure Blob Storage
        
        Args:
            blob_name: Name of the blob to download
            
        Returns:
            Image content as bytes or None if download fails
        """
        if not self.initialized:
            logger.warning("Azure Storage not initialized - can't download image")
            return None
            
        try:
            # Create blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            
            # Download the image
            download_stream = blob_client.download_blob()
            return download_stream.readall()
        except Exception as e:
            logger.error(f"Error downloading image from Azure Blob Storage: {e}")
            return None
    
    def delete_image(self, blob_name: str) -> bool:
        """
        Delete an image from Azure Blob Storage
        
        Args:
            blob_name: Name of the blob to delete
            
        Returns:
            True if successful, False otherwise
        """
        if not self.initialized:
            logger.warning("Azure Storage not initialized - can't delete image")
            return False
            
        try:
            # Create blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            
            # Delete the blob
            blob_client.delete_blob()
            return True
        except Exception as e:
            logger.error(f"Error deleting image from Azure Blob Storage: {e}")
            return False

# Create a singleton instance
azure_storage = AzureStorageUtils() 