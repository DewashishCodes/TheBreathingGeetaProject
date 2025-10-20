import json
from langchain.text_splitter import RecursiveCharacterTextSplitter

def load_data(file_path):
    """Loads the consolidated data from a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load the data we prepared in the previous step
consolidated_data = load_data('gita_consolidated.json')

# Initialize the text splitter
text_splitter = RecursiveCharacterTextSplitter(
    # The chunk_size is the maximum number of characters you want in a chunk.
    # This is a key parameter to tune for your specific use case.
    chunk_size=1000, 
    
    # The chunk_overlap allows for some overlap between consecutive chunks.
    # This helps maintain context if a sentence or idea is split across chunks.
    chunk_overlap=100,
    
    length_function=len
)

final_chunks = []

print(f"Starting to chunk {len(consolidated_data)} documents...")

for item in consolidated_data:
    # We only want to split the actual commentary text
    commentary_text = item['commentary_text']
    
    # Split the text into smaller pieces
    split_texts = text_splitter.split_text(commentary_text)
    
    # For each split piece, create a new dictionary (a chunk)
    for i, text_part in enumerate(split_texts):
        chunk = {
            # This is the actual text that will be converted into a vector
            'text_to_embed': text_part,
            
            # This metadata is crucial for filtering and context
            'metadata': {
                'author': item['author'],
                'chapter': item['chapter'],
                'verse': item['verse'],
                'shloka_id': item['shloka_id'],
                'commentary_type': item['commentary_type'],
                'shloka_sanskrit': item['shloka_sanskrit'],
                'chunk_index': i # Helps to know the order of chunks from a long commentary
            }
        }
        final_chunks.append(chunk)

print(f"Total chunks created: {len(final_chunks)}")

# Save the final chunks to a new file
OUTPUT_FILE = 'gita_chunks.json'
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_chunks, f, indent=2, ensure_ascii=False)
    
print(f"Chunked data saved to '{OUTPUT_FILE}'.")

# Optional: Print an example of a chunk to see the result
print("\n--- Example of a final chunk ---")
if final_chunks:
    print(json.dumps(final_chunks[10], indent=2, ensure_ascii=False))