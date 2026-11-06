"""Probe video format, framerate, and verify technical requirements."""
import argparse
import subprocess
import json
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Verify video file")
    parser.add_argument("video", type=Path, help="Input video file")
    args = parser.parse_args()

    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ffmpeg = "ffmpeg"

    cmd = [ffmpeg, "-i", str(args.video)]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    print("Video Info:\n", res.stderr)

if __name__ == "__main__":
    main()

