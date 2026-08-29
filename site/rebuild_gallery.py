"""Rebuild gallery, hero and about image from the raw WhatsApp photos.

Written after an audit of all 23 raws found the gallery mislabeled (an untreated
roof captioned "nach Beschichtung", a garage captioned "Dachsanierung") and the
strongest proof shots unused. The new selection leads with the two photos that
carry before AND after inside a single frame — a stranger verifies the claim
with their own eyes, no pairing UI needed.

Privacy passes applied here, matching the bar the licence-plate censoring set:
  * WA0148/WA0151/WA0134 join the gallery as full frames — checked clean: no
    plates, no people, no house numbers in frame.
  * WA0146/WA0147 are no longer used (their crops kept the neighbour's garden
    out; the new selection does not need them).
  * WA0133 (the old hero) is dropped: house number 13 and the street were
    readable, which identifies the customer's address.
  * WA0152 (named restaurant, passer-by) and WA0142 (view into the customer's
    hallway) are deliberately not used at all.

Unlike optimize_images.py / prepare_images.py this script never deletes and
never reads from assets/img — the raws in the project root are the only input,
so it is safe to re-run.
"""

import os
from PIL import Image

RAW = '../IMG-20260825-WA{}.jpg'
IMG = 'assets/img'


def build(raw, dest, max_dim, crop=None, quality=80):
    """Crop (optional), right-size and write a WebP into assets/img."""
    write(Image.open(RAW.format(raw)), dest, max_dim, crop, quality)


def write(img, dest, max_dim, crop=None, quality=80):
    if crop:
        img = img.crop(crop)
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    img.save(f'{IMG}/{dest}', 'WEBP', quality=quality, method=6)
    print(f'{dest:22} {img.size[0]:>5}x{img.size[1]:<5} {os.path.getsize(IMG + "/" + dest) // 1024:>4} KB')


# --- Gallery: proof first, then finished work -------------------------------

# 1+2: before and after inside one frame — the strongest evidence in the set
build('0149', 'gallery-1.webp', 1600)   # left coated, right still raw, lance in shot
build('0144', 'gallery-2.webp', 1600)   # sharp line: weathered brown above, anthracite below

# 3-5: work in progress and finished surfaces
build('0136', 'gallery-3.webp', 1600)   # full roof from the scaffold, sunny
build('0148', 'gallery-4.webp', 1600)   # masked-off windows and connections before spraying
build('0139', 'gallery-5.webp', 1600)   # dormer and verge after coating and paint

# 6+7: fresh coat with the scaffold still up, then painting work off the roof
build('0151', 'gallery-6.webp', 1600)   # freshly coated roof, scaffold still standing
build('0134', 'gallery-7.webp', 1600)   # painting work on garage and facade

# --- Hero: finished roof against blue sky, nothing identifying in frame -----
build('0145', 'hero-bg.webp', 1920, quality=78)

# --- About: Sascha on the roof, spraying. A person beats a surface here. ----
# Retouched version of the WA0138 selfie, supplied separately — same man, same
# pose, same sprayer, cleaned up and brightened.
write(Image.open('../sascha-dach-raw.png').convert('RGB'), 'about.webp', 1200)

# --- Hero: Sascha cut out, standing in the headline's own space. -----------
# A one-man business sells the man. The alpha channel has to survive, so this
# one keeps RGBA and gets a higher quality setting — WebP carries transparency,
# and a cut-out with crunchy edges would look worse than no cut-out at all.
write(Image.open('../sascha-freisteller-raw.png'), 'sascha.webp', 1100, quality=90)

print('done')
