"""NICHT AUSFUEHREN — kaputtes Einmal-Skript, nur als Beleg aufbewahrt.

Liest geloeschte JPG-Quellen und crasht sofort. Das aktuelle Bildskript ist
rebuild_gallery.py (siehe AGENTS.md).

One-off image prep: censor licence plates, cut the header logo, swap gallery shots."""

import shutil
from PIL import Image, ImageFilter

SRC = '../'


def pixelate(img, box, blocks=14):
    """Replace a region with a coarse mosaic — plates stay unreadable even when zoomed."""
    region = img.crop(box)
    w, h = region.size
    small = region.resize((max(blocks, 1), max(int(blocks * h / w), 1)), Image.BILINEAR)
    mosaic = small.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(1.2))
    img.paste(mosaic, box)


# --- 1. Licence plates in gallery-5 (black Audi + yellow Suzuki) ---
plates = Image.open('assets/img/gallery-5.jpg')
print('gallery-5 size:', plates.size)

pixelate(plates, (505, 1302, 610, 1362))   # Audi, parked at the house
pixelate(plates, (415, 1940, 575, 2048))   # Suzuki, foreground right

plates.save('assets/img/gallery-5.jpg', quality=88, optimize=True)

# --- 2. Header logo: crop the lockup out of the wide brand banner ---
logo = Image.open(SRC + 'IMG-20260825-WA0154.jpg')
print('logo source size:', logo.size)

w, h = logo.size
logo.crop((int(w * 0.03), int(h * 0.30), int(w * 0.90), int(h * 0.68))) \
    .save('assets/img/logo-header.png')

# --- 3. Gallery: ladder shot out, the header photo takes its slot ---
shutil.copy('assets/img/hero-bg.jpg', 'assets/img/gallery-6.jpg')

# --- 4. About section gets a real work photo instead of the logo ---
about = Image.open(SRC + 'IMG-20260825-WA0146.jpg')
about.save('assets/img/about.jpg', quality=88, optimize=True)

print('done')
