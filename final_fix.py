import os

def fix_file(path):
    try:
        with open(path, 'rb') as f:
            content = f.read()
        
        # Check if it's already valid UTF-8
        try:
            content.decode('utf-8')
            return # Already OK
        except UnicodeDecodeError:
            pass
            
        print(f"Fixing {path}")
        # decode('utf-8', 'replace') converts invalid bytes to U+FFFD (replacement character)
        # However, some parsers might still dislike U+FFFD in specific spots.
        # 'ignore' is safer for build tools, but might lose a character.
        # We'll use 'replace' to be safe.
        fixed_content = content.decode('utf-8', 'replace').encode('utf-8')
        with open(path, 'wb') as f:
            f.write(fixed_content)
    except Exception as e:
        print(f"Error fixing {path}: {e}")

def walk_and_fix(root_dir):
    for root, dirs, files in os.walk(root_dir):
        if any(x in root for x in [".next", "node_modules", ".git"]):
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.md')):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    walk_and_fix("lib")
    walk_and_fix("app")
    print("Done scanning.")
