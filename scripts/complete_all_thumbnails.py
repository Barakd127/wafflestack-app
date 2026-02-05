#!/usr/bin/env python3
"""Complete ALL thumbnail paths - ensure every asset has a path"""

import re
import os

# Read the file
file_path = r'C:\Users\BARAK\Projects\base44\src\config\assetLibrary.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

added_count = 0
result_lines = []

for i, line in enumerate(lines):
    # Check if this line has a path but no thumbnail
    if "path: '/models/" in line and 'thumbnail:' not in line and '.glb' in line:
        # Extract the path
        path_match = re.search(r"path: '(/models/[^']+)'", line)
        if path_match:
            model_path = path_match.group(1)
            
            # Determine the kit and filename
            parts = model_path.split('/')
            if len(parts) >= 3:
                kit_folder = parts[2]  # e.g., 'suburban', 'castle', etc.
                filename = parts[-1].replace('.glb', '.png')
                
                # Create thumbnail path
                thumbnail_path = f"/previews/{kit_folder}/{filename}"
                
                # Insert thumbnail before category
                modified_line = line.replace(", category:", f", thumbnail: '{thumbnail_path}', category:")
                result_lines.append(modified_line)
                added_count += 1
                print(f"✅ Added: {kit_folder}/{filename}")
                continue
    
    result_lines.append(line)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(result_lines)

print(f"\n🎉 Complete! Added {added_count} thumbnail paths!")
print(f"📄 File updated: {file_path}")
