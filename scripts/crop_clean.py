from PIL import Image

img = Image.open('C:/Users/LENOVO/.gemini/antigravity-ide/brain/010101cb-f690-42d8-a387-21ae29aa3a59/.user_uploaded/media_1792756501011.png')

# In the mockup 818x480:
# The stat card 2 ends at x around 495.
# The building starts with trees at x=495 to 770, y=55 to 186.
# Let's crop x from 510 to 760, y from 58 to 186:
clinic_building = img.crop((510, 58, 760, 186))
clinic_building.save('public/clinic_clean_building.png')

# Let's also create an image with transparent background for the building if possible,
# or since the hero banner background is exactly the same gradient, let's check its background!
print("Done cropping clinic clean building!")
