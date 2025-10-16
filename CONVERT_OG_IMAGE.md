# Convert OG Image SVG to JPG

## Quick Option: Online Converter

1. Go to https://cloudconvert.com/svg-to-jpg
2. Upload `public/og-image.svg`
3. Set quality to 90%
4. Download as `og-image.jpg`
5. Place in `public/og-image.jpg`

## Alternative: Use ImageMagick (if installed)

```bash
convert public/og-image.svg -quality 90 public/og-image.jpg
```

## Alternative: Use Node.js

```bash
npm install sharp
node -e "const sharp = require('sharp'); sharp('public/og-image.svg').jpeg({quality: 90}).toFile('public/og-image.jpg');"
```

## For Now: SVG Works!

The SVG file will work for now. Most social media platforms support SVG.
Just update the meta tags to point to `.svg` instead of `.jpg`:

```html
<meta property="og:image" content="https://elevateforhumanity.pages.dev/og-image.svg" />
```

## Better Option: Use Canva

For a more professional look:
1. Go to https://www.canva.com/
2. Create 1200x630px design
3. Use the template in CREATE_OG_IMAGE.md
4. Download as JPG
5. Replace `public/og-image.jpg`
