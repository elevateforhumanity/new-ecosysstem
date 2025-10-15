# Elevate for Humanity - Automated Reels Generator

Generate professional vertical reels (1080x1920) with animated text, branding, QR codes, and music for Instagram, TikTok, YouTube Shorts, and Facebook.

## 🎯 Features

- **Vertical 9:16 Format** - Perfect for Instagram Reels, TikTok, YouTube Shorts
- **Animated Text** - Hook, bullets, and CTA with smooth animations
- **Brand Overlay** - Gradient overlay in your brand colors
- **QR Codes** - Automatic QR code generation linking to your site
- **Logo Badge** - Optional logo in corner
- **Background Music** - Auto-loop and volume control
- **Thumbnails** - Auto-generate thumbnails for each reel
- **Captions** - Auto-generate captions with hashtags
- **Batch Processing** - Generate multiple reels from CSV

## 📋 Quick Start

### 1. Install Dependencies

```bash
cd reels
pip install -r requirements.txt
```

### 2. Add Assets

```
reels/
├── assets/
│   ├── logo.png          # Your logo (500x500px PNG)
│   ├── footage/          # Video clips (MP4/MOV)
│   │   ├── clip1.mp4
│   │   ├── clip2.mp4
│   │   └── ...
│   └── music/            # Background music (MP3)
│       ├── track.mp3
│       └── ...
```

**Free Stock Resources:**
- **Video:** Pexels, Pixabay, Videvo, Coverr
- **Music:** YouTube Audio Library, Free Music Archive

### 3. Edit Content

Edit `content.csv` with your reel content:

```csv
title,hook,bullets,cta,footage_dir,bg_music,duration,brand_color,logo,qr_url,output
Free Training,Stop scrolling: FREE career training,Industry certs; Job placement; Federal funding,Apply free • Link in bio,assets/footage,assets/music/track.mp3,24,#1e40af,assets/logo.png,https://elevateforhumanity.org,free_training.mp4
```

### 4. Generate Reels

```bash
python reels_maker.py
```

Output files in `out/`:
- `free_training.mp4` - The reel video
- `free_training_thumb.png` - Thumbnail image
- `free_training_caption.txt` - Caption with hashtags

## 📊 Content Calendar

Use `content-calendar-30days.csv` for a full month of content:

```bash
# Generate all 30 reels
cp content-calendar-30days.csv content.csv
python reels_maker.py
```

## 🎨 Customization

### Brand Colors

Edit `.env`:
```bash
BRAND_COLOR=#1e40af  # Your brand color
SITE_URL=https://elevateforhumanity.org
```

### Content Structure

Each reel has:
1. **Hook** (0-3s) - Attention-grabbing opening
2. **Bullets** (3s-end-3s) - Key points with animations
3. **CTA** (last 3s) - Call to action

### CSV Fields

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Reel title | "Free Training" |
| `hook` | Opening text (1-2 lines) | "Stop scrolling: FREE career training" |
| `bullets` | Key points (`;` separated) | "Industry certs; Job placement; Federal funding" |
| `cta` | Call to action | "Apply free • Link in bio" |
| `footage_dir` | Video clips directory | "assets/footage" |
| `bg_music` | Background music file | "assets/music/track.mp3" |
| `duration` | Reel length in seconds | 24 |
| `brand_color` | Hex color code | "#1e40af" |
| `logo` | Logo file path | "assets/logo.png" |
| `qr_url` | QR code destination | "https://elevateforhumanity.org" |
| `output` | Output filename | "free_training.mp4" |

## 📱 Platform Specs

### Instagram Reels
- **Resolution:** 1080x1920
- **Duration:** 15-90 seconds (optimal: 20-30s)
- **Format:** MP4, H.264
- **Max Size:** 4GB

### TikTok
- **Resolution:** 1080x1920
- **Duration:** 15-60 seconds (optimal: 21-34s)
- **Format:** MP4, H.264
- **Max Size:** 287MB

### YouTube Shorts
- **Resolution:** 1080x1920
- **Duration:** Up to 60 seconds
- **Format:** MP4, H.264
- **Max Size:** 256GB

### Facebook Reels
- **Resolution:** 1080x1920
- **Duration:** 3-90 seconds
- **Format:** MP4, H.264
- **Max Size:** 4GB

## 🚀 Best Practices

### Content Strategy
- ✅ **Hook in 1 second** - Grab attention immediately
- ✅ **3-5 bullets max** - Keep it concise
- ✅ **Strong CTA** - Clear next step
- ✅ **Consistent branding** - Use same colors/logo
- ✅ **Post daily** - Consistency builds audience

### Posting Schedule
- **Instagram:** 11 AM, 2 PM, 7 PM EST
- **TikTok:** 6 AM, 12 PM, 7 PM EST
- **YouTube:** 12 PM, 3 PM, 9 PM EST

### Hashtag Strategy
- Use 20-30 hashtags
- Mix popular (#careertraining) and niche (#WIOAfunding)
- Include location (#indianapolis)
- Brand hashtag (#elevateforhumanity)

### Engagement Tips
- Respond to comments within 1 hour
- Pin top comment with link
- Use trending audio when possible
- Cross-post to all platforms
- Embed reels on website

## 🔄 Integration with Social Media Automation

The reels system integrates with the social media automation:

```javascript
// In scripts/social-media-automation.js
const reelPath = 'reels/out/free_training.mp4';
const caption = fs.readFileSync('reels/out/free_training_caption.txt', 'utf8');

// Post to Instagram Reels
await postToInstagramReels(reelPath, caption);

// Post to TikTok
await postToTikTok(reelPath, caption);

// Post to YouTube Shorts
await postToYouTubeShorts(reelPath, caption);
```

## 📈 Analytics to Track

- **Views** - Total reach
- **Engagement Rate** - Likes + comments + shares / views
- **Watch Time** - Average % watched
- **Click-Through Rate** - QR scans / views
- **Follower Growth** - New followers per reel
- **Conversion Rate** - Applications / views

## 🆘 Troubleshooting

### "MoviePy error"
```bash
# Install ImageMagick
sudo apt-get install imagemagick
```

### "Font not found"
```bash
# Install fonts
sudo apt-get install fonts-liberation
```

### "No footage found"
- Add video files to `assets/footage/`
- Supported formats: MP4, MOV, MKV

### "Music not playing"
- Check file path in CSV
- Supported formats: MP3, WAV
- Ensure file exists

## 📚 Resources

- [Instagram Reels Best Practices](https://business.instagram.com/reels)
- [TikTok Creator Portal](https://www.tiktok.com/creators/)
- [YouTube Shorts Guide](https://support.google.com/youtube/answer/10059070)
- [Pexels Free Videos](https://www.pexels.com/videos/)
- [YouTube Audio Library](https://studio.youtube.com/)

## 🎓 Content Ideas

### Program Highlights
- "3 FREE certifications you can get"
- "Highest paying tech certs in 2025"
- "Healthcare careers with NO degree"

### Success Stories
- "Meet [Name]: [Before] to [After]"
- "Changed careers at [Age]"
- "Single parent success story"

### Funding/Opportunities
- "Government pays 100% of training"
- "Get PAID to learn: Apprenticeships"
- "WIOA funding explained"

### Tips/Education
- "5 resume mistakes to avoid"
- "How to ace your interview"
- "Career change checklist"

### Urgency/FOMO
- "500K+ jobs hiring NOW"
- "Last chance: Enrollment closes [Date]"
- "Limited spots available"

## 🔧 Advanced Features

### Auto-Subtitles (Coming Soon)
```python
# Add transcript file support
python reels_maker.py --subtitles transcript.srt
```

### Batch Upload (Coming Soon)
```python
# Auto-upload to all platforms
python reels_maker.py --upload-all
```

### A/B Testing (Coming Soon)
```python
# Generate variations
python reels_maker.py --variations 3
```

---

**Created by:** Elevate for Humanity Tech Team  
**Version:** 1.0.0  
**Last Updated:** October 15, 2025
