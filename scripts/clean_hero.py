from PIL import Image

img = Image.open('C:/Users/LENOVO/.gemini/antigravity-ide/brain/010101cb-f690-42d8-a387-21ae29aa3a59/.user_uploaded/media_1792756501011.png')

# The building with trees:
# x from 510 to 760, y from 53 to 186
# Replace any white card in bottom-left if any
hero_crop = img.crop((505, 53, 807, 186))
# Sample background color near (0, 100)
bg_color = hero_crop.getpixel((0, 100))
# If any pixel in x<20 and y>90 is pure white, replace with gradient
pixels = hero_crop.load()
for x in range(30):
    for y in range(80, hero_crop.height):
        r, g, b, *a = pixels[x, y]
        if r > 240 and g > 240 and b > 240:
            # fill with nearby background pixel
            pixels[x, y] = hero_crop.getpixel((35, y))

hero_crop.save('public/hero_building_clean.png')
print("Saved public/hero_building_clean.png")
