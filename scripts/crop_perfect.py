from PIL import Image

img = Image.open('C:/Users/LENOVO/.gemini/antigravity-ide/brain/010101cb-f690-42d8-a387-21ae29aa3a59/.user_uploaded/media_1792756501011.png')

# The card 2 is at x ~ 335 to 495.
# If we crop from x=495 to 807:
hero_right_perfect = img.crop((495, 53, 807, 186))
hero_right_perfect.save('public/hero_right_perfect.png')

print("hero_right_perfect.png saved successfully!")
