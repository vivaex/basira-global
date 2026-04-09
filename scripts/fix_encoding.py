import os

def clean_file(filepath):
    try:
        with open(filepath, 'rb') as b:
            content = b.read()
        
        # utf-8-sig will automatically skip the BOM if present at the start.
        # But we have multiple BOMs at the END.
        
        # Let's try to decode as UTF-8, and if it fails, find where it fails.
        # Actually, let's just use the 'ignore' or 'replace' error handler for research,
        # but for fixing, we want to TRUNCATE at the first invalid byte.
        
        valid_content = b""
        try:
            content.decode('utf-8')
            return False # Already valid UTF-8
        except UnicodeDecodeError as e:
            # e.start is the index of the first invalid byte
            valid_content = content[:e.start]
            
            # Ensure we are not cutting off a middle of a word or something
            # Usually the error is at the garbage area.
            
            # Find the last closing brace in the valid part to be safe
            last_brace = valid_content.rfind(b'}')
            if last_brace != -1:
                final_content = valid_content[:last_brace+1]
                with open(filepath, 'wb') as f:
                    f.write(final_content + b'\n')
                print(f"CLEANED: {filepath} (Truncated at {e.start}, to final brace at {last_brace})")
                return True
        return False
    except Exception as e:
        print(f"ERROR: {filepath} - {e}")
        return False

def fix_all(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
                clean_file(os.path.join(root, file))

if __name__ == "__main__":
    fix_all('app/diagnose')
