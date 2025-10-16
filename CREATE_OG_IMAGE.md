# How to Create Your Open Graph Image

## Quick Option: Use Canva (Free)

1. Go to https://www.canva.com/
2. Search for "Facebook Post" template (1200x630px)
3. Use this content:

### Text Elements:
- **Main Headline**: "Elevate for Humanity"
- **Subheadline**: "106+ Industry-Recognized Certifications"
- **Stats**: "92% Job Placement | 100% FREE"
- **Location**: "Indianapolis, IN"

### Design Tips:
- Use professional blue/white color scheme
- Add your logo (if you have one)
- Keep text large and readable
- Use high-contrast colors
- Save as JPG or PNG

4. Download as "og-image.jpg"
5. Upload to `/public/og-image.jpg`

## Alternative: Use This HTML Template

Save this as `og-image-generator.html` and open in browser, then screenshot:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .container {
            text-align: center;
            color: white;
            padding: 60px;
        }
        h1 {
            font-size: 72px;
            font-weight: 900;
            margin: 0 0 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        h2 {
            font-size: 42px;
            font-weight: 600;
            margin: 0 0 30px 0;
        }
        .stats {
            display: flex;
            gap: 40px;
            justify-content: center;
            margin-top: 40px;
        }
        .stat {
            background: rgba(255,255,255,0.2);
            padding: 20px 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .stat-number {
            font-size: 48px;
            font-weight: 900;
        }
        .stat-label {
            font-size: 20px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Elevate for Humanity</h1>
        <h2>106+ Industry-Recognized Certifications</h2>
        <div class="stats">
            <div class="stat">
                <div class="stat-number">92%</div>
                <div class="stat-label">Job Placement</div>
            </div>
            <div class="stat">
                <div class="stat-number">100%</div>
                <div class="stat-label">FREE</div>
            </div>
            <div class="stat">
                <div class="stat-number">1,247+</div>
                <div class="stat-label">Students</div>
            </div>
        </div>
    </div>
</body>
</html>
```

## Professional Option: Hire on Fiverr

Search for "social media graphics" - $5-20
Provide them with:
- Your logo
- Text: "Elevate for Humanity - 106+ Certifications"
- Stats: 92% placement, 100% FREE
- Size: 1200x630px

## After Creating:

1. Save as `og-image.jpg`
2. Place in `/public/og-image.jpg`
3. Rebuild and deploy
4. Test at: https://developers.facebook.com/tools/debug/

## Specifications:

- **Size**: 1200x630px (required)
- **Format**: JPG or PNG
- **File Size**: Under 1MB
- **Aspect Ratio**: 1.91:1
- **Text**: Large, readable, high contrast
- **Branding**: Include logo if available
