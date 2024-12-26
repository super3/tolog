#!/bin/bash

# Create directories if they don't exist
mkdir -p src/assets/icons/{png,icns,ico}
mkdir -p src/assets/icons/icns/icon.iconset

# Generate PNG from SVG
convert -background none src/assets/icons/source/journal-icon.svg src/assets/icons/png/icon.png

# Generate different sizes for ICNS
sips -z 16 16     src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_16x16.png
sips -z 32 32     src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_16x16@2x.png
sips -z 32 32     src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_32x32.png
sips -z 64 64     src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_32x32@2x.png
sips -z 128 128   src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_128x128.png
sips -z 256 256   src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_128x128@2x.png
sips -z 256 256   src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_256x256.png
sips -z 512 512   src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_256x256@2x.png
sips -z 512 512   src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_512x512.png
sips -z 1024 1024 src/assets/icons/png/icon.png --out src/assets/icons/icns/icon.iconset/icon_512x512@2x.png

# Create ICNS file
iconutil -c icns src/assets/icons/icns/icon.iconset -o src/assets/icons/icns/icon.icns

# Generate ICO for Windows
convert src/assets/icons/png/icon.png src/assets/icons/ico/icon.ico

# Clean up iconset directory
rm -rf src/assets/icons/icns/icon.iconset 