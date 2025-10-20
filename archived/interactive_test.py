# interactive_test.py
from gita_rag import GitaRAG

print("--- Starting Interactive Gita Session ---")
print("Creating the Gita Engine instance...")
gita_engine = GitaRAG()
print("\nEngine created. The model is not loaded yet.")
print("Type your first 'gita_engine.ask_krishna(...)' command to load the model.")
print("Subsequent calls will be fast.")