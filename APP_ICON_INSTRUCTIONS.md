# L3EP App Icon Instructions

## Design Specifications

### Colors

- **Background**: Michigan Blue `#00274C`
- **Text**: Michigan Maize `#FFCB05`

### Design

- Square background with rounded corners (20% radius)
- Text: "L3EP" in bold, centered
- Font: Heavy/Black weight (900) for maximum impact
- Letter spacing: Tight (-2 to -3 units)

### Required Sizes

#### iOS Icons (Create 1024x1024 master, then scale down)

- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 87x87 (iPhone Settings @3x)
- 60x60 (iPhone Notification @3x)
- 40x40 (iPhone Spotlight @2x)
- And other required sizes...

#### Android Icons (Create 512x512 master, then scale down)

- 512x512 (Google Play Store)
- 192x192 (xxxhdpi launcher)
- 144x144 (xxhdpi launcher)
- 96x96 (xhdpi launcher)
- 72x72 (hdpi launcher)
- 48x48 (mdpi launcher)

### Icon Generation Tools

1. **Figma/Sketch/Adobe XD**

   - Create the master design at 1024x1024
   - Export at all required sizes

2. **Online Icon Generators**

   - [App Icon Generator](https://www.appicon.co/)
   - [Icon Kitchen](https://icon.kitchen/)
   - [MakeAppIcon](https://makeappicon.com/)

3. **Command Line (ImageMagick)**

   ```bash
   # Create rounded corners
   convert -size 1024x1024 xc:#00274C -draw "roundrectangle 0,0,1024,1024,205,205" base.png

   # Add text
   convert base.png -font Arial-Black -pointsize 400 -fill '#FFCB05' -gravity center -annotate +0+0 'L3EP' icon-1024.png

   # Resize for different sizes
   convert icon-1024.png -resize 180x180 icon-180.png
   ```

### File Placement

#### iOS

Place icons in: `ios/NDTExamPrep/Images.xcassets/AppIcon.appiconset/`
Update `Contents.json` with the correct filenames.

#### Android

Place icons in respective folders:

- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

Also create round versions with filename `ic_launcher_round.png` in each folder.

### Preview Component

A preview component has been created at `src/utils/generateIcon.tsx` that shows what the icon should look like in React Native.
