from PIL import Image

img = Image.open('C:/Users/LENOVO/.gemini/antigravity-ide/brain/010101cb-f690-42d8-a387-21ae29aa3a59/.user_uploaded/media_1792756501011.png')
w, h = img.size

# In 818x480:
# Sidebar card photo:
# Looking at the sidebar (left ~150px)
# Crop sidebar clinic photo:
sidebar_photo = img.crop((20, 290, 138, 350))
sidebar_photo.save('public/sidebar_clinic_mockup.png')

# Hero banner clinic illustration:
# Hero banner is around x=450 to 700, y=60 to 190
hero_clinic = img.crop((465, 62, 695, 192))
hero_clinic.save('public/hero_clinic_mockup.png')

print("Cropped successfully!")
