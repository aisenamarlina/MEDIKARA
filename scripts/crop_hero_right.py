from PIL import Image

img = Image.open('C:/Users/LENOVO/.gemini/antigravity-ide/brain/010101cb-f690-42d8-a387-21ae29aa3a59/.user_uploaded/media_1792756501011.png')

# The building is from x=465 to 680, y=58 to 186
# In the mockup, the calendar card overlaps the right edge of the building slightly (from x=640 to 800).
# Let's crop the entire right background of the hero banner: x from 440 to 807, y from 53 to 186:
hero_right_full = img.crop((440, 53, 807, 186))
hero_right_full.save('public/hero_right_full.png')

# Also let's crop the calendar card from the mockup:
calendar_card = img.crop((635, 58, 800, 115))
calendar_card.save('public/calendar_card_mockup.png')

print("Saved hero_right_full.png")
