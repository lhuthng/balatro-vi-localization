# Vietnamese Localization for Balatro

![Progress](https://img.shields.io/badge/progress-60%25-blue)

This guide explains how to add Vietnamese language to the **[Balatro](https://www.playbalatro.com/)** *unofficially*
Hướng dẫn này chỉ cách thêm ngôn ngữ Tiếng Việt vào trò chơi **[Balatro](https://www.playbalatro.com/)** *mình tự dịch :v*
(Bên dưới soạn bằng tiếng anh, bản tiếng việt có thể xem ở [đây](README-vi.md))

## Requirements
**Balatro** is built on **LÖVE** using **Lua** language. To modify the game, you need to install the following:
- ~~**Lua**~~
- ~~**LÖVE**~~
- **7-Zip**: (Windows only, **WinRAR** doesn't work) for openning **LÖVE** executables
## Finding Balatro Source Codes
Reverse-engineering a **LÖVE** project is simple. The executables are essentially an archive containing the game files.
- **MacOS**: 
  - Locate the executable file
  - Right-click on it
  - Select **Show Package Contents**
  - Navigate to `Contents/Resources/`
  - Right-click on `Balatro.love`
  - Select **Open With>Archive Utility** to extract it
  - Open the **Balatro** folder
- **Windows**: 
  - Locate the executable *.exe* file
  - Right-click on `Balatro.exe`
  - (Optional) Select **Show more options**
  - Select **7-Zip>Open archive**
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
    ```
    It should be like this after appended
    ```lua
        ['all2'] = {font = 9, label = "English", key = 'all', omit = true},
        ['vi'] = {font = 10, label = "Tiếng Việt", key = 'vi', button = "Phản hồi ngôn ngữ", warning = {'This language is still in Beta. To help us','improve it, please click on the feedback button.', 'Click again to confirm'}},
    }
    ```
- Search for the `self.FONTS` declaration (arround line 969).
- Append the following line to the end of the table (around line 978):
    ```lua
    {file = "resources/fonts/m6x11plus_vi.ttf", render_scale = self.TILESIZE*10, TEXT_HEIGHT_SCALE = 0.9, TEXT_OFFSET = {x=10,y=-20}, FONTSCALE = 0.1, squish = 1, DESCSCALE = 1},
    ```
    It should be like this after appended
    ```lua
        {file = "resources/fonts/GoNotoCJKCore.ttf", render_scale = self.TILESIZE*10, TEXT_HEIGHT_SCALE = 0.8, TEXT_OFFSET = {x=10,y=-20}, FONTSCALE = 0.1, squish = 1, DESCSCALE = 1},
        {file = "resources/fonts/m6x11plus_vi.ttf", render_scale = self.TILESIZE*10, TEXT_HEIGHT_SCALE = 0.9, TEXT_OFFSET = {x=10,y=-20}, FONTSCALE = 0.1, squish = 1, DESCSCALE = 1},
    }
    ```
- Save the script
- *Windows user needs to update the modification in the archive (just hit Yes when asked)*

- *MacOS user needs to update the `Balatro.love` as well as follow*
  - Go back to the Resource folder (where Balatro folder is located)
  - Right-click on `Balatro` folder
  - Select `New Terminal at Folder`
  - execute this command: 
      ```bash
      zip -r9 ../Balatro.love .

## That's all