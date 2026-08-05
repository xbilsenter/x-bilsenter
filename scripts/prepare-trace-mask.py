from PIL import Image, ImageOps
import sys

src, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
scale = int(sys.argv[4]) if len(sys.argv) > 4 else 4
alpha_min = int(sys.argv[5]) if len(sys.argv) > 5 else 128

im = Image.open(src).convert('RGBA')
w, h = im.size
mask = Image.new('L', (w, h), 0)
px = im.load()
mp = mask.load()

for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if mode == 'alpha':
            if a >= alpha_min:
                mp[x, y] = 255
            continue
        if a < 30:
            continue
        lum = max(r, g, b)
        if mode == 'dark':
            if lum < 85:
                mp[x, y] = 255
        else:
            if lum >= 85:
                mp[x, y] = 255

mask = mask.resize((w * scale, h * scale), Image.NEAREST)
ImageOps.invert(mask).save(out)
