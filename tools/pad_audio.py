#!/usr/bin/env python3
"""
Add trailing silence to clips that were generated before the padding fix.

AAC encodes in fixed-size frames. A clip that ends mid-frame has its tail
dropped by many Android decoders, which lands on the final consonant of a
word -- "biyar" heard as "biya". Padding pushes the speech clear of the
frame boundary.

This only re-encodes existing files, so it needs ffmpeg but no GPU and no
model. It takes a couple of minutes for the whole library.

    python tools/pad_audio.py

Safe to run twice; already-padded clips are skipped.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

DIR = Path("assets/audio/ha")
PAD = 0.35
MARKER = DIR / ".padded"


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0


def main() -> None:
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required. On Colab: !apt-get install -y ffmpeg")
    if not DIR.exists():
        sys.exit(f"{DIR} not found -- run this from the project root.")

    done = set()
    if MARKER.exists():
        done = set(MARKER.read_text().split())

    clips = sorted(DIR.glob("*.m4a"))
    todo = [c for c in clips if c.stem not in done]
    print(f"{len(todo)} of {len(clips)} clips to pad")

    padded = []
    for i, clip in enumerate(todo, 1):
        tmp = clip.with_suffix(".tmp.m4a")
        before = duration(clip)
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(clip),
                 "-filter:a", f"apad=pad_dur={PAD}",
                 "-c:a", "aac", "-b:a", "48k", "-ac", "1", "-ar", "24000",
                 str(tmp)],
                check=True,
            )
            tmp.replace(clip)
            padded.append(clip.stem)
        except subprocess.CalledProcessError:
            tmp.unlink(missing_ok=True)
            print(f"  failed: {clip.name}")
            continue
        if i % 50 == 0 or i == len(todo):
            print(f"  {i}/{len(todo)}  (last clip {before:.2f}s -> {before + PAD:.2f}s)")

    MARKER.write_text("\n".join(sorted(done | set(padded))))
    print(f"\nPadded {len(padded)} clips by {PAD}s.")
    print("Nothing else to do -- the filenames are unchanged, so the app picks them up as they are.")


if __name__ == "__main__":
    main()
