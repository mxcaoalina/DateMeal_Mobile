import os
import base64
from typing import Optional, Union
from pathlib import Path
import requests
from io import BytesIO

class ImageUtils:
    """Utility class for handling images in the application."""
    
    @staticmethod
    def encode_image_to_base64(image_path: Union[str, Path]) -> Optional[str]:
        """
        Encode an image file to base64 string
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Base64 encoded string or None if file doesn't exist
        """
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"Error encoding image: {e}")
            return None
    
    @staticmethod
    def download_image(url: str) -> Optional[bytes]:
        """
        Download image from URL
        
        Args:
            url: URL of the image
            
        Returns:
            Image bytes or None if download fails
        """
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Error downloading image: {e}")
            return None
    
    @staticmethod
    def save_image(image_data: bytes, output_path: Union[str, Path]) -> bool:
        """
        Save image bytes to file
        
        Args:
            image_data: Image bytes
            output_path: Path to save the image
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, "wb") as f:
                f.write(image_data)
            return True
        except Exception as e:
            print(f"Error saving image: {e}")
            return False
            
    @staticmethod
    def url_to_base64(url: str) -> Optional[str]:
        """
        Download image from URL and convert to base64
        
        Args:
            url: URL of the image
            
        Returns:
            Base64 encoded string or None if download fails
        """
        try:
            image_data = ImageUtils.download_image(url)
            if image_data:
                return base64.b64encode(image_data).decode('utf-8')
            return None
        except Exception as e:
            print(f"Error converting URL to base64: {e}")
            return None 