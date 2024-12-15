#!/bin/bash

file="$1"

# Ensure the file exists
if [ ! -f "$file" ]; then
    echo "File not found: $file"
    exit 1
fi

indent="    "
languages="self.LANGUAGES = {"
fonts="self.FONTS = {"
vi="['vi'] = {font = 10, label = 'Tiếng Việt', key = 'vi', beta = true, button = 'Phản hồi ngôn ngữ', warning = {'This language is still in Beta. To help us','improve it, please click on the feedback button.', 'Click again to confirm'}},"
font="{file = 'resources/fonts/m6x11plus_vi.ttf', render_scale = self.TILESIZE*10, TEXT_HEIGHT_SCALE = 0.9, TEXT_OFFSET = {x=10,y=-20}, FONTSCALE = 0.1, squish = 1, DESCSCALE = 1},"

found_languages=false
skip_language=false
found_fonts=false
skip_font=false

output="output"
> $output

while IFS= read -r line; do
    if [[ $skip_language == true && $skip_font == true ]]; then
        echo "$line" >> $output
    elif [[ $skip_language == false && $found_languages == true ]]; then
        if [[ $line =~ ^[[:space:]]*\[\'vi\'\] ]]; then
            skip_language=true
        elif [[ $line == "$indent$indent}" ]]; then
            echo "$indent$indent$indent$vi" >> $output
            skip_language=true
        fi
        echo "$line" >> $output
    elif [[ $skip_font == false && $found_fonts == true ]]; then
        if [[ $line =~ "resources/fonts/m6x11plus_vi.ttf" ]]; then
            skip_font=true
        elif [[ $line == "$indent$indent}" ]]; then
            echo "$indent$indent$indent$font" >> $output
            skip_font=true
        fi
        echo "$line" >> $output
    else
        if [[ $line == "$indent$indent$languages" ]]; then
            found_languages=true
        elif [[ $line == "$indent$indent$fonts" ]]; then
            found_fonts=true
        fi
        echo "$line" >> $output
    fi
done < "$file"

mv "$output" "$file"