# test_rag.py

from gita_rag import GitaRAG

# 1. Create an instance of our RAG engine
gita_engine = GitaRAG()

# 2. Define our question and preferred author style
my_query = "I am feeling lost and confused about my purpose in life. What should I do?"
author_style = "Swami Sivananda"  # We can change this to test different styles

# 3. Ask Krishna!
print("\nAsking my question to Krishna...")
response = gita_engine.ask_krishna(query=my_query, author=author_style)

# 4. Print the final, divine response
print("\n--- Lord Krishna's Response ---")
print(response)
print("-----------------------------\n")