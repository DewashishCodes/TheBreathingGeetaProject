# gita_rag.py (Modified to use Google Gemini)

import os
import json
import chromadb
from sentence_transformers import SentenceTransformer
import google.generativeai as genai # <-- Changed: Import Gemini
from dotenv import load_dotenv

load_dotenv()

class GitaRAG:
    def __init__(self):
        print("Initializing GitaRAG Engine with Gemini...")
        
        self.embedding_model = None
        
        print("Connecting to vector database...")
        client = chromadb.PersistentClient(path="./gita_vector_db")
        self.collection = client.get_collection(name="gita_commentaries")
        
        # --- Changed: Initialize the Gemini Client ---
        print("Initializing Gemini client...")
        gemini_api_key = os.environ.get("GOOGLE_API_KEY")
        if not gemini_api_key:
            raise ValueError("GOOGLE_API_KEY not found in .env file")
            
        genai.configure(api_key=gemini_api_key)
        # We will use the fast and capable Gemini 1.5 Flash model
        self.llm_client = genai.GenerativeModel('gemini-2.0-flash')
        # --- End of Change ---
        
        print("Initialization complete. Engine is ready.")

    def _load_embedding_model(self):
        # This function is unchanged
        if self.embedding_model is None:
            print("\n>>> Loading local embedding model for the first time... (This is the long wait)")
            self.embedding_model = SentenceTransformer(
                'paraphrase-multilingual-mpnet-base-v2',
                device='cpu'
            )
            print(">>> Embedding model loaded successfully into memory.")

    def retrieve_context(self, query: str, author: str, n_results: int = 5):
        # This function is unchanged
        self._load_embedding_model()
        print(f"Retrieving context for query: '{query}'")
        query_embedding = self.embedding_model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding, n_results=n_results, where={"author": author}
        )
        if not results or not results.get('documents'):
            return "No relevant passages found for your query."
        context = ""
        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i]
            context += f"Passage {i+1} (from Chapter {metadata['chapter']}, Verse {metadata['verse']}):\n"
            context += f"Shloka: {metadata['shloka_sanskrit']}\n"
            context += f"Commentary: {doc}\n\n"
        return context

    def generate_krishna_response(self, query: str, context: str):
        # --- Changed: This function is completely rewritten for Gemini ---
        print("Generating response from Lord Krishna using Gemini...")
        
        # Gemini works best when system instructions are part of the main prompt.
        full_prompt = f"""
        You are Lord Krishna, as depicted in the Bhagavad Gita. You are speaking directly to a sincere seeker who has come to you for guidance. 
        - Your tone must be wise, compassionate, authoritative, and divine.
        - Address the seeker with terms like "O, seeker of truth," "My dear devotee," or in a similar direct manner.
        - Your answer MUST be based strictly on the provided 'Relevant Passages' from the Gita commentaries. Do not add information or concepts not present in the context.
        - Synthesize the information from the passages into a cohesive, first-person response.
        - Do NOT say "Based on the passages provided..." or mention that you are an AI. Speak as if the knowledge is inherently your own.
        - Keep the response profound yet easy to understand.

        Relevant Passages:
        ---
        {context}
        ---
        Now, considering these sacred teachings, answer my question with your divine wisdom.

        My Question: {query}
        """

        # Gemini can sometimes be overly cautious. These settings relax the safety filters.
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        response = self.llm_client.generate_content(
            full_prompt,
            safety_settings=safety_settings
        )
        
        return response.text
        # --- End of Change ---

    def ask_krishna(self, query: str, author: str):
        # This function is unchanged
        retrieved_context = self.retrieve_context(query, author)
        if "No relevant passages found" in retrieved_context:
            return retrieved_context
        final_answer = self.generate_krishna_response(query, retrieved_context)
        return final_answer