# main.py (Final Version with Conditional Audio)

import os
import uuid
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from dotenv import load_dotenv

from gita_rag import GitaRAG

# --- SETUP (Unchanged) ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# --- SINGLETONS & CLIENTS (Unchanged) ---
logger.info("Creating GitaRAG engine instance...")
gita_engine = GitaRAG()
logger.info("GitaRAG engine created.")
try:
    elevenlabs_api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not elevenlabs_api_key: raise ValueError("ELEVENLABS_API_KEY not found.")
    elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key)
    logger.info("Successfully initialized ElevenLabs client.")
except Exception as e:
    logger.error(f"Failed to initialize ElevenLabs client: {e}")
    elevenlabs_client = None

TEMP_AUDIO_DIR = "temp_audio"
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)

app = FastAPI(title="Bhagavad Gita Chatbot API", version="1.3.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- DATA MODELS ---
class QueryRequest(BaseModel):
    query: str
    author: str
    output_language: Optional[str] = 'english'
    generate_audio: Optional[bool] = False # <-- THE KEY ADDITION

class SourceDocument(BaseModel): # (Unchanged)
    shloka_id: str; shloka_sanskrit: str; commentary: str; author: str
class QueryResponse(BaseModel): # (Unchanged)
    answer: str; sources: List[SourceDocument]; audio_url: Optional[str] = None

# --- API ENDPOINTS ---
@app.get("/")
def read_root(): return {"message": "Bhagavad Gita Chatbot API is running."}

@app.post("/ask", response_model=QueryResponse)
def ask_gita(request: QueryRequest):
    logger.info(f"Received query: '{request.query}', Generate Audio: {request.generate_audio}")
    answer, sources = gita_engine.ask_krishna(
        query=request.query, author=request.author, output_language=request.output_language
    )
    
    audio_url = None
    # --- THE KEY LOGIC CHANGE ---
    # Only generate audio if the client requested it
    if elevenlabs_client and answer and request.generate_audio:
        try:
            logger.info("Generating audio with ElevenLabs...")
            # ... (The rest of the audio generation logic is the same)
            audio_filename = f"gita_response_{uuid.uuid4()}.mp3"
            audio_filepath = os.path.join(TEMP_AUDIO_DIR, audio_filename)
            response = elevenlabs_client.text_to_speech.convert(
                voice_id="pNInz6obpgDQGcFmaJgB", # Adam
                text=answer, model_id="eleven_multilingual_v2", 
                voice_settings=VoiceSettings(stability=0.4, similarity_boost=0.75),
            )
            with open(audio_filepath, "wb") as f:
                for chunk in response: f.write(chunk)
            audio_url = f"http://127.0.0.1:8000/audio/{audio_filename}"
            logger.info(f"Audio generated successfully: {audio_url}")
        except Exception as e:
            logger.error(f"Error during audio generation: {e}")
            audio_url = None
    
    return {"answer": answer, "sources": sources, "audio_url": audio_url}

@app.get("/audio/{filename}") # (Unchanged)
def get_audio(filename: str):
    filepath = os.path.join(TEMP_AUDIO_DIR, filename)
    if os.path.exists(filepath): return FileResponse(filepath, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Audio file not found")