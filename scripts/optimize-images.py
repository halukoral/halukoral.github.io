"""Generate responsive WebP derivatives and an image metadata manifest.

Run this script after adding or replacing files under assets/img. The regular
Node build consumes the committed manifest and falls back to original images if
an entry is missing.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
IMAGE_ROOT = ROOT / "assets" / "img"
OUTPUT_ROOT = IMAGE_ROOT / "optimized"
MANIFEST_PATH = IMAGE_ROOT / "image-manifest.json"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
TARGET_WIDTHS = (640, 1280)


def output_path(source: Path, width: int) -> Path:
    relative = source.relative_to(IMAGE_ROOT)
    return OUTPUT_ROOT / relative.parent / f"{relative.name}.{width}.webp"


def optimize_image(source: Path) -> tuple[str, dict[str, object]]:
    relative = source.relative_to(IMAGE_ROOT).as_posix()

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        width, height = image.size
        variants: list[dict[str, object]] = []

        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")

        for target_width in TARGET_WIDTHS:
            variant_width = min(target_width, width)
            if variants and variants[-1]["width"] == variant_width:
                continue

            variant_height = round(height * variant_width / width)
            target = output_path(source, target_width)
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
                resized = image if variant_width == width else image.resize(
                    (variant_width, variant_height), Image.Resampling.LANCZOS
                )
                resized.save(target, "WEBP", quality=84, method=6)

            variants.append(
                {
                    "src": f"/assets/img/{target.relative_to(IMAGE_ROOT).as_posix()}",
                    "width": variant_width,
                    "height": variant_height,
                }
            )

        return f"/assets/img/{relative}", {
            "width": width,
            "height": height,
            "variants": variants,
        }


def main() -> None:
    sources = sorted(
        path
        for path in IMAGE_ROOT.rglob("*")
        if path.is_file()
        and OUTPUT_ROOT not in path.parents
        and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    manifest = dict(optimize_image(source) for source in sources)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    original_bytes = sum(source.stat().st_size for source in sources)
    optimized_files = list(OUTPUT_ROOT.rglob("*.webp"))
    optimized_bytes = sum(target.stat().st_size for target in optimized_files)
    print(
        f"Optimized {len(sources)} images into {len(optimized_files)} WebP files "
        f"({original_bytes / 1024 / 1024:.1f} MB -> {optimized_bytes / 1024 / 1024:.1f} MB)."
    )


if __name__ == "__main__":
    main()
