
import re

def extract_keys(content, start_marker, end_marker):
    start_index = content.find(start_marker)
    if start_index == -1:
        return set()
    end_index = content.find(end_marker, start_index)
    if end_index == -1:
        return set()
    
    section = content[start_index:end_index]
    # Match keys like: labs: '...', 'cat_math': '...',
    keys = re.findall(r'^\s+[\'"]?([a-zA-Z0-9_\-/]+)[\'"]?:\s*', section, re.MULTILINE)
    return set(keys)

with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

ar_keys = extract_keys(content, 'ar: {', '  en: {')
en_keys = extract_keys(content, 'en: {', '};')

print(f"AR keys count: {len(ar_keys)}")
print(f"EN keys count: {len(en_keys)}")

missing_in_en = ar_keys - en_keys
missing_in_ar = en_keys - ar_keys

print("\nMissing in EN:")
for k in sorted(missing_in_en):
    print(f"  {k}")

print("\nMissing in AR:")
for k in sorted(missing_in_ar):
    print(f"  {k}")
