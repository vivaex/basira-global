import os

def check_files(directory):
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and .git
        if 'node_modules' in root or '.git' in root or '.next' in root:
            continue
            
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.json', '.md')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'rb') as f:
                        content = f.read()
                    
                    try:
                        content.decode('utf-8')
                    except UnicodeDecodeError as e:
                        print(f"CORRUPT_UTF8: {filepath} at {e.start}")
                    
                    if content.endswith(b'\xef\xbb\xbf\xef\xbb\xbf'):
                        print(f"TRAILING_BOM_GARBAGE: {filepath}")
                        
                except Exception as e:
                    print(f"ERROR: {filepath} - {e}")

if __name__ == "__main__":
    check_files('.')
