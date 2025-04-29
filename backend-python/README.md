# Backend - DateMealMobile

This project is a **FastAPI** application that powers restaurant recommendations based on user preferences.

---

## Project Structure

```plaintext
backend-python/
│
├── api/                # API route handlers
│   ├── advise.py
│   ├── health.py
│   ├── refine.py
│
├── models/              # Pydantic schemas (request & response models)
│   └── schemas.py
│
├── services/            # External services integrations
│   ├── openai_service.py
│   ├── bing_service.py
│
├── utils/               # Helper utilities (optional expansion)
│
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── README.md            # You are here!
│
└── .env                 # Environment variables (not committed)
```
---

## How to Run the Backend

1. **Install Python packages:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Create a .env file inside backend-python/:**
    ```bash
    AZURE_API_KEY=your_azure_openai_api_key
    AZURE_ENDPOINT=https://your-resource-name.openai.azure.com
    AZURE_DEPLOYMENT_NAME=gpt-4o

    BING_API_KEY=your_bing_search_api_key
    ```

3. **Start the FastAPI server:**
    ```bash
    uvicorn main:app --reload --port 8001
    ```

4. **Access API Docs:**
    Open your browser and navigate to:
    ```
    http://localhost:8001/docs
    ```


## Key Features
- ```/advise``` – Get restaurant recommendations based on user preferences.
- ```/refine``` – Refine recommendations based on user feedback.
- ```/health``` – Health check endpoint.


## Tech Stack
 - FastAPI — Lightning-fast web API framework
- Pydantic — Data validation and serialization
- Azure OpenAI — (GPT-4o) to generate vivid restaurant suggestions
- Bing Search API — To enrich restaurant info (website, images, etc.)
- Unsplash fallback images — If Bing fails