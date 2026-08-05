from PIL import Image
import sys

raw_path, icon_path, out_path, target_h = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])

raw = Image.open(raw_path).convert('RGBA')
px = raw.load()
w, h = raw.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if x >= 158:
            px[x, y] = (0, 0, 0, 0)
            continue
        if a < 20:
            px[x, y] = (0, 0, 0, 0)
            continue
        if b > 70 and b >= r and b > g:
            px[x, y] = (255, 255, 255, a)
        elif max(r, g, b) > 35:
            px[x, y] = (255, 255, 255, a)
        else:
            px[x, y] = (0, 0, 0, 0)

text = raw.crop(raw.getbbox())

icon = Image.open(icon_path).convert('RGBA')
top_h = max(1, int(text.height * 0.72))
icon = icon.resize(
    (max(1, int(icon.width * (top_h / icon.height))), top_h),
    Image.Resampling.LANCZOS,
)

gap = max(8, int(text.width * 0.04))
canvas_w = text.width + gap + icon.width
canvas_h = max(text.height, icon.height)
out = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
out.paste(text, (0, canvas_h - text.height))
out.paste(icon, (text.width + gap, 0), icon)

ratio = target_h / out.height
out = out.resize((max(1, int(out.width * ratio)), target_h), Image.Resampling.LANCZOS)
out.save(out_path, optimize=True)
print(out.size)
