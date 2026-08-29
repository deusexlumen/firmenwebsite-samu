"""Signature draw-mask builder: outline SVG -> centerline stroke mask.

Reads site/signature-outline.svg (filled calligraphy silhouette, M/L/Z polylines),
rasterizes it (honoring holes via signed-area winding), skeletonizes the ink and
traces the skeleton into smooth pen strokes. The result is NOT shown to anyone —
it becomes an invisible <mask> over the real outline in index.html, so the ink can
grow along the actual writing path while the visible shape stays the true outline.

Stroke widths come from the local silhouette thickness (distance transform), with
a coverage margin so no ink edge pokes out of the mask while drawing.

Outputs:
  site/signature-mask.svg    - one <path> per pen stroke (viewBox matches outline)
  site/sig-mask-preview.png  - debug render (outline gray, strokes numbered red)

Usage (from repo root):  python site/build_sig_mask.py
"""

import os
import re

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt
from skimage.measure import approximate_polygon
from skimage.morphology import skeletonize

from vectorize_signature import (
    catmull_rom_bezier,
    merge_strokes,
    prune_spurs,
    stroke_length,
    trace_strokes,
)

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "signature-outline.svg")
OUT = os.path.join(BASE, "signature-mask.svg")
PREVIEW = os.path.join(BASE, "sig-mask-preview.png")

SCALE = 2            # raster oversampling: smoother skeleton, coords divided back
SPUR_PRUNE = 8       # endpoint erosion passes at SCALE resolution
RDP_TOLERANCE = 3.0  # at SCALE resolution (~1.5 final units)
MIN_STROKE_PX = 40   # at SCALE resolution (20 final units)
WIDTH_MARGIN = 1.35  # mask stroke = local thickness * margin (coverage safety)
WIDTH_MIN = 9.0      # final units — thin exits must still cover the ink
WIDTH_MAX = 90.0     # final units


def load_polygons():
    src = open(SRC, encoding="utf-8").read()
    vb = re.search(r'viewBox="0 0 (\d+) (\d+)"', src)
    w, h = int(vb.group(1)), int(vb.group(2))
    d = re.search(r'<path d="([^"]+)"', src).group(1)
    polys = []
    for sub in d.split("M "):
        nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", sub)]
        pts = list(zip(nums[0::2], nums[1::2]))
        if len(pts) >= 3:
            polys.append(pts)
    return polys, w, h


def signed_area(pts):
    return 0.5 * sum(
        pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1]
        for i in range(len(pts))
    )


def rasterize(polys, w, h):
    """Fill outer contours white, counters black (sign majority = outer)."""
    img = Image.new("L", (w * SCALE, h * SCALE), 0)
    draw = ImageDraw.Draw(img)
    areas = [signed_area(p) for p in polys]
    outer_sign = 1.0 if sum(areas) > 0 else -1.0
    for pts, area in zip(polys, areas):
        scaled = [(x * SCALE, y * SCALE) for x, y in pts]
        draw.polygon(scaled, fill=255 if (area * outer_sign) > 0 else 0)
    return np.array(img) > 127


def orient_and_sort(strokes):
    """Pen direction heuristic: horizontal strokes run left->right, vertical
    ones top->bottom; order follows the writing flow (start x, then y)."""
    out = []
    for item in strokes:
        pts = item["pts"]
        x0, y0 = pts[0]
        x1, y1 = pts[-1]
        if abs(x1 - x0) >= abs(y1 - y0):
            if x1 < x0:
                pts = pts[::-1]
        elif y1 < y0:
            pts = pts[::-1]
        out.append({"pts": pts, "w": item["w"]})
    out.sort(key=lambda p: (min(x for x, _ in p["pts"]), min(y for _, y in p["pts"])))
    return out


def main():
    polys, w, h = load_polygons()
    mask = rasterize(polys, w, h)
    skel = prune_spurs(skeletonize(mask), SPUR_PRUNE)
    dist = distance_transform_edt(mask)
    strokes = merge_strokes(trace_strokes(skel), max_gap=4.0 * SCALE)

    paths = []
    for stroke in strokes:
        if len(stroke) < 2:
            continue
        pts_xy = [(float(x), float(y)) for y, x in stroke]
        if stroke_length(pts_xy) < MIN_STROKE_PX:
            continue
        simp = [(float(p[0]), float(p[1])) for p in
                approximate_polygon(np.array(pts_xy), tolerance=RDP_TOLERANCE)]
        width = float(np.mean([dist[int(round(y)), int(round(x))] for x, y in simp]))
        width = width * 2 * WIDTH_MARGIN / SCALE
        width = max(WIDTH_MIN, min(width, WIDTH_MAX))
        final = [(x / SCALE, y / SCALE) for x, y in simp]
        paths.append({"pts": final, "w": width})

    ordered = orient_and_sort(paths)
    lines = []
    preview = Image.new("RGB", (w, h), (18, 18, 22))
    pd = ImageDraw.Draw(preview)
    for pts in polys:
        pd.polygon(pts, fill=(90, 90, 96))
    for i, item in enumerate(ordered):
        pts = item["pts"]
        d = catmull_rom_bezier(pts)
        lines.append('<path class="sig-stroke" d="%s" stroke-width="%.1f"/>' % (d, item["w"]))
        pd.line(pts, fill=(255, 80 + min(120, i * 8), 60), width=2)
        pd.text((pts[0][0] + 4, pts[0][1] - 10), str(i), fill=(120, 220, 255))
    preview.save(PREVIEW)

    svg = (
        '<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" fill="none" '
        'stroke="#fff" stroke-linecap="round" stroke-linejoin="round">\n  %s\n</svg>\n'
        % (w, h, "\n  ".join(lines))
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(svg)
    total = sum(stroke_length(p["pts"]) for p in ordered)
    print("%d strokes, total pen path %.0f units, viewBox 0 0 %d %d -> %s"
          % (len(ordered), total, w, h, OUT))


if __name__ == "__main__":
    main()
