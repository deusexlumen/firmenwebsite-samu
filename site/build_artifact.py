"""Build a single self-contained HTML file for publishing as an Artifact.

Inlines styles.css, script.js and every image as a data URI, and folds the
separate Impressum page into an anchor section (artifacts are one page).
"""

import base64
import re


MIME = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'woff2': 'font/woff2',
}


def data_uri(path):
    mime = MIME[path.rsplit('.', 1)[1].lower()]
    with open(path, 'rb') as f:
        return f'data:{mime};base64,' + base64.b64encode(f.read()).decode('ascii')


ASSETS = [
    'assets/img/hero-bg.webp',
    'assets/img/gallery-1.webp',
    'assets/img/gallery-2.webp',
    'assets/img/gallery-3.webp',
    'assets/img/gallery-4.webp',
    'assets/img/gallery-5.webp',
    'assets/img/gallery-6.webp',
    'assets/img/gallery-7.webp',
    'assets/img/about.webp',
    'assets/img/sascha.webp',
    'assets/img/logo-header.webp',
    'assets/img/favicon-32.png',
    'assets/img/apple-touch-icon.png',
]

FONTS = [
    'assets/fonts/archivo-black-400.woff2',
    'assets/fonts/barlow-400.woff2',
    'assets/fonts/barlow-500.woff2',
    'assets/fonts/barlow-600.woff2',
    'assets/fonts/barlow-condensed-500.woff2',
    'assets/fonts/barlow-condensed-600.woff2',
    'assets/fonts/newsreader-italic.woff2',
    'assets/fonts/space-mono-400.woff2',
    'assets/fonts/space-mono-700.woff2',
]

IMAGES = {path: data_uri(path) for path in ASSETS + FONTS}

html = open('index.html', encoding='utf-8').read()
css = open('styles.css', encoding='utf-8').read()
js = open('script.js', encoding='utf-8').read()
# GSAP core plus the plugins the scroll choreography and the lightbox need.
# Order matters: the plugins register against the core, so core comes first.
SCRIPTS = [
    'assets/js/gsap.min.js',
    'assets/js/ScrollTrigger.min.js',
    'assets/js/Flip.min.js',
]


def legal_section(page, anchor):
    """Pull the .legal block out of a legal page (impressum/datenschutz) and
    reuse it as an in-page section — artifacts are one page."""
    text = open(page, encoding='utf-8').read()
    match = re.search(r'<div class="legal">(.*?)</div>\s*</div>\s*</section>', text, re.S)
    body = match.group(1).strip() if match else ''
    return (
        f'\n  <section class="section" id="{anchor}">\n'
        '    <div class="container">\n'
        '      <div class="legal">\n'
        f'{body}\n'
        '      </div>\n'
        '    </div>\n'
        '  </section>\n'
    )


# Artifacts are a single page: footer links become in-page anchors.
html = html.replace('<a href="impressum.html">Impressum</a>', '<a href="#impressum">Impressum</a>')
html = html.replace('<a href="datenschutz.html">Datenschutz</a>', '<a href="#datenschutz">Datenschutz</a>')
html = html.replace('</main>', legal_section('impressum.html', 'impressum')
                               + legal_section('datenschutz.html', 'datenschutz') + '</main>')

tags = ''.join(f'<script src="{path}"></script>\n' for path in SCRIPTS) + \
       '<script src="script.js"></script>'

inlined = ''.join(
    '<script>\n' + open(path, encoding='utf-8').read() + '\n</script>\n'
    for path in SCRIPTS
) + '<script>\n' + js + '\n</script>'

if tags not in html:
    raise SystemExit('build failed: script tags in index.html do not match SCRIPTS')

html = html.replace(tags, inlined)

# Inline every image and font reference, in both the markup and the stylesheet.
for path, uri in IMAGES.items():
    html = html.replace(path, uri)
    css = css.replace(path, uri)

# Artifacts supply their own <html>/<head>/<body> wrapper, but everything WE put
# in <head> — viewport, description, Open Graph card, the LocalBusiness JSON-LD —
# is still meaningful and must survive. Only the bits that make no sense in a
# single-file build (the stylesheet link, font preloads, our own <title>, the
# now-empty preconnects) get dropped; everything else in <head> is kept as-is.
head_match = re.search(r'<head>(.*?)</head>', html, re.S)
if not head_match:
    raise SystemExit('build failed: no <head> found in index.html')
head_content = head_match.group(1)

head_content = re.sub(r'\s*<title>.*?</title>', '', head_content, flags=re.S)
head_content = re.sub(r'\s*<link rel="preload"[^>]*>', '', head_content)
head_content = re.sub(r'\s*<link rel="stylesheet" href="styles\.css">', '', head_content)
head_content = head_content.strip()

body_match = re.search(r'<body>(.*?)</body>', html, re.S)
if not body_match:
    raise SystemExit('build failed: no <body> found in index.html')
body = body_match.group(1).strip()

head_extra = (
    '<meta charset="utf-8">\n'
    '<title>SaMu Dachbeschichtung</title>\n' +
    head_content + '\n'
    '<style>\n' + css + '\n</style>\n'
)

out = head_extra + body + '\n'

if '<style>' not in out or '--spark' not in out:
    raise SystemExit('build failed: stylesheet missing from output')

if 'application/ld+json' not in out:
    raise SystemExit('build failed: structured data (JSON-LD) missing from output')

if 'name="viewport"' not in out:
    raise SystemExit('build failed: viewport meta missing from output')

# Matches a real request, not the stylesheet comment that explains why we avoid one.
if re.search(r'https://fonts\.(googleapis|gstatic)\.com', out):
    raise SystemExit('build failed: page still requests fonts from Google servers')

with open('artifact.html', 'w', encoding='utf-8') as f:
    f.write(out)

remaining = re.findall(r'(?:href|src)="(?!data:|#|tel:|mailto:|https:)[^"]+"', out)
print('bytes:', len(out.encode('utf-8')))
print('unresolved local references:', remaining or 'none')
