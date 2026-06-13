import os, json

photos_dir = 'photos'
MEDIA = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.heic',
         '.mp4', '.mov', '.webm', '.m4v'}

manifest = {}
for root, dirs, files in os.walk(photos_dir):
    rel = os.path.relpath(root, photos_dir)
    if rel == '.':
        continue
    items = [f for f in sorted(files) if os.path.splitext(f)[1].lower() in MEDIA]
    if items:
        manifest[rel] = items

with open(os.path.join(photos_dir, 'manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)

print('manifest.json updated with', sum(len(v) for v in manifest.values()), 'files')
