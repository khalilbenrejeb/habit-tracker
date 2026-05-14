import os
import httpx
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Setup paths to find the .env file one directory up
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI()

# 2. Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# 3. Config - Pulling the exact name from your .env
GEMINI_KEY = os.getenv("EXPO_PUBLIC_GEMINI_KEY")
# Using 1.5-flash which is the current stable high-speed model
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"

class Msg(BaseModel):
    message: str

@app.get("/")
async def status():
    """Simple route to verify the server is alive"""
    return {"status": "Daily Grind API is active 🚀", "docs": "/docs"}

@app.post("/chat")
async def chat(body: Msg):
    if not GEMINI_KEY:
        return {"reply": "API Key is missing! Check your .env file. 🔑"}

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            res = await client.post(
                GEMINI_URL,
                json={
                    "contents": [{
                        "parts": [{"text": f"You are the Daily Grind AI coach. Keep it short, hype the user up, use emojis. User: {body.message}"}]
                    }]
                }
            )
            res.raise_for_status()
            data = res.json()
        except Exception as e:
            return {"reply": f"Connection error: {str(e)} 😵"}

    # Extract the response text safely
    try:
        candidate = data.get("candidates", [{}])[0]
        
        if candidate.get("finishReason") == "SAFETY":
            return {"reply": "Can't talk about that. Stay focused! 🎯"}

        parts = candidate.get("content", {}).get("parts", [{}])
        reply = parts[0].get("text", "").strip()
        
        return {"reply": reply or "I'm stuck... rephrase that! 🤔"}
    except (IndexError, KeyError):
        return {"reply": "Gemini sent back a weird response. Try again! 🌀"}

# Run with: uvicorn server:app --reload