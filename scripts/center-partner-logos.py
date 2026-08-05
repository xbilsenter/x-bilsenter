#!/usr/bin/env python3
"""Optically center partner logo ink on a normalized canvas."""
import json
import os
from PIL import Image

PARTNERS = os.path.join(os.path.dirname(__file__), '../client/public/assets/partners')
TARGETS = {
    'sparebank1.svg': 240,
}
DEFAULT_H = 120
ALPHA_MIN = 20
SKIP = {'axess.png'}  # Multi-line / banner logos — keep PNG.


def visual_center_y(im):
    px = im.load()
    w, h = im.size
    total = cy = 0.0
    for y in range(h):
        for x in range(w):
            a = px[x, y][3]
            if a >= ALPHA_MIN:
                total += a
                cy += y * a
    if total <= 0:
        return h / 2
    return cy / total


def center_logo(path, target_h):
    im = Image.open(path).convert('RGBA')
    bbox = im.getbbox()
    if not bbox:
        return im.size

    cropped = im.crop(bbox)
    scale = target_h / cropped.height
    nw = max(1, int(round(cropped.width * scale)))
    scaled = cropped.resize((nw, target_h), Image.Resampling.LANCZOS)
    vcy = visual_center_y(scaled)

    canvas = Image.new('RGBA', (nw, target_h), (0, 0, 0, 0))
    offset_y = int(round(target_h / 2 - vcy))
    offset_y = max(0, min(offset_y, target_h - scaled.height))
    canvas.paste(scaled, (0, offset_y), scaled)
    canvas.save(path, optimize=True)
    return canvas.size


def main():
    for name in sorted(os.listdir(PARTNERS)):
        if not name.endswith('.png') or name in SKIP:
            if name in SKIP:
                print(json.dumps({'name': name, 'skipped': True}))
            continue
        path = os.path.join(PARTNERS, name)
        target_h = TARGETS.get(name, DEFAULT_H)
        size = center_logo(path, target_h)
        print(json.dumps({'name': name, 'size': size, 'target_h': target_h}))


if __name__ == '__main__':
    main()
