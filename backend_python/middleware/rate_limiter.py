from fastapi import Request, HTTPException
import time
import logging
from typing import Dict, List, Tuple
import os

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter for API endpoints"""
    
    def __init__(self, 
                 max_requests: int = None, 
                 time_window: int = None):
        """
        Initialize rate limiter with configurable parameters
        
        Args:
            max_requests: Maximum number of requests allowed in the time window
            time_window: Time window in seconds
        """
        # Get values from environment or use defaults
        self.max_requests = max_requests or int(os.environ.get('RATE_LIMIT_MAX_REQUESTS', 60))
        self.time_window = time_window or int(os.environ.get('RATE_LIMIT_TIME_WINDOW', 60))
        
        # Store request history as {client_ip: [(timestamp1), (timestamp2), ...]}
        self.request_history: Dict[str, List[float]] = {}
        
        logger.info(f"Rate limiter initialized: {self.max_requests} requests per {self.time_window} seconds")
    
    async def __call__(self, request: Request, call_next):
        """
        Rate limiting middleware
        
        Args:
            request: FastAPI request object
            call_next: Next middleware in the chain
        """
        client_ip = self._get_client_ip(request)
        
        # Check if client exceeds rate limit
        if not self._allow_request(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(status_code=429, detail="Too many requests")
        
        # If allowed, process the request
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request headers or connection info"""
        # Try to get IP from X-Forwarded-For header (when behind proxy/load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # The first IP in the list is the client IP
            return forwarded_for.split(",")[0].strip()
        
        # Fall back to client.host if no forwarding header
        return request.client.host if request.client else "unknown"
    
    def _allow_request(self, client_ip: str) -> bool:
        """
        Check if a request from the client_ip is allowed based on rate limits
        
        Args:
            client_ip: The client's IP address
            
        Returns:
            True if request is allowed, False otherwise
        """
        current_time = time.time()
        
        # Initialize history for new clients
        if client_ip not in self.request_history:
            self.request_history[client_ip] = []
        
        # Clean up old requests outside the time window
        self.request_history[client_ip] = [
            timestamp for timestamp in self.request_history[client_ip]
            if current_time - timestamp < self.time_window
        ]
        
        # Check if client has reached the limit
        if len(self.request_history[client_ip]) >= self.max_requests:
            return False
        
        # Add this request to history
        self.request_history[client_ip].append(current_time)
        return True

def get_rate_limiter(app):
    """
    Factory function to create a rate limiter middleware.
    Uses environment variables for configuration.
    """
    max_requests = int(os.environ.get("RATE_LIMIT_MAX_REQUESTS", "60"))
    time_window = int(os.environ.get("RATE_LIMIT_TIME_WINDOW", "60"))
    exclude_paths_str = os.environ.get("RATE_LIMIT_EXCLUDE_PATHS", "/health,/docs,/openapi.json")
    exclude_paths = [path.strip() for path in exclude_paths_str.split(",")]
    
    return RateLimiter(
        max_requests=max_requests,
        time_window=time_window
    )
