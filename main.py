# main.py (Updated for Source Passthrough)

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List # Import List

from fastapi.middleware.cors import CORSMiddleware
from gita_rag import GitaRAG

# --- SINGLETON PATTERN (Unchanged) ---
print("Starting server and creating GitaRAG instance...")
gita_engine = GitaRAG()
print("GitaRAG instance created...")

app = FastAPI(title="Bhagavad Gita Chatbot API", version="1.0.0")
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- UPDATED DATA MODELS ---
class QueryRequest(BaseModel):
    query: str
    author: str
    output_language: Optional[str] = 'english'

# New model to represent a single source document
class SourceDocument(BaseModel):
    shloka_id: str
    shloka_sanskrit: str
    commentary: str
    author: str

# The main response now includes the answer and a list of sources
class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceDocument]
# -----------------------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the Bhagavad Gita Chatbot API."}

@app.post("/ask", response_model=QueryResponse)
def ask_gita(request: QueryRequest):
    print(f"Received request: query='{request.query}'...")
    
    # We now call the modified method that returns both answer and sources
    answer, sources = gita_engine.ask_krishna(
        query=request.query,
        author=request.author,
        output_language=request.output_language
    )
    
    return {"answer": answer, "sources": sources}