import httpx
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── run with: uvicorn server:app --reload ─────────────────────────────────────
# ── set env:  export GEMINI_API_KEY=your_key_here ─────────────────────────────

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "PUT_YOUR_KEY_HERE")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"


class Msg(BaseModel):
    message: str


@app.post("/chat")
async def chat(body: Msg):
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(GEMINI_URL, json={
            "contents": [{
                "parts": [{"text": f"You are the Daily Grind AI coach. Keep it short, hype the user up, use emojis. User: {body.message}"}]
            }]
        })

    data = res.json()

    if "error" in data:
        return {"reply": "Something broke on Gemini's end 😵 Try again!"}

    candidate = data.get("candidates", [{}])[0]

    if candidate.get("finishReason") == "SAFETY":
        return {"reply": "Can't talk about that. Stay focused! 🎯"}

    reply = candidate.get("content", {}).get("parts", [{}])[0].get("text", "").strip()
    return {"reply": reply or "I'm stuck... rephrase that! 🤔"}