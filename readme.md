# Vietnamese Localization for Balatro

![Progress](https://img.shields.io/badge/progress-60%25-blue)

This guide explains how to add Vietnamese language to the **[Balatro](https://www.playbalatro.com/)** *inofficially*

<!-- ## Requirements
**Balatro** is built on **LÖVE** using **Lua** language. To modify the game, you need to install the following:
- **Lua**: Install Lua from [Lua.org](https://www.lua.org/download.html)
- **LÖVE**: Install LÖVE from [love2d.org](https://love2d.org/) -->

## Decompiling Balatro
Reverse-engineering a **LÖVE** project is simple. The executables are essentially an archive containing the game files.
- **MacOS**: 
  - Locate the executable file
  - Right-click on it
  - Select **Show Package Contents**
  - Navigate to `Contents/Resources/`
- **Windows**: 
  - Locate the executable *.exe* file, 
  - Right-click on it
  - Select **WinRAR>Extract to "Balatro\\"**.
  - Open the newly created folder **Balatro**
- **Linux**: \<Soon to be updated\>

## Adding Vietnamese

### Adding Font
While I love the font used in the game, it does not support Vietnamese characters. I have added Vietnamese characters as a new font file.

The extended font can be found [here](./fonts/m6x11plus_vi.ttf). Download and place it in **/resources/fonts/**.

### Adding Localization

The localization file can be found [here](./current/vi.lua). Download and place it in **/localization/**.

To use the extended font and the vietnamese localization, update the script `game.lua` as following:
- Search for the `self.LANGUAGES` declaration (arround line 942).
- Append the following line to the end of the table (around line 959):
    ```lua
    ['vi'] = {font = 10, label = "Tiếng Việt", key = 'vi', button = "Phản hồi ngôn ngữ", warning = {'This language is still in Beta. To help us','improve it, please click on the feedback button.', 'Click again to confirm'}},
- Search for the `self.FONTS` declaration (arround line 969).
- Append the following line to the end of the table (around line 978):
    ```lua
    {file = "resources/fonts/m6x11plus_vi.ttf", render_scale = self.TILESIZE*10, TEXT_HEIGHT_SCALE = 0.9, TEXT_OFFSET = {x=10,y=-20}, FONTSCALE = 0.1, squish = 1, DESCSCALE = 1},
