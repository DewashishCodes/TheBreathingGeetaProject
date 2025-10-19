# interactive_test.py (Modified for Multilingual Testing)

from gita_rag import GitaRAG

print("--- Starting Interactive Gita Session ---")
print("Creating the Gita Engine instance...")
gita_engine = GitaRAG()
print("\nEngine created. The model is not loaded yet.")
print("The first 'ask_krishna' command will be slow as the model loads.")
print("You can now specify an 'output_language' ('english' or 'hindi').")