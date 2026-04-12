import os
import re

def find_nested_components(directory):
    pattern = re.compile(r'(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*[:=]\s*(?:\([^)]*\)|[a-zA-Z0-9]+)\s*=>|function\s+([A-Z][a-zA-Z0-9]*)\s*\(')
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.js') or file.endswith('.jsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Find outer components
                    outer_matches = list(re.finditer(r'(?:export\s+default\s+)?(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*', content))
                    
                    for i, outer in enumerate(outer_matches):
                        start = outer.end()
                        end = outer_matches[i+1].start() if i + 1 < len(outer_matches) else len(content)
                        inner_content = content[start:end]
                        
                        # Find potential inner components
                        inner_matches = pattern.findall(inner_content)
                        if inner_matches:
                            # Filter out false positives like React hooks or simple constants
                            real_inners = [m[0] or m[1] for m in inner_matches if (m[0] or m[1]) not in ['React', 'Link', 'motion', 'AnimatePresence', 'Image']]
                            if real_inners:
                                print(f"File: {path}")
                                print(f"  Outer: {outer.group(1)}")
                                print(f"  Nested found: {', '.join(real_inners)}")

if __name__ == "__main__":
    find_nested_components('app')
