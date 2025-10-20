import chromadb
import json
import numpy as np
import uuid # To generate unique IDs

def load_json(file_path):
    """Loads a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_npy(file_path):
    """Loads a NumPy .npy file."""
    return np.load(file_path)

# Load our processed data
print("Loading processed data files...")
chunked_data = load_json('gita_chunks.json')
embeddings = load_npy('gita_embeddings.npy')
print("Data loaded successfully.")

# Extract the required components for ChromaDB
# Documents are the actual text chunks
documents = [chunk['text_to_embed'] for chunk in chunked_data]

# Metadatas are the dictionaries associated with each chunk
metadatas = [chunk['metadata'] for chunk in chunked_data]

# We need unique IDs for each entry. We can generate them.
ids = [str(uuid.uuid4()) for _ in range(len(documents))]

print(f"Prepared {len(documents)} documents, metadatas, and IDs for the database.")

# --- Setup ChromaDB ---
# This will create a folder named 'gita_vector_db' to store the database
client = chromadb.PersistentClient(path="./gita_vector_db")

# Define the collection name
collection_name = "gita_commentaries"

# Get or create the collection. If it exists, we can use it. 
# For a clean start, it's often good to delete it first if rerunning the script.
if collection_name in [c.name for c in client.list_collections()]:
    print(f"Collection '{collection_name}' already exists. Deleting it for a fresh start.")
    client.delete_collection(name=collection_name)

print(f"Creating collection '{collection_name}'...")
collection = client.create_collection(name=collection_name)


# --- Add the data to the collection ---
# ChromaDB can be slow with very large single additions. We'll add in batches.
batch_size = 5000
num_batches = len(documents) // batch_size + (1 if len(documents) % batch_size > 0 else 0)

print(f"Adding data to the collection in {num_batches} batches of size {batch_size}...")

for i in range(0, len(documents), batch_size):
    batch_start = i
    batch_end = min(i + batch_size, len(documents))
    
    print(f"Adding batch {i//batch_size + 1}/{num_batches}...")
    
    collection.add(
        embeddings=embeddings[batch_start:batch_end].tolist(), # ChromaDB expects lists
        documents=documents[batch_start:batch_end],
        metadatas=metadatas[batch_start:batch_end],
        ids=ids[batch_start:batch_end]
    )

print("\nData successfully added to the ChromaDB collection!")

# --- Verification ---
count = collection.count()
print(f"The collection now contains {count} documents.")

print("\n--- Running a test query to verify ---")
# To query, we MUST use the same model we used for embedding
from sentence_transformers import SentenceTransformer

# Load the model we used for embeddings
print("Loading the sentence transformer model for querying...")
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

# Define our query text
query_text = ["What is the nature of the self?"]

# Create the embedding for our query text
print("Creating embedding for the query text...")
query_embedding = model.encode(query_text).tolist()

# Now, query the collection using the embedding
results = collection.query(
    query_embeddings=query_embedding, # Use query_embeddings instead of query_texts
    n_results=2,
    where={"author": "Swami Sivananda"} # Optional filter
)

print("\nTest query results:")
# Use ensure_ascii=False to print Devanagari script correctly
print(json.dumps(results, indent=2, ensure_ascii=False))