"""Signature vectorizer: raster signature -> centerline SVG paths for stroke-draw animation.

Reads signatur-mundt.png (light script on dark background), skeletonizes the strokes,
traces the skeleton into polylines, smooths them (Catmull-Rom -> cubic Bezier) and writes
an inline-ready SVG with one <path> per stroke. Per-path stroke-width comes from the
local pen thickness (distance transform), so pressure variation survives.

Output order is left-to-right (natural writing flow) so a dashoffset draw animation
reads like actual signing.

Usage (from repo root):  python site/vectorize_signature.py
"""

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import distance_transform_edt
from skimage.measure import approximate_polygon
from skimage.morphology import skeletonize

SRC = "signatur-mundt.png"
OUT = "site/signature.svg"
SCALE = 0.5          # downscale before skeletonizing: kills raster noise, halves trace work
BLUR_RADIUS = 1.5    # pre-blur so anti-aliased edges don't fuzz the threshold
THRESHOLD = 160      # bright stroke cores only — fuzzy halos stay out of the mask
SPUR_PRUNE = 4       # endpoint erosion passes to cut skeleton spurs (px)
RDP_TOLERANCE = 2.2
MIN_STROKE_PX = 30   # drop specks shorter than this


def load_mask():
    img = Image.open(SRC).convert("L")
    if SCALE != 1.0:
        img = img.resize((int(img.width * SCALE), int(img.height * SCALE)),
                         Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(BLUR_RADIUS))
    mask = np.array(img) > THRESHOLD
    ys, xs = np.where(mask)
    pad = 8
    y0, y1 = max(0, ys.min() - pad), min(mask.shape[0], ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(mask.shape[1], xs.max() + pad)
    return mask[y0:y1, x0:x1]


def prune_spurs(skel, passes):
    """Erode free endpoints N passes — cuts short spur branches off the skeleton."""
    cur = skel.copy()
    h, w = cur.shape
    for _ in range(passes):
        kill = np.zeros_like(cur)
        for y, x in zip(*np.where(cur)):
            n = 0
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if (dy or dx) and 0 <= y + dy < h and 0 <= x + dx < w and cur[y + dy, x + dx]:
                        n += 1
            if n <= 1:
                kill[y, x] = True
        cur &= ~kill
    return cur


def trace_strokes(skel):
    """Trace the skeleton into long strokes.

    Walks do NOT stop at junctions: a junction pixel becomes part of the path and
    the walk continues along the unvisited neighbor with the straightest heading
    (max dot product with the incoming direction). Stopping at junctions chops
    every crossing into dotted fragments — the rendered signature then reads like
    braille. Remaining junction branches become their own strokes afterwards.
    """
    h, w = skel.shape
    coords = list(zip(*np.where(skel)))  # (y, x)
    deg = {}
    for y, x in coords:
        n = 0
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if (dy or dx) and 0 <= y + dy < h and 0 <= x + dx < w and skel[y + dy, x + dx]:
                    n += 1
        deg[(y, x)] = n

    visited_edges = set()
    strokes = []

    def neighbors(p):
        y, x = p
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if not (dy or dx):
                    continue
                q = (y + dy, x + dx)
                if 0 <= q[0] < h and 0 <= q[1] < w and skel[q]:
                    yield q

    def walk(start, nxt):
        path = [start, nxt]
        visited_edges.add((start, nxt))
        visited_edges.add((nxt, start))
        prev, cur = start, nxt
        while True:
            candidates = [q for q in neighbors(cur) if (cur, q) not in visited_edges]
            if not candidates:
                break
            if len(candidates) == 1:
                nxt2 = candidates[0]
            else:
                # straightest continuation through the junction
                din = np.array([cur[0] - prev[0], cur[1] - prev[1]], dtype=float)
                norm = np.hypot(*din) or 1.0
                din /= norm
                best, best_score = None, -2.0
                for q in candidates:
                    dout = np.array([q[0] - cur[0], q[1] - cur[1]], dtype=float)
                    dout /= (np.hypot(*dout) or 1.0)
                    score = float(din @ dout)
                    if score > best_score:
                        best, best_score = q, score
                nxt2 = best
            visited_edges.add((cur, nxt2))
            visited_edges.add((nxt2, cur))
            path.append(nxt2)
            prev, cur = cur, nxt2
        return path

    # strokes starting at endpoints first (deg 1), then remaining junction branches
    for p in coords:
        if deg[p] == 1:
            for q in neighbors(p):
                if (p, q) not in visited_edges:
                    strokes.append(walk(p, q))
    for p in coords:
        if deg[p] >= 3:
            for q in neighbors(p):
                if (p, q) not in visited_edges:
                    strokes.append(walk(p, q))
    # pure loops (all degree 2)
    for p in coords:
        if deg[p] == 2:
            for q in neighbors(p):
                if (p, q) not in visited_edges:
                    strokes.append(walk(p, q))
                    break
    return strokes


def merge_strokes(strokes, max_gap=3.0):
    """Glue strokes whose endpoints touch (junction remnants, pruning seams)."""
    changed = True
    while changed:
        changed = False
        for i in range(len(strokes)):
            if changed:
                break
            for j in range(len(strokes)):
                if i == j:
                    continue
                a, b = strokes[i], strokes[j]
                if np.hypot(a[-1][0] - b[0][0], a[-1][1] - b[0][1]) <= max_gap:
                    strokes[i] = a + b
                    del strokes[j]
                    changed = True
                    break
                if np.hypot(a[-1][0] - b[-1][0], a[-1][1] - b[-1][1]) <= max_gap:
                    strokes[i] = a + b[::-1]
                    del strokes[j]
                    changed = True
                    break
    return strokes


def catmull_rom_bezier(pts):
    """pts: list of (x, y). Returns SVG path data with cubic segments."""
    if len(pts) == 2:
        return f"M{pts[0][0]:.1f},{pts[0][1]:.1f} L{pts[1][0]:.1f},{pts[1][1]:.1f}"
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d


def stroke_length(pts):
    return float(sum(np.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
                     for i in range(len(pts) - 1)))


def main():
    mask = load_mask()
    skel = prune_spurs(skeletonize(mask), SPUR_PRUNE)
    dist = distance_transform_edt(mask)
    strokes = merge_strokes(trace_strokes(skel))

    paths = []
    for stroke in strokes:
        if len(stroke) < 2:
            continue
        pts_xy = [(float(x), float(y)) for y, x in stroke]
        if stroke_length(pts_xy) < MIN_STROKE_PX:
            continue
        simplified = approximate_polygon(np.array(pts_xy), tolerance=RDP_TOLERANCE)
        simp = [(float(p[0]), float(p[1])) for p in simplified]
        width = float(np.mean([dist[int(round(y)), int(round(x))] for x, y in simp])) * 2 * 0.85
        width = max(2.5, min(width, 14.0))
        d = catmull_rom_bezier(simp)
        sx = sum(p[0] for p in simp) / len(simp)
        sy = sum(p[1] for p in simp) / len(simp)
        paths.append({"d": d, "w": width, "cx": sx, "cy": sy, "x0": simp[0][0]})

    # natural writing order: left to right, ties top to bottom
    paths.sort(key=lambda p: (p["cx"], p["cy"]))

    h, w = mask.shape
    lines = [f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">']
    for p in paths:
        lines.append(f'  <path d="{p["d"]}" stroke-width="{p["w"]:.1f}"/>')
    lines.append("</svg>")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"{len(paths)} strokes, viewBox 0 0 {w} {h} -> {OUT}")


if __name__ == "__main__":
    main()
