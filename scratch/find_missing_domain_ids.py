import os
import re

base_path = r'c:\Users\Lenovo\OneDrive\Desktop\basira-global\app\diagnose'
missing_files = []

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if '<ClinicalPlayerEngine' in content and 'domainId=' not in content:
                    missing_files.append(file_path)

if missing_files:
    print("Files missing domainId:")
    for f in missing_files:
        print(f)
else:
    print("No files missing domainId found.")
