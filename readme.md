# Vietnamese Localization for Balatro

![Demo](images/demo.png)

![Progress](https://img.shields.io/badge/progress-80%25-blue)

Unofficial Vietnamese localization for [Balatro](https://www.playbalatro.com/), including:
1. Vietnamese font support.
2. Vietnamese localization file.
3. Helper scripts to patch and repack game files.
4. A browser-based translation editor.

Tiếng Việt: xem hướng dẫn bản Việt tại [readme-vi.md](readme-vi.md).

## Repository Layout
1. `current/vi.lua`: localization used for copy/deploy.
2. `fonts/m6x11plus_vi.ttf`: font with Vietnamese glyph support.
3. `commands/`: automation scripts for extraction, patch, and rebuild.
4. `tools/`: JSON/Lua conversion and web editor.

## Requirements
1. Balatro installed locally.
2. `zip` and `unzip` available in terminal.
3. Windows users: `7-Zip` (recommended for opening archives).

## Locate Balatro Resources
1. macOS:
   - Open Balatro app package.
   - Go to `Contents/Resources/`.
   - You should see `Balatro.love`.
2. Windows:
   - Find `Balatro.exe`.
   - Open with 7-Zip.
3. Linux:
   - Similar flow: locate game install and access `Balatro.love`.

## Fast Workflow (Recommended)
From the repository root:

```bash
cd commands
./shortcut.sh -z -f -l -b
```

This does all steps in order:
1. Extract `Balatro.love` into `Resources/Balatro`.
2. Copy Vietnamese font.
3. Copy localization (`current/vi.lua`).
4. Patch `game.lua` (`self.LANGUAGES` and `self.FONTS`) if needed.
5. Rebuild `Balatro.love`.

### Script Options
```bash
./shortcut.sh [-z] [-f] [-l] [-b] [-p <resources_path>]
```

1. `-z`: force re-extract from `Balatro.love`.
2. `-f`: copy Vietnamese font.
3. `-l`: copy localization file.
4. `-b`: patch `game.lua` + rebuild `Balatro.love`.
5. `-p`: custom path to Balatro `Resources` directory.

Example with custom path:

```bash
./shortcut.sh -p "/path/to/Balatro.app/Contents/Resources" -z -f -l -b
```

## Manual Workflow
If you do not want automation scripts:
1. Put `fonts/m6x11plus_vi.ttf` into `resources/fonts/`.
2. Put `current/vi.lua` into `localization/vi.lua`.
3. Update `game.lua`:
   - Add `vi` entry in `self.LANGUAGES`.
   - Add `m6x11plus_vi.ttf` entry in `self.FONTS`.
4. Repack game source into `Balatro.love`.

## Web Translation Tool
`tools/index.html` provides a visual JSON editor.

### Run
1. Open `tools/index.html` in a browser.
2. Load a localization JSON file.
3. Edit, find/replace, and export JSON or Lua.

### Lua to JSON Conversion
From `tools/`:

```bash
lua lua_to_json.lua ../lang.lua output.json
```

If arguments are omitted, it defaults to:
1. Input: `../lang.lua`
2. Output: `output.json`

## Notes
1. This project is unofficial and community-maintained.
2. Keep backups of original game files before patching.
