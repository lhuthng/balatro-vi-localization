#!/usr/bin/env bash

set -euo pipefail

OS="$(uname)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

b_option=false
f_option=false
l_option=false
p_option=""
z_option=false

DEFAULT_PATH_MAC="/Users/$(whoami)/Library/Application Support/Steam/steamapps/common/Balatro/Balatro.app/Contents/Resources"

usage() {
    cat <<'EOF'
Usage: shortcut.sh [-z] [-f] [-l] [-b] [-p <resources_path>]

Options:
  -z    Re-extract Balatro.love into <resources>/Balatro
  -f    Copy Vietnamese font into extracted resources
  -l    Copy current/vi.lua into extracted localization
  -b    Ensure vi entries in game.lua and rebuild Balatro.love
  -p    Balatro Resources path (default: macOS Steam path)

Examples:
  ./shortcut.sh -z -f -l -b
  ./shortcut.sh -p "/path/to/Balatro.app/Contents/Resources" -f -l
EOF
    exit 1
}

log() {
    echo "[shortcut] $*"
}

while getopts ":bflzp:h" opt; do
    case "${opt}" in
        b) b_option=true ;;
        f) f_option=true ;;
        l) l_option=true ;;
        z) z_option=true ;;
        p) p_option="${OPTARG}" ;;
        h) usage ;;
        \?)
            echo "Invalid option: -${OPTARG}" >&2
            usage
            ;;
        :)
            echo "Option -${OPTARG} requires a value" >&2
            usage
            ;;
    esac
done

if [[ -z "$p_option" ]]; then
    if [[ "$OS" == "Darwin" ]]; then
        p_option="$DEFAULT_PATH_MAC"
    else
        echo "Please provide -p on this OS ($OS)." >&2
        exit 1
    fi
fi

[[ -d "$p_option" ]] || {
    echo "Resources path not found: $p_option" >&2
    exit 1
}

love_file="$p_option/Balatro.love"
extract_dir="$p_option/Balatro"
game_lua="$extract_dir/game.lua"
target_font_dir="$extract_dir/resources/fonts"
target_loc_dir="$extract_dir/localization"

if [[ "$z_option" == true ]]; then
    [[ -f "$love_file" ]] || {
        echo "Missing file: $love_file" >&2
        exit 1
    }
    log "Re-extracting Balatro.love"
    rm -rf "$extract_dir"
fi

if [[ ! -d "$extract_dir" ]]; then
    [[ -f "$love_file" ]] || {
        echo "Missing file: $love_file" >&2
        exit 1
    }
    log "Extracting Balatro.love"
    unzip -q "$love_file" -d "$extract_dir"
fi

if [[ "$f_option" == true ]]; then
    src_font="$REPO_ROOT/fonts/m6x11plus_vi.ttf"
    [[ -f "$src_font" ]] || {
        echo "Missing font: $src_font" >&2
        exit 1
    }
    mkdir -p "$target_font_dir"
    cp "$src_font" "$target_font_dir/m6x11plus_vi.ttf"
    log "Font copied"
fi

if [[ "$l_option" == true ]]; then
    if [[ -f "$REPO_ROOT/lang.lua" ]]; then
        cp "$REPO_ROOT/lang.lua" "$REPO_ROOT/current/vi.lua"
        log "Synced lang.lua -> current/vi.lua"
    fi
    if [[ -f "$REPO_ROOT/lang.json" ]]; then
        cp "$REPO_ROOT/lang.json" "$REPO_ROOT/current/vi.json"
        log "Synced lang.json -> current/vi.json"
    fi

    [[ -f "$REPO_ROOT/current/vi.lua" ]] || {
        echo "Missing localization source: $REPO_ROOT/current/vi.lua" >&2
        exit 1
    }
    mkdir -p "$target_loc_dir"
    cp "$REPO_ROOT/current/vi.lua" "$target_loc_dir/vi.lua"
    log "Localization copied"
fi

if [[ "$b_option" == true ]]; then
    [[ -f "$game_lua" ]] || {
        echo "Missing game.lua: $game_lua" >&2
        exit 1
    }

    log "Ensuring vi language/font entries in game.lua"
    "$SCRIPT_DIR/add_localization.sh" "$game_lua"

    log "Rebuilding Balatro.love"
    tmp_love="$p_option/Balatro.love.tmp"
    (
        cd "$extract_dir"
        rm -f "$tmp_love"
        zip -r -9 -q "$tmp_love" .
    )
    mv "$tmp_love" "$love_file"
    log "Balatro.love updated"
fi

if [[ "$z_option" == false && "$f_option" == false && "$l_option" == false && "$b_option" == false ]]; then
    usage
fi