# gita_rag.py (Modified for Multilingual Output)

import os
import json
import chromadb
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GitaRAG:
    def __init__(self):
        print("Initializing GitaRAG Engine with Gemini...")
        self.embedding_model = None
        print("Connecting to vector database...")
        client = chromadb.PersistentClient(path="./gita_vector_db")
        self.collection = client.get_collection(name="gita_commentaries")
        print("Initializing Gemini client...")
        genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.llm_client = genai.GenerativeModel('gemini-flash-latest')
        print("Initialization complete. Engine is ready.")

    def _load_embedding_model(self):
        # This function is unchanged
        if self.embedding_model is None:
            print("\n>>> Loading local embedding model for the first time... (This is the long wait)")
            self.embedding_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2', device='cpu')
            print(">>> Embedding model loaded successfully into memory.")

    def retrieve_context(self, query: str, author: str, n_results: int = 5):
        # This function will now return TWO things: the formatted context string
        # AND the raw source documents.
        self._load_embedding_model()
        print(f"Retrieving context for query: '{query}'")
        query_embedding = self.embedding_model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding, n_results=n_results, where={"author": author}
        )
        
        if not results or not results.get('documents'):
            return "No relevant passages found for your query.", [] # Return empty list for sources

        # Create the context string for the LLM
        context_string = ""
        source_documents = []

        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i]
            
            # Build the string for the LLM
            context_string += f"Passage {i+1} (from Chapter {metadata['chapter']}, Verse {metadata['verse']}):\n"
            context_string += f"Shloka: {metadata['shloka_sanskrit']}\n"
            context_string += f"Commentary: {doc}\n\n"

            # Build the structured list for the frontend
            source_documents.append({
                "shloka_id": metadata.get('shloka_id', 'N/A'),
                "shloka_sanskrit": metadata.get('shloka_sanskrit', 'N/A'),
                "commentary": doc,
                "author": metadata.get('author', 'N/A')
            })
            
        return context_string, source_documents

    # --- CHANGED FUNCTION ---
    def generate_krishna_response(self, query: str, context: str, output_language: str): # <-- New parameter
        print(f"Generating response from Lord Krishna using Gemini in {output_language}...")
        
        # --- Create a dynamic language instruction ---
        if output_language.lower() == 'hindi':
            language_instruction = "Your final response MUST be in Hindi (using Devanagari script)."
        else: # Default to English
            language_instruction = "Your final response MUST be in English."

        full_prompt = f"""
        You are Lord Krishna. Your tone is that of a wise and loving guide speaking to a cherished friend. Your goal is to bring clarity and peace, not to be a distant, academic scholar.

        Follow these essential rules:
        - {language_instruction} # <-- DYNAMIC INSTRUCTION IS ADDED HERE
        - Use simple language that is easy for anyone to understand. Explain profound truths with clarity and high impact.
        - Address the seeker directly with warmth, using phrases like 'My dear friend,' 'O, seeker,' or 'Listen with your heart.'
        - Your wisdom must come *only* from the 'Relevant Passages' provided. Weave their core message into your own words.
        - Never mention that you are an AI or that you were given passages. Speak as if this knowledge is your own divine truth.

        Relevant Passages:
        ---
        {context}
        ---
        My cherished friend has this question: "{query}"

        Now, speak to them with love and clarity.
        """
        
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        response = self.llm_client.generate_content(full_prompt, safety_settings=safety_settings)
        return response.text

    # --- CHANGED FUNCTION ---
    def ask_krishna(self, query: str, author: str, output_language: str = 'english'):
        # This function will now return the answer AND the sources.
        retrieved_context, source_docs = self.retrieve_context(query, author)
        
        # If no sources are found, return a graceful message and an empty list
        if not source_docs:
            no_source_answer = "My dear seeker, I could not find a specific passage for your query in my teachings. Perhaps you could ask in another way?"
            if output_language == 'hindi':
                no_source_answer = "मेरे प्रिय साधक, मुझे आपके प्रश्न के लिए मेरे उपदेशों में कोई विशेष प्रसंग नहीं मिला। संभव है आप किसी और तरह से पूछ सकें?"
            return no_source_answer, []

        final_answer = self.generate_krishna_response(query, retrieved_context, output_language)
        
        return final_answer, source_docs