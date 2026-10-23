from PIL import Image, ImageDraw

img = Image.open('public/klinik_asli.jpg').convert('RGBA')
width, height = img.size

# Flood fill mask from the edges/corners where color is near black
# We can use ImageDraw.floodfill or standard BFS
visited = bytearray(width * height)
queue = []

# Add all edge pixels that are black (r<15, g<15, b<15)
pixels = img.load()
for x in range(width):
    for y in [0, height - 1]:
        r, g, b, a = pixels[x, y]
        if r < 20 and g < 20 and b < 20:
            queue.append((x, y))
            visited[y * width + x] = 1

for y in range(height):
    for x in [0, width - 1]:
        r, g, b, a = pixels[x, y]
        if r < 20 and g < 20 and b < 20:
            if not visited[y * width + x]:
                queue.append((x, y))
                visited[y * width + x] = 1

# BFS
head = 0
while head < len(queue):
    cx, cy = queue[head]
    head += 1
    
    for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)]:
        if 0 <= nx < width and 0 <= ny < height:
            idx = ny * width + nx
            if not visited[idx]:
                r, g, b, a = pixels[nx, ny]
                if r < 35 and g < 35 and b < 35:
                    visited[idx] = 1
                    queue.append((nx, ny))

# Apply transparency
for y in range(height):
    for x in range(width):
        if visited[y * width + x]:
            pixels[x, y] = (0, 0, 0, 0)

img.save('public/klinik_asli_transparan.png', 'PNG')
print('Done! Saved public/klinik_asli_transparan.png')
