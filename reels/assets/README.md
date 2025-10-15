# Reels Assets Directory

## Structure

```
assets/
├── logo.png          # EFH logo (transparent PNG, ~500x500px)
├── footage/          # Video clips for backgrounds
│   ├── classroom.mp4
│   ├── students.mp4
│   ├── tech-lab.mp4
│   └── ...
└── music/            # Background music tracks
    ├── track.mp3
    ├── upbeat.mp3
    └── ...
```

## Asset Requirements

### Logo
- **Format:** PNG with transparency
- **Size:** 500x500px minimum
- **Usage:** Appears in top-left corner of reels

### Footage
- **Formats:** MP4, MOV, MKV
- **Duration:** 5-30 seconds each
- **Quality:** 1080p or higher
- **Aspect:** Any (will be auto-cropped to 9:16)
- **Content Ideas:**
  - Students in classrooms
  - People working on computers
  - Lab/workshop scenes
  - Success celebrations
  - Professional environments
  - Technology close-ups

### Music
- **Format:** MP3, WAV
- **Duration:** 30+ seconds (will loop)
- **Volume:** Will be reduced to 25% automatically
- **License:** Ensure you have rights to use
- **Recommended:**
  - Upbeat, motivational tracks
  - Instrumental (no lyrics)
  - 120-140 BPM
  - Royalty-free sources:
    - YouTube Audio Library
    - Epidemic Sound
    - Artlist
    - Uppbeat

## Free Stock Resources

### Video Footage
- **Pexels Videos:** https://www.pexels.com/videos/
- **Pixabay Videos:** https://pixabay.com/videos/
- **Videvo:** https://www.videvo.net/
- **Coverr:** https://coverr.co/

### Music
- **YouTube Audio Library:** https://studio.youtube.com/
- **Free Music Archive:** https://freemusicarchive.org/
- **Incompetech:** https://incompetech.com/
- **Bensound:** https://www.bensound.com/

## Tips

1. **Footage Variety:** Use 3-5 different clips per reel for visual interest
2. **Color Grading:** Match footage color tones for consistency
3. **Motion:** Include clips with movement (people walking, typing, etc.)
4. **Branding:** Keep footage professional and aligned with EFH brand
5. **Rights:** Always verify you have permission to use assets

## Quick Start

1. Download 5-10 video clips from Pexels (search: "students", "technology", "office")
2. Download 2-3 music tracks from YouTube Audio Library
3. Export EFH logo as PNG with transparency
4. Place files in respective directories
5. Run: `python reels_maker.py`
