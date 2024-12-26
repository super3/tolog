#!/bin/bash

# Create iconset directory
mkdir public/icon.iconset

# Generate different icon sizes
sips -z 16 16     public/icon.png --out public/icon.iconset/icon_16x16.png
sips -z 32 32     public/icon.png --out public/icon.iconset/icon_16x16@2x.png
sips -z 32 32     public/icon.png --out public/icon.iconset/icon_32x32.png
sips -z 64 64     public/icon.png --out public/icon.iconset/icon_32x32@2x.png
sips -z 128 128   public/icon.png --out public/icon.iconset/icon_128x128.png
sips -z 256 256   public/icon.png --out public/icon.iconset/icon_128x128@2x.png
sips -z 256 256   public/icon.png --out public/icon.iconset/icon_256x256.png
sips -z 512 512   public/icon.png --out public/icon.iconset/icon_256x256@2x.png
sips -z 512 512   public/icon.png --out public/icon.iconset/icon_512x512.png
sips -z 1024 1024 public/icon.png --out public/icon.iconset/icon_512x512@2x.png

# Convert iconset to icns
iconutil -c icns public/icon.iconset

# Clean up
rm -R public/icon.iconset 