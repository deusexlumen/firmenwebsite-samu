"""NICHT AUSFUEHREN — kaputtes Einmal-Skript, nur als Beleg aufbewahrt.

Liest nicht mehr existierende JPGs und LOESCHT Dateien per os.remove().
Das aktuelle Bildskript ist rebuild_gallery.py (siehe AGENTS.md).

One-off size optimization: WebP for all photos, tiny header logo, favicons.

Replaces the heavyweight JPEG/PNG assets with right-sized WebP versions.
Raw WhatsApp photos in the project root stay untouched — this only rewrites
files in assets/img/. gallery-6 is swapped to an unused raw photo because it
was byte-identical to hero-bg.jpg (same picture twice on one page).
"""

import os
from PIL import Image

IMG = 'assets/img'


def to_webp(src, dest, max_dim, quality=80):
    img = Image.open(src)
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    img.save(dest, 'WEBP', quality=quality, method=6)
    print(dest, img.size, os.path.getsize(dest) // 1024, 'KB')
    return img.size


# --- Photos: right-size and convert to WebP ---
to_webp(IMG + '/hero-bg.jpg', IMG + '/hero-bg.webp', 1920, quality=78)
for n in range(1, 6):
    to_webp(f'{IMG}/gallery-{n}.jpg', f'{IMG}/gallery-{n}.webp', 1600)

# gallery-6 was a copy of hero-bg; use an unused raw photo instead
to_webp('../IMG-20260825-WA0144.jpg', IMG + '/gallery-6.webp', 1600)

to_webp(IMG + '/about.jpg', IMG + '/about.webp', 1200)

# --- Header logo: shown at max ~62px height, 500px wide is plenty for 2x ---
logo = Image.open(IMG + '/logo-header.png')
w, h = logo.size
logo_small = logo.resize((500, round(h * 500 / w)), Image.LANCZOS)
logo_small.save(IMG + '/logo-header.webp', 'WEBP', quality=88, method=6)
print(IMG + '/logo-header.webp', logo_small.size, os.path.getsize(IMG + '/logo-header.webp') // 1024, 'KB')

# --- Favicons: the house mark from the logo lockup, cropped square ---
side = min(logo.size)
cx = logo.size[0] // 2
mark = logo.crop((cx - side // 2, 0, cx + side // 2, side))
mark.resize((180, 180), Image.LANCZOS).save(IMG + '/apple-touch-icon.png', optimize=True)
mark.resize((32, 32), Image.LANCZOS).save(IMG + '/favicon-32.png', optimize=True)
print('favicons done')

# --- Drop the superseded originals (raws in the project root are the backup) ---
for f in ['hero-bg.jpg', 'about.jpg', 'logo-header.png'] + [f'gallery-{n}.jpg' for n in range(1, 7)]:
    os.remove(f'{IMG}/{f}')
    print('removed', f)

print('done')
