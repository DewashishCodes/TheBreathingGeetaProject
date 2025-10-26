# db_test.py
import chromadb
from sentence_transformers import SentenceTransformer

print("--- Starting Vector DB Diagnostic Test ---")

# --- 1. Load the Embedding Model ---
try:
    print("Loading embedding model...")
    model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
    print("Model loaded successfully.")
except Exception as e:
    print(f"!!! FATAL ERROR: Could not load the embedding model. Error: {e}")
    exit()

# --- 2. Connect to the ChromaDB Database ---
try:
    print("Connecting to ChromaDB at './gita_vector_db'...")
    client = chromadb.PersistentClient(path="./gita_vector_db")
    collection = client.get_collection(name="gita_commentaries")
    doc_count = collection.count()
    print(f"Successfully connected to collection '{collection.name}' with {doc_count} documents.")
    if doc_count == 0:
        print("!!! WARNING: The database is empty! This is likely the problem.")
        print("Did you run the 'load_into_db.py' script successfully?")
        exit()
except Exception as e:
    print(f"!!! FATAL ERROR: Could not connect to the ChromaDB collection. Error: {e}")
    print("Ensure the 'gita_vector_db' folder exists in the same directory you are running this script from.")
    exit()

# --- 3. Perform a Test Query ---
try:
    test_query = "What is dharma?"
    test_author = "Swami Sivananda"
    print(f"\nPerforming a test query for: '{test_query}' with author filter: '{test_author}'")

    # Create the embedding for the query
    query_embedding = model.encode([test_query]).tolist()
    
    # Query the collection
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=3,
        where={"author": test_author}
    )

    # --- 4. Analyze the Results ---
    if results and results.get('documents') and results['documents'][0]:
        print("\n--- SUCCESS! Found relevant documents: ---")
        for i, doc in enumerate(results['documents'][0]):
            shloka_id = results['metadatas'][0][i].get('shloka_id', 'N/A')
            print(f"  {i+1}. ID: {shloka_id} -> {doc[:100]}...")
    else:
        print("\n!!! QUERY FAILED: The search returned 0 results. This is the root cause of your problem.")
        print("This could mean an issue with the embeddings or a problem with the ChromaDB installation.")

except Exception as e:
    print(f"\n!!! ERROR during query: {e}")

print("\n--- Diagnostic Test Complete ---")