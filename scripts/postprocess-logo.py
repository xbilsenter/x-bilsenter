from PIL import Image
import sys
import json

path, out, target_h, scale = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
white_mode = sys.argv[5] if len(sys.argv) > 5 else '1'
pad_bottom = int(sys.argv[6]) if len(sys.argv) > 6 else 0

im = Image.open(path).convert('RGBA')
px = im.load()
w, h = im.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a < 12:
            px[x, y] = (0, 0, 0, 0)
            continue
        if white_mode == 'if':
            if b > 120 and b > r + 20 and b > g + 10:
                px[x, y] = (255, 255, 255, a)
            elif max(r, g, b) > 200:
                px[x, y] = (15, 15, 15, a)
            else:
                px[x, y] = (0, 0, 0, 0)
            continue
        if white_mode == 'sb1':
            if r > 130 and g < 110 and b < 110 and r > g + 20:
                px[x, y] = (255, 255, 255, a)
            elif b > 70 and b >= r and b > g:
                px[x, y] = (255, 255, 255, a)
            elif r > 190 and g > 190 and b > 190:
                px[x, y] = (0, 0, 0, 0)
            elif max(r, g, b) > 35:
                px[x, y] = (255, 255, 255, a)
            else:
                px[x, y] = (0, 0, 0, 0)
            continue
        if white_mode == '0':
            continue
        if white_mode == '1':
            if a < 20:
                px[x, y] = (0, 0, 0, 0)
            else:
                px[x, y] = (255, 255, 255, a)
            continue
        lum = max(r, g, b)
        if lum < 40:
            px[x, y] = (0, 0, 0, 0)
        else:
            px[x, y] = (255, 255, 255, a)

bbox = im.getbbox()
if bbox:
    im = im.crop(bbox)

th = max(1, int(round(target_h * scale)))
ratio = th / im.height
nw = max(1, int(round(im.width * ratio)))
im = im.resize((nw, th), Image.Resampling.LANCZOS)
if pad_bottom > 0:
    canvas = Image.new('RGBA', (nw, th + pad_bottom), (0, 0, 0, 0))
    canvas.paste(im, (0, 0), im)
    im = canvas
im.save(out, optimize=True)
print(json.dumps({'out': out, 'size': im.size}))
