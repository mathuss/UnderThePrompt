#!/usr/bin/env bash
# Final mix + mux for any episode.
#   tools/mix.sh <video_raw.mp4> <voice.wav> <music.wav> <sfx.wav> <out.mp4>
# Voice stays in front; the music bed is ducked under the voice (sidechain) and the
# whole mix is loudness-normalized to -14 LUFS / -1.5 dBTP (matches the reference videos).
set -euo pipefail
FF="$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe"
VIDEO=$1 VOICE=$2 MUSIC=$3 SFX=$4 OUT=$5
"$FF" -y -loglevel error -i "$VIDEO" -i "$VOICE" -i "$MUSIC" -i "$SFX" -filter_complex "\
[1:a]aresample=48000,aformat=channel_layouts=mono,asplit=2[v][key];\
[2:a]aformat=channel_layouts=mono[m0];\
[m0][key]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=450:makeup=1[m];\
[3:a]aformat=channel_layouts=mono,volume=0.9[s];\
[v][m][s]amix=inputs=3:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -shortest "$OUT"
echo "mixed -> $OUT"
