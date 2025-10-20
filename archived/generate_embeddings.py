import json
import torch
from sentence_transformers import SentenceTransformer

def load_data(file_path):
    """Loads the chunked data from a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load the chunks we created in Step 2
chunked_data = load_data('gita_chunks.json')

# Check if a CUDA-enabled GPU is available, otherwise use CPU
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")

# Load a powerful multilingual model. This will download the model on first run.
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2', device=device)

# Extract just the text content that we need to embed
texts_to_embed = [chunk['text_to_embed'] for chunk in chunked_data]

print(f"\nGenerating embeddings for {len(texts_to_embed)} chunks...")

# Generate embeddings. This can take a while depending on your hardware (GPU is much faster).
# We can specify a batch_size to make it more memory-efficient.
embeddings = model.encode(
    texts_to_embed, 
    show_progress_bar=True,
    batch_size=32 
)

print(f"Embeddings generated with shape: {embeddings.shape}")

# Save the embeddings to a file. NumPy format is efficient for this.
# You'll need to install numpy: pip install numpy
import numpy as np

OUTPUT_FILE = 'gita_embeddings.npy'
np.save(OUTPUT_FILE, embeddings)

print(f"Embeddings saved to '{OUTPUT_FILE}'.") 