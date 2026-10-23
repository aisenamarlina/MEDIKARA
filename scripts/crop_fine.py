from PIL import Image

img = Image.open('C:/Users/LENOVO/.gemini/antigravity-ide/brain/010101cb-f690-42d8-a387-21ae29aa3a59/.user_uploaded/media_1792756501011.png')

# In 818x480:
# The hero banner is located roughly:
# x from ~160 to ~805
# y from ~52 to ~188
hero_full = img.crop((163, 53, 807, 186))
hero_full.save('public/hero_banner_full.png')

# Let's crop just the right clinic illustration area of the hero banner (x from 460 to 807, y from 53 to 186)
hero_right = img.crop((460, 53, 807, 186))
hero_right.save('public/hero_clinic_right.png')

# Let's crop the exact building without the calendar card:
# Building only: x from 470 to 710, y from 60 to 186
building_only = img.crop((475, 60, 715, 186))
building_only.save('public/building_only.png')

# Sidebar clinic card photo: x from 21 to 138, y from 292 to 348
sidebar_photo = img.crop((21, 292, 138, 348))
sidebar_photo.save('public/sidebar_clinic_mockup.png')

print("All cropped cleanly!")
