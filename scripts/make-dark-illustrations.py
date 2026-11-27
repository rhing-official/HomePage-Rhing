#!/usr/bin/env python3
"""public/illustrations/*.svg から、ダークモード用の public/illustrations/dark/*.svg を作る。

白や薄い灰色の面は、暗い面に反転し、暗い線や服は、明るく反転する。肌・髪の桃色や茶色のような、彩度の有る色は、そのまま残す。
使い方: python3 scripts/make-dark-illustrations.py
"""
import colorsys
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent / "public" / "illustrations"
OUT = ROOT / "dark"

HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
NAMED = {"white": "#ffffff", "black": "#000000"}


def expand(h: str) -> tuple[int, int, int]:
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def convert(h: str) -> str:
    r, g, b = expand(h)
    hue, lig, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    deg = hue * 360
    neutral = sat < 0.10 or 200 <= deg <= 290 or lig > 0.97 or lig < 0.03
    if not neutral:
        return f"#{h}" if not h.startswith("#") else h
    if lig >= 0.55:
        new = 0.11 + (1 - lig) * 0.5  # 白は、暗い面（約11%）に。薄い灰色ほど、少し明るい
    else:
        new = 0.82 - lig * 0.7  # 暗い線や服は、明るく
    nr, ng, nb = colorsys.hls_to_rgb(hue, new, min(sat, 0.2))
    return "#{:02x}{:02x}{:02x}".format(round(nr * 255), round(ng * 255), round(nb * 255))


def transform(svg: str) -> str:
    svg = re.sub(r'(fill|stroke)="(white|black)"', lambda m: f'{m.group(1)}="{convert(NAMED[m.group(2)][1:])}"', svg)
    return HEX.sub(lambda m: convert(m.group(1)), svg)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for src in sorted(ROOT.glob("*.svg")):
        (OUT / src.name).write_text(transform(src.read_text(encoding="utf-8")), encoding="utf-8")
        print("作成:", OUT / src.name)


if __name__ == "__main__":
    main()
