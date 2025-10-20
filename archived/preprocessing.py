# Jai shree Ram
import os
import json
import glob

def parse_gita_json(file_path):
    """
    Parses a single shloka JSON file and transforms it into a list of 
    structured commentary dictionaries.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading or parsing {file_path}: {e}")
        return []

    # Extract information common to all commentaries in this file
    base_info = {
        'shloka_id': data.get('_id'),
        'chapter': data.get('chapter'),
        'verse': data.get('verse'),
        'shloka_sanskrit': data.get('slok'),
        'shloka_transliteration': data.get('transliteration'),
    }

    parsed_commentaries = []
    
    # Iterate through all top-level keys in the JSON (like 'tej', 'siva', etc.)
    for author_key, author_data in data.items():
        # We only care about keys that contain author commentary dictionaries
        if isinstance(author_data, dict) and 'author' in author_data:
            author_name = author_data['author']
            
            # These are the possible keys for commentary text
            commentary_types = {
                'et': 'english_translation',
                'ec': 'english_commentary',
                'ht': 'hindi_translation',
                'hc': 'hindi_commentary',
                'sc': 'sanskrit_commentary'
            }
            
            for type_key, type_name in commentary_types.items():
                # Check if the commentary type exists and is not empty
                if type_key in author_data and author_data[type_key]:
                    # Create the final structured dictionary for this piece of text
                    commentary_doc = {
                        **base_info,  # Merges the common info
                        'author': author_name,
                        'commentary_type': type_name,
                        'commentary_text': author_data[type_key]
                    }
                    parsed_commentaries.append(commentary_doc)

    return parsed_commentaries

def process_all_files(data_directory):
    """
    Finds all JSON files in a directory, processes them, and returns 
    a single consolidated list of all commentaries.
    """
    all_commentaries = []
    # Create a pattern to find all json files in the directory
    file_pattern = os.path.join(data_directory, '*.json')
    json_files = glob.glob(file_pattern)

    print(f"Found {len(json_files)} files to process.")

    for file_path in json_files:
        # The extend() method adds all items from the returned list
        all_commentaries.extend(parse_gita_json(file_path))
        
    return all_commentaries

if __name__ == "__main__":
    DATA_FOLDER = 'slok'
    OUTPUT_FILE = 'gita_consolidated.json'

    # Process all the data
    consolidated_data = process_all_files(DATA_FOLDER)
    
    print(f"\nSuccessfully processed and consolidated {len(consolidated_data)} commentaries.")
    
    # Save the consolidated data to a new file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(consolidated_data, f, indent=2, ensure_ascii=False)
        
    print(f"Consolidated data saved to '{OUTPUT_FILE}'.")

    # Optional: Print the first 2 entries to verify
    print("\n--- Example of the first two entries ---")
    for entry in consolidated_data[:2]:
        print(json.dumps(entry, indent=2, ensure_ascii=False))