import os

def clean_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
        
        # utf-8-sig will automatically skip the BOM if present at the start.
        # But we have multiple BOMs at the END.
        
        # Standard UTF-8 BOM is 0xEF 0xBB 0xBF
        bom = b'\xef\xbb\xbf'
        
        # Check if already valid UTF-8
        try:
            content.decode('utf-8')
            return False
        except UnicodeDecodeError as e:
            # e.start is the index of the first invalid byte
            valid_content = content[:e.start]
            
            # Find the last reasonable completion point (closing brace, semicolon, or newline)
            for marker in [b'}', b';', b'\n']:
                last_idx = valid_content.rfind(marker)
                if last_idx != -1:
                    final_content = valid_content[:last_idx+1]
                    with open(filepath, 'wb') as out:
                        out.write(final_content + b'\n')
                    print(f"CLEANED: {filepath} (Truncated at {e.start}, to marker '{marker.decode()}' at {last_idx})")
                    return True
        return False
    except Exception as e:
        print(f"ERROR: {filepath} - {e}")
        return False

if __name__ == "__main__":
    # Fix lib/testsData.ts
    target = 'lib/testsData.ts'
    if os.path.exists(target):
        clean_file(target)
    
    # Also check other lib files just in case
    for root, dirs, files in os.walk('lib'):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                clean_file(os.path.join(root, file))
