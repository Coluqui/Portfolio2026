"""Genera los woff2 con subset latino desde el zip de design-system.

Uso: npm run fonts  (requiere Python 3 con fonttools y brotli)
Salida: design-system/fonts/*.woff2 (fuente de verdad) y public/fonts/ (servidas).
También imprime las métricas de fallback (size-adjust, ascent/descent-override)
contra Arial (sans) y Courier New (mono) para pegar en src/styles/fonts.css.
"""

import io
import shutil
import zipfile
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
ZIP = ROOT / "design-system" / "Geist_Mono,Instrument_Sans.zip"
OUT = ROOT / "design-system" / "fonts"
PUBLIC = ROOT / "public" / "fonts"
ARIAL = Path("C:/Windows/Fonts/arial.ttf")
COURIER = Path("C:/Windows/Fonts/cour.ttf")

FONTS = {
    "Instrument_Sans/static/InstrumentSans-Regular.ttf": "instrument-sans-400.woff2",
    "Instrument_Sans/static/InstrumentSans-SemiBold.ttf": "instrument-sans-600.woff2",
    "Geist_Mono/static/GeistMono-Regular.ttf": "geist-mono-400.woff2",
    "Geist_Mono/static/GeistMono-Medium.ttf": "geist-mono-500.woff2",
}

# Latín básico + Latin-1 + puntuación general + símbolos que usa la interfaz
# (← → ↓ ↗ ✓ × ◐ ⧉ ‖ ▶ ☰ € ™).
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,"
    "U+2016,U+25B6,U+25D0,U+2630,U+2713,U+29C9"
)


SAMPLE = (
    "Diseñador gráfico y digital. Piezas de redes, ads, mails y webs que comunican "
    "claro y rinden. Graphic and digital designer 0123456789"
)


def metrics(font: TTFont) -> tuple[int, int, int, int, float]:
    """unitsPerEm, ascender, descender, lineGap y ancho medio del texto de muestra (en em)."""
    upm = font["head"].unitsPerEm
    hhea = font["hhea"]
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    widths = [hmtx[cmap[ord(ch)]][0] for ch in SAMPLE if ord(ch) in cmap]
    return upm, hhea.ascent, hhea.descent, hhea.lineGap, sum(widths) / len(widths) / upm


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    arial = TTFont(ARIAL) if ARIAL.exists() else None
    courier = TTFont(COURIER) if COURIER.exists() else None

    with zipfile.ZipFile(ZIP) as zf:
        for src, name in FONTS.items():
            data = zf.read(src)
            font = TTFont(io.BytesIO(data))
            opts = subset.Options()
            opts.flavor = "woff2"
            opts.layout_features = ["*"]
            opts.name_IDs = ["*"]
            opts.notdef_outline = True
            sub = subset.Subsetter(opts)
            sub.populate(unicodes=subset.parse_unicodes(UNICODES))
            sub.subset(font)
            dest = OUT / name
            font.flavor = "woff2"
            font.save(dest)
            shutil.copy2(dest, PUBLIC / name)

            full = TTFont(io.BytesIO(data))
            upm, asc, desc, gap, avg = metrics(full)
            line = f"{name}: {dest.stat().st_size / 1024:.1f} KB"
            fallback = courier if name.startswith("geist") else arial
            if fallback is not None:
                *_rest, f_avg = metrics(fallback)
                adjust = avg / f_avg
                line += (
                    f" | size-adjust: {adjust * 100:.2f}%"
                    f" ascent-override: {asc / upm / adjust * 100:.2f}%"
                    f" descent-override: {abs(desc) / upm / adjust * 100:.2f}%"
                    f" line-gap-override: {gap / upm / adjust * 100:.2f}%"
                )
            print(line)


if __name__ == "__main__":
    main()
