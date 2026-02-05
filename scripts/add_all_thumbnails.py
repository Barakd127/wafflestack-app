#!/usr/bin/env python3
"""Add thumbnail paths to ALL assets in assetLibrary.ts"""

import re
import os

# Read the file
file_path = r'C:\Users\BARAK\Projects\base44\src\config\assetLibrary.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Patterns for each kit
patterns = {
    'suburban': (r"path: '/models/suburban/([^']+)'", r"/previews/suburban/\1"),
    'castle': (r"path: '/models/castle/([^']+)'", r"/previews/castle/\1"),
    'fantasy-town': (r"path: '/models/fantasy-town/([^']+)'", r"/previews/fantasy-town/\1"),
    'food': (r"path: '/models/food/([^']+)'", r"/previews/food/\1"),
    'industrial': (r"path: '/models/industrial/([^']+)'", r"/previews/industrial/\1"),
    'roads': (r"path: '/models/roads/([^']+)'", r"/previews/roads/\1"),
}

added_count = 0

for kit_name, (path_pattern, preview_pattern) in patterns.items():
    # Find all matches
    for match in re.finditer(path_pattern, content):
        full_match = match.group(0)
        model_file = match.group(1)
        preview_file = model_file.replace('.glb', '.png')
        
        # Check if thumbnail already exists
        if 'thumbnail:' in content[max(0, match.start() - 200):match.end() + 20]:
            continue
            
        # Create the replacement
        thumbnail_path = f"/previews/{kit_name}/{preview_file}"
        replacement = f"{full_match}, thumbnail: '{thumbnail_path}'"
        
        # Replace in content
        content = content.replace(full_match + ', category:', replacement + ', category:')
        added_count += 1
        print(f"✅ Added thumbnail for {kit_name}: {preview_file}")

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n🎉 Complete! Added {added_count} thumbnail paths!")
print(f"📄 File updated: {file_path}")
