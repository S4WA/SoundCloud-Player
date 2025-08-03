#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(dirname "$0")"
FOLDER_PATH="$SCRIPT_DIR/src"
OUTPUT_NAME="$SCRIPT_DIR/src.zip"

# Check if folder exists
if [ ! -d "$FOLDER_PATH" ]; then
    echo "Error: Directory 'src' does not exist."
    osascript -e 'tell app "System Events" to display dialog "Error: Directory \"src\" does not exist." buttons {"OK"} default button "OK"'
    exit 1
fi

# Change to src directory and compress its contents without nesting
cd "$FOLDER_PATH" || exit 1
zip -r "$OUTPUT_NAME" . -x "*.DS_Store" "manifest-firefox.json"

if [ $? -eq 0 ]; then
    echo "Successfully created $OUTPUT_NAME"
    osascript -e 'tell app "System Events" to display dialog "Successfully created src.zip" buttons {"OK"} default button "OK"'
else
    echo "Error: Failed to create zip file"
    osascript -e 'tell app "System Events" to display dialog "Error: Failed to create zip file" buttons {"OK"} default button "OK"'
    exit 1
fi