#!/usr/bin/env python3
"""Generate public/models/food/Textures/colormap.png.

The Kenney food-kit GLBs in public/models/food/ sample a shared palette
texture ("colormap") that was never committed to this repo, so the models
rendered textureless/wrong. Their UVs address a 16-column sheet: U picks a
hue column (cell centers at (i+0.5)/16), V picks the shade along a vertical
gradient (V=1 light, V=0 dark).

This script paints a compatible sheet with food-appropriate ramps, chosen by
inspecting which cells each model used in the coffee game
(public/coffee-game/): col 1 = baked golden, col 3 = chocolate/coffee,
col 5 = waffle gold / caramel icing, col 11/13 = sprinkle red/green,
col 15 = porcelain/cream, etc. Edit RAMPS and re-run to retheme.

Usage: python3 tools/generate-food-colormap.py
"""
import os
import struct
import zlib

W = H = 256
COLS = 16
OUT = os.path.join(os.path.dirname(__file__), '..',
                   'public', 'models', 'food', 'Textures', 'colormap.png')

# column -> (top color at V=1, bottom color at V=0)
RAMPS = {
    0:  ('b8d49a', '5a7a44'),   # tea / sage green
    1:  ('f4c98a', '8a5426'),   # baked golden (croissant, dough, tea amber)
    2:  ('ffe9b3', 'c49a4a'),   # butter
    3:  ('a9744f', '3f2413'),   # chocolate / coffee
    4:  ('ffb36b', 'c46a2a'),   # orange
    5:  ('f2cd8a', 'a8752f'),   # waffle gold / caramel icing
    6:  ('ffc2d8', 'd96a92'),   # frosting pink
    7:  ('d98ac0', '8a3f6e'),   # berry
    8:  ('a3c9ff', '4a6ea8'),   # blueberry
    9:  ('9adbc8', '3f8a74'),   # teal
    10: ('c9a8e8', '7a54a8'),   # grape
    11: ('ff8a7a', 'b03328'),   # cherry red
    12: ('e86a5a', '7a2418'),   # deep red
    13: ('b5e0a8', '54925f'),   # pistachio green
    14: ('d8d8d8', '6e6e6e'),   # gray
    15: ('fffdf6', 'cbb89a'),   # porcelain / cream
}


def hex2rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def build():
    rows = []
    for y in range(H):
        v = 1 - (y + 0.5) / H        # image top = V=1 (glTF V is flipped)
        row = bytearray([0])         # PNG filter byte
        for x in range(W):
            col = min(COLS - 1, x * COLS // W)
            top, bot = (hex2rgb(c) for c in RAMPS[col])
            t = v ** 1.35            # ease keeps the light half creamy
            row += bytes(round(b + (a - b) * t) for a, b in zip(top, bot))
        rows.append(bytes(row))
    return b''.join(rows)


def chunk(tag, data):
    c = struct.pack('>I', len(data)) + tag + data
    return c + struct.pack('>I', zlib.crc32(tag + data))


def main():
    raw = build()
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    with open(OUT, 'wb') as f:
        f.write(png)
    print(f'wrote {OUT} ({len(png)} bytes)')


if __name__ == '__main__':
    main()
