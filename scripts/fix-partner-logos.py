#!/usr/bin/env python3
"""Fix the four incorrectly sourced partner logos."""
import json
import os
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '../client/public/assets/partners')
TMP = os.path.join(os.path.dirname(__file__), '../.tmp/partner-logos')
TARGET_H = 120
SPAREBANK1_H = 240

os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)


def trim(im):
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def resize_h(im, height, scale=1.0):
    th = max(1, int(round(height * scale)))
    ratio = th / im.height
    nw = max(1, int(round(im.width * ratio)))
    return im.resize((nw, th), Image.Resampling.LANCZOS)


def save(name, im, scale=1.0):
    im = trim(im)
    im = resize_h(im, TARGET_H, scale)
    path = os.path.join(OUT, name)
    im.save(path, optimize=True)
    print(json.dumps({'name': name, 'size': im.size}))


def to_white_mono(im, alpha_threshold=20):
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < alpha_threshold:
                px[x, y] = (0, 0, 0, 0)
            else:
                px[x, y] = (255, 255, 255, a)
    return im


def process_if(path):
    im = Image.open(path).convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 12:
                px[x, y] = (0, 0, 0, 0)
                continue
            if b > 120 and b > r + 20 and b > g + 10:
                px[x, y] = (255, 255, 255, a)
            elif max(r, g, b) > 200:
                px[x, y] = (15, 15, 15, a)
            else:
                px[x, y] = (0, 0, 0, 0)
    return im


def crop_from_banner(box, out_name, target_h=TARGET_H):
    banner = os.path.join(os.path.dirname(__file__), '../client/public/assets/samarbeidspartnere.png')
    img = Image.open(banner).convert('RGBA')
    w, h = img.size
    row_h = h // 2
    x0, x1, row = box
    y0 = 0 if row == 0 else row_h
    y1 = row_h if row == 0 else h
    crop = img.crop((x0, y0, x1, y1))
    px = crop.load()
    cw, ch = crop.size
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = px[x, y]
            if max(r, g, b) < 40:
                px[x, y] = (0, 0, 0, 0)
            elif max(r, g, b) > 200:
                px[x, y] = (255, 255, 255, a)
            else:
                lum = max(r, g, b)
                px[x, y] = (255, 255, 255, min(255, int(lum * 1.2)))
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    ratio = target_h / crop.height
    crop = crop.resize((max(1, int(crop.width * ratio)), target_h), Image.Resampling.LANCZOS)
    crop.save(os.path.join(OUT, out_name), optimize=True)
    print(json.dumps({'name': out_name, 'size': crop.size, 'source': 'banner'}))


def main():
    crop_from_banner((0, 470, 0), 'sparebank1.png', SPAREBANK1_H)

    nbt = to_white_mono(Image.open(os.path.join(TMP, 'nbt-logo.png')))
    save('nbt.png', nbt)

    enter = to_white_mono(Image.open(os.path.join(TMP, 'enter-f1.png')))
    save('enter-tryg.png', enter)

    if_logo = process_if(os.path.join(TMP, 'if-raw.png'))
    save('if.png', if_logo)


if __name__ == '__main__':
    main()
