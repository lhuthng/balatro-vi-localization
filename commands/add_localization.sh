#!/usr/bin/env bash

set -euo pipefail

usage() {
    echo "Usage: $0 <path-to-game.lua>"
    exit 1
}

[[ $# -eq 1 ]] || usage

file="$1"
[[ -f "$file" ]] || {
    echo "File not found: $file" >&2
    exit 1
}

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

awk '
BEGIN {
    in_languages = 0
    in_fonts = 0
    has_vi = 0
    has_font = 0
    inserted_vi = 0
    inserted_font = 0

    vi_line = "        [\"vi\"] = {font = 10, label = \"Tiếng Việt\", key = \"vi\", button = \"Phản hồi ngôn ngữ\", warning = {\"Bản dịch này không phải chính thức.\",\"Phản hồi nếu dịch ngu ở https://github.com/lhuthng\"}},"
    font_line = "        {file = \"resources/fonts/m6x11plus_vi.ttf\", render_scale = self.TILESIZE*10, TEXT_HEIGHT_SCALE = 0.9, TEXT_OFFSET = {x=10,y=-20}, FONTSCALE = 0.1, squish = 1, DESCSCALE = 1},"
}

{
    line = $0

    if (line ~ /self\.LANGUAGES[[:space:]]*=[[:space:]]*{/) {
        in_languages = 1
    }
    if (line ~ /self\.FONTS[[:space:]]*=[[:space:]]*{/) {
        in_fonts = 1
    }

    if (in_languages && line ~ /\[["\047]vi["\047]\][[:space:]]*=/) {
        has_vi = 1
    }
    if (in_fonts && line ~ /resources\/fonts\/m6x11plus_vi\.ttf/) {
        has_font = 1
    }

    if (in_languages && !has_vi && line ~ /^[[:space:]]*}/) {
        print vi_line
        inserted_vi = 1
        in_languages = 0
    }
    if (in_fonts && !has_font && line ~ /^[[:space:]]*}/) {
        print font_line
        inserted_font = 1
        in_fonts = 0
    }

    print line

    if (in_languages && line ~ /^[[:space:]]*}/) {
        in_languages = 0
    }
    if (in_fonts && line ~ /^[[:space:]]*}/) {
        in_fonts = 0
    }
}
END {
    if (!has_vi && !inserted_vi) {
        print "Warning: could not find self.LANGUAGES block" > "/dev/stderr"
    }
    if (!has_font && !inserted_font) {
        print "Warning: could not find self.FONTS block" > "/dev/stderr"
    }
}
' "$file" > "$tmp_file"

mv "$tmp_file" "$file"
trap - EXIT

echo "Localization/font entries ensured in: $file"