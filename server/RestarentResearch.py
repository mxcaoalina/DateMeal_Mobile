import asyncio
import sqlite3
import os
from typing import Annotated
from pydantic import BaseModel
from semantic_kernel.agents import ChatCompletionAgent
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion, OpenAIChatPromptExecutionSettings
from semantic_kernel.functions import kernel_function, KernelArguments

AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_ENDPOINT= ""
AZURE_OPENAI_API_KEY= ""



class RestarentPlugin:
    @kernel_function(description="Provides a list of restarents.")
    def get_restarentsForDateNight(self) -> Annotated[str, "Returns the restarent from the list."]:
        return """
        { type: Italian, price : medium, vibe : classy}
        { type: French: Cobb Salad, price : high, vibe : romantic}
        { type: Japanese, price : medium,  vibe : chill}
        { type: fastfood, price : low,  vibe : casual}
        """
class RestarentItem(BaseModel):
    type: str
    price: str
    vibe: str 
    

async def main():
   
    # Configure structured output format
    settings = OpenAIChatPromptExecutionSettings()
    settings.response_format = RestarentItem
  
    # Create first agnet with plugin and settings
    print("creating first agent")
    agent1 = ChatCompletionAgent(
        service=AzureChatCompletion(
            deployment_name= AZURE_OPENAI_DEPLOYMENT_NAME,
            api_key= AZURE_OPENAI_API_KEY,
            endpoint = AZURE_OPENAI_ENDPOINT,
        ),
    name="SK-Assistant",
    instructions="You are a fun and charming NYC date-night expert. When a user tells you what mood or vibe they want, suggest restaurants that match it. Give recommendations with a short narrative description that sets the scene, not just listing the place",
    plugins=[RestarentPlugin()],
    # arguments=KernelArguments(settings)
    )
    
    response1 = await agent1.get_response(messages="What is the best date night place for romantic vibe?")
    print(response1.content)

asyncio.run(main()) 


## Research - Azure AI serach service, Fast API (SQLite) 
## Recommendar - Will call the research 
## Deployment 
## UI - Gradio UI, Chailit (Semantic - kernel), WebUI, Mobile app 
# EXPO GO 

# Tasks :

# Detailed Instructions of each agent. 
# (Tone and vibe ) - 
# Api - FastAPI ( how can we access Exteranl Api's from Pyton),
# Orchestration - I do hardcodding and testit 
# Front End ? 
# Deployment 
# (Not sure if it is needed) Asure AI search (How to use it and how it works) 