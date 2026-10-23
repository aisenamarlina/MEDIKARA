#!/usr/bin/env python3
"""
Process real clinic photo with black background -> transparent PNG
Optimized for seamless hero section blending with mint-green background
"""
import os
from PIL import Image
import numpy as np

INPUT = r"c:\TUGAS ALLISA SEMESTER 6\SIBAKTI\MEDIKARA\public\klinik_asli.jpg"
OUTPUT = r"c:\TUGAS ALLISA SEMESTER 6\SIBAKTI\MEDIKARA\public\clinic_hero_blend.png"

img = Image.open(INPUT).convert("RGBA")
data = np.array(img, dtype=np.float32)

R, G, B = data[:,:,0], data[:,:,1], data[:,:,2]

# Max channel per pixel (brightness of most vivid channel)
max_ch = np.maximum(np.maximum(R, G), B)

# Background removal: black pixels -> transparent
# Pixels below threshold 30 = pure black
# Soft transition from 20 to 60
low, high = 20.0, 60.0
alpha_mask = np.clip((max_ch - low) / (high - low), 0.0, 1.0)

# Apply alpha
data[:,:,3] = (alpha_mask * 255.0).astype(np.uint8)

result = Image.fromarray(data.astype(np.uint8), 'RGBA')
w, h = result.size
pixels = result.load()

# Add left-side horizontal fade (first 200px) to blend with hero bg
fade_width = 200
fade_arr = np.ones((h, w), dtype=np.float32)
for x in range(fade_width):
    fade_arr[:, x] = x / fade_width

# Apply fade to alpha channel
final_data = data.copy()
final_data[:,:,3] = (alpha_mask * fade_arr * 255.0).astype(np.uint8)

result = Image.fromarray(final_data.astype(np.uint8), 'RGBA')
result.save(OUTPUT, "PNG", optimize=True)
print(f"Done! Saved to: {OUTPUT}")
print(f"Image size: {result.size}, mode: {result.mode}")
