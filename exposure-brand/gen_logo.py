"""Builds the Exposure Solutions logo as vector paths.

Letters: Barlow Semi Condensed (SIL OFL). The O in EXPOSURE (variant A) or the first O in
SOLUTIONS (variant B) is replaced by a camera aperture ("lens").

Writes:
  logo-geometry.json  letter paths + lens position, used by the animated logo
  logo-A.svg / logo-B.svg   static logos, white on transparent
  logo-A-dark.svg           dark letters for light backgrounds

Run: python3 gen_logo.py
"""
import json
import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
FONT = TTFont(HERE / "fonts" / "BarlowSemiCondensed-Black.ttf")
GS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
CAP = FONT["OS/2"].sCapHeight
CYAN = "#19d3e6"

LINES = ["EXPOSURE", "SOLUTIONS"]
LEADING = CAP * 0.2          # gap between the two lines
TRACK = -CAP * 0.005          # letter spacing


def glyph(ch):
    return GS[CMAP[ord(ch)]]


def glyph_bounds(ch):
    bp = BoundsPen(GS)
    glyph(ch).draw(bp)
    return bp.bounds  # xMin, yMin, xMax, yMax


def lens_radius():
    xmin, ymin, xmax, ymax = glyph_bounds("O")
    return (ymax - ymin) / 2  # O height incl. overshoot


def line_items(text, lens_index):
    """Return [(char, advance, is_lens)] with the lens replacing one O."""
    items = []
    for i, ch in enumerate(text):
        if i == lens_index:
            r = lens_radius()
            xmin, _, xmax, _ = glyph_bounds("O")
            lsb = xmin
            rsb = glyph("O").width - xmax
            items.append((ch, lsb + 2 * r + rsb, True))
        else:
            items.append((ch, glyph(ch).width, False))
    return items


def build(variant):
    lens_line, lens_index = (0, 3) if variant == "A" else (1, 1)
    lines = [line_items(t, lens_index if n == lens_line else -1) for n, t in enumerate(LINES)]
    widths = [sum(a for _, a, _ in it) + TRACK * (len(it) - 1) for it in lines]
    W = max(widths)
    letters, lens = [], None
    ascent = CAP
    for n, items in enumerate(lines):
        # justify every line to the same width by spreading the extra space between letters
        extra = (W - widths[n]) / max(1, len(items) - 1)
        baseline = ascent + n * (CAP + LEADING)
        x = 0.0
        for ch, adv, is_lens in items:
            if is_lens:
                xmin, ymin, xmax, ymax = glyph_bounds("O")
                r = lens_radius()
                cx = x + xmin + r
                cy = baseline - (ymin + ymax) / 2
                lens = {"cx": round(cx, 1), "cy": round(cy, 1), "r": round(r, 1)}
            else:
                pen = SVGPathPen(GS)
                glyph(ch).draw(TransformPen(pen, (1, 0, 0, -1, x, baseline)))
                letters.append({"ch": ch, "line": n, "x": round(x, 1), "d": pen.getCommands()})
            x += adv + TRACK + extra
    H = ascent + CAP + LEADING + abs(FONT["OS/2"].sTypoDescender) * 0.05
    return {"variant": variant, "width": round(W, 1), "height": round(2 * CAP + LEADING + 20, 1),
            "cap": CAP, "letters": letters, "lens": lens}


def lens_svg(l, fill, blade, gap_color=None):
    """Aperture: outer ring like the O's stroke, inner disc split into 6 blades around a hexagon."""
    cx, cy, R = l["cx"], l["cy"], l["r"]
    ring = R * 0.255                # ring thickness ~ letter stem
    r_in = R - ring * 1.35          # blade disc radius
    hexr = r_in * 0.42              # opening
    gap = r_in * 0.085
    parts = [f'<circle cx="{cx}" cy="{cy}" r="{R - ring / 2:.1f}" fill="none" stroke="{fill}" stroke-width="{ring:.1f}"/>']
    # blades: disc with 6 tangent cuts + hex opening, built with a mask
    cuts = []
    for i in range(6):
        a = math.radians(60 * i + 15)
        # a line tangent to the hexagon, running outward
        px, py = cx + hexr * math.cos(a), cy + hexr * math.sin(a)
        dx, dy = -math.sin(a), math.cos(a)
        cuts.append(f'<line x1="{px - dx * r_in * 0.1:.1f}" y1="{py - dy * r_in * 0.1:.1f}" x2="{px + dx * r_in * 1.6:.1f}" y2="{py + dy * r_in * 1.6:.1f}" stroke="#000" stroke-width="{gap:.1f}"/>')
    hexpts = " ".join(f"{cx + hexr * math.cos(math.radians(60 * i + 15 + 30)) / math.cos(math.radians(30)):.1f},"
                      f"{cy + hexr * math.sin(math.radians(60 * i + 15 + 30)) / math.cos(math.radians(30)):.1f}" for i in range(6))
    mid = f"lensmask{l['cx']:.0f}"
    parts.append(f'<mask id="{mid}"><circle cx="{cx}" cy="{cy}" r="{r_in:.1f}" fill="#fff"/>{"".join(cuts)}<polygon points="{hexpts}" fill="#000"/></mask>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r_in:.1f}" fill="{blade}" mask="url(#{mid})"/>')
    return "".join(parts)


def svg(geo, letter_fill, lens_ring, lens_blade):
    pad = 40
    w, h = geo["width"] + pad * 2, geo["height"] + pad * 2
    body = "".join(f'<path d="{l["d"]}"/>' for l in geo["letters"])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">'
            f'<title>Exposure Solutions</title><g fill="{letter_fill}">{body}</g>'
            f'{lens_svg(geo["lens"], lens_ring, lens_blade)}</svg>')


if __name__ == "__main__":
    out = {}
    for v in "AB":
        geo = build(v)
        out[v] = geo
        (HERE / f"logo-{v}.svg").write_text(svg(geo, "#ffffff", "#ffffff", CYAN))
    (HERE / "logo-A-dark.svg").write_text(svg(out["A"], "#0b0d10", "#0b0d10", "#0a9fb0"))
    (HERE / "logo-geometry.json").write_text(json.dumps(out))
    # same data as a script, so pages opened straight from disk can use it
    (HERE / "logo-geometry.js").write_text("window.EXPO_GEO = " + json.dumps(out) + ";\n")
    print("wrote logo-A.svg logo-B.svg logo-A-dark.svg logo-geometry.json", out["A"]["width"], out["A"]["height"], out["A"]["lens"])
