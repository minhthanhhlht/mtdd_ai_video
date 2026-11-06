"""Extract frames and generate contact sheet for review."""
import argparse
import subprocess
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Generate contact sheet from video")
    parser.add_argument("video", type=Path, help="Input video file")
    parser.add_argument("--out", type=Path, default=Path("contact_sheet.jpg"), help="Output image file")
    args = parser.parse_args()

    print(f"Generating contact sheet for {args.video} -> {args.out}")
    # Note: Requires ffmpeg or imageio-ffmpeg
    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ffmpeg = "ffmpeg"

    cmd = [
        ffmpeg, "-y", "-i", str(args.video),
        "-vf", "select='not(mod(n\\,30))',scale=270:480,tile=4x4",
        "-frames:v", "1", "-q:v", "3", str(args.out)
    ]
    subprocess.run(cmd, check=True)
    print("Done!")

if __name__ == "__main__":
    main()

