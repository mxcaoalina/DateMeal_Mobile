from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from api import advise, health, refine, images
from utils.logger import setup_logger

app = FastAPI()

setup_logger()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory if it doesn't exist
os.makedirs("static/images", exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Backend is running"}

app.include_router(advise.router)
app.include_router(health.router)
app.include_router(refine.router)
app.include_router(images.router)

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://localhost:8080")
    uvicorn.run(app, host="0.0.0.0", port=8080)
