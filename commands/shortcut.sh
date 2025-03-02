#!/bin/bash

OS=$(uname)

# Initialize variables
b_option=false
f_option=false
l_option=false
p_option=""
z_option=false

DEFAULT_PATH_MAC="/Users/$(whoami)/Library/Application Support/Steam/steamapps/common/Balatro/Balatro.app/Contents/Resources"

# Function to show usage
usage() {
    echo "Usage: $0 [-b] [-f] [-v] [-p <path>]"
    echo "  -b    Optional build command"
    echo "  -f    Copy Font (no value required)"
    echo "  -l    Copy Localization (no value required)"
    echo "  -p    Optional path"
    echo "  -z    Unzip"
    exit 1
}

# Parse command-line arguments
while getopts ":bflzp:" opt; do
    case ${opt} in
        b)
            b_option=true
            ;;
        f)
            f_option=true
            ;;
        l)
            l_option=true
            ;;
        p)
            # Validate the path
            if [[ -d "${OPTARG}" || -f "${OPTARG}" ]]; then
                p_option=${OPTARG}
            else
                echo "Error: Path '${OPTARG}' does not exist."
                usage
            fi
            ;;
        z)
            z_option=true
            ;;
        \?)
            echo "Error: Invalid option '-${OPTARG}'"
            usage
            ;;
        :)
            echo "Error: Option '-${OPTARG}' requires a value."
            usage
            ;;
    esac
done

# Set default path -p is not provided
if [[ -z "$p_option" ]]; then
    # Check the OS
    if [[ "$OS" == "Linux" ]]; then
        echo "This is a Linux system. Not implemented yet"
        exit
    elif [[ "$OS" == "Darwin" ]]; then
        p_option=$DEFAULT_PATH_MAC
    elif [[ "$OS" == "CYGWIN"* || "$OS" == "MINGW"* ]]; then
        echo "This is a Windows system. Not implemented yet"
        exit
    else
        echo "Unknown operating system: $OS"
        exit
    fi
fi

if [[ "$z_option" == "true" ]]; then
    echo "Remove Balatro"
    rm -r -f "$p_option/Balatro"
fi

# Check if the folder exists
if [[ "$z_option" == "true" || ("$OS" == "Darwin" && ! -d "$p_option/Balatro") ]]; then
    echo "Unzip Balatro.love"
    unzip -q "$p_option/Balatro.love" -d "$p_option/Balatro"
fi

# Replace the font
if [[ "$f_option" == true ]]; then
    echo "Copy the font"
    cp ../fonts/m6x11plus_vi.ttf "$p_option/Balatro/resources/fonts/"
fi

# Replace the localization
if [[ "$l_option" == true ]]; then
    echo "Update current"
    mv ../lang*lua ../current/vi.lua
    mv ../lang*json ../current/vi.json
    echo "Copy the localization"
    cp ../current/vi.lua "$p_option/Balatro/localization/vi.lua"
fi

if [[ "$b_option" == true && "$OS" == "Darwin" ]]; then
    echo "Add localization"
    ./add_localization.sh "$p_option/Balatro/game.lua"
    echo "Zip Balatro.love"
    cd "$p_option/Balatro"
    zip -r -9 -q "Balatro.love" .
    echo "Replace old Balatro.love"
    mv "Balatro.love" "../Balatro.love"
    cd -
fi