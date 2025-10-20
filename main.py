# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

# This allows your React frontend to communicate with this backend
from fastapi.middleware.cors import CORSMiddleware

# Import our powerful, self-contained RAG engine
from gita_rag import GitaRAG

# --- THE SINGLETON PATTERN ---
# Create a single, global instance of the RAG engine.
# This is the most important step for performance. The GitaRAG class
# will be instantiated only ONCE when the server starts.
print("Starting server and creating GitaRAG instance...")
gita_engine = GitaRAG()
print("GitaRAG instance created. The server is ready to accept requests.")
# -----------------------------

# Initialize the FastAPI app
app = FastAPI(
    title="Bhagavad Gita Chatbot API",
    description="An API to get answers from the Bhagavad Gita in the voice of Lord Krishna.",
    version="1.0.0",
)

# --- CORS MIDDLEWARE ---
# This is crucial for allowing your React app (which will run on a different port)
# to make requests to this backend. For development, we allow all origins.
origins = ["*"]  # In production, you would restrict this to your frontend's domain

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# -----------------------

# --- DATA MODELS ---
# Use Pydantic to define the structure of the data we expect in requests.
# This provides automatic data validation.
class QueryRequest(BaseModel):
    query: str
    author: str
    output_language: Optional[str] = 'english' # Optional, with a default value

class QueryResponse(BaseModel):
    answer: str
# -------------------

# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Bhagavad Gita Chatbot API. Use the /docs endpoint for details."}


@app.post("/ask", response_model=QueryResponse)
def ask_gita(request: QueryRequest):
    """
    Receives a query and returns a response from Lord Krishna.
    The heavy embedding model will be lazy-loaded on the very first request.
    Subsequent requests will be much faster.
    """
    print(f"Received request: query='{request.query}', author='{request.author}', language='{request.output_language}'")
    
    # Use our single, pre-loaded engine to get the answer
    answer = gita_engine.ask_krishna(
        query=request.query,
        author=request.author,
        output_language=request.output_language
    )
    
    return {"answer": answer}
# -------------------