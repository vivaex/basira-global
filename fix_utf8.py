import os
import sys

def check_file(filepath):
    print(f"Checking {filepath}...")
    try:
        with open(filepath, "rb") as f:
            content = f.read()
        content.decode("utf-8")
        print(f"  OK: {filepath}")
        return True
    except UnicodeDecodeError as e:
        print(f"  ERROR in {filepath}: {e}")
        # Identify bad bytes
        start = max(0, e.start - 30)
        end = min(len(content), e.end + 30)
        snippet = content[start:end]
        print(f"  Snippet (hex): {snippet.hex()}")
        print(f"  Snippet (raw): {snippet}")
        
        # Repair file by replacing bad bytes with '?'
        repaired = content.decode("utf-8", errors="replace").encode("utf-8")
        with open(filepath, "wb") as f:
            f.write(repaired)
        print(f"  REPAIRED {filepath} (replaced invalid bytes with replacement char)")
        return False

def scan_dir(directory):
    for root, dirs, files in os.walk(directory):
        if ".next" in root or "node_modules" in root:
            continue
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx", ".json", ".md")):
                check_file(os.path.join(root, file))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_file(sys.argv[1])
    else:
        scan_dir("lib")
        scan_dir("app")
