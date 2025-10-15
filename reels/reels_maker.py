#!/usr/bin/env python3
"""
Elevate for Humanity - Automated Reels Generator
Creates vertical 1080x1920 reels with animated text, branding, QR codes, and music
"""
import os, csv, random, math, textwrap, glob
from dataclasses import dataclass
from typing import List, Optional
from dotenv import load_dotenv
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import qrcode
from moviepy.editor import (
    VideoFileClip, AudioFileClip, ImageClip, CompositeVideoClip, concatenate_videoclips,
    TextClip, ColorClip, vfx
)

# ---------------------- Config ----------------------
load_dotenv()
W, H = 1080, 1920              # vertical 9:16
FPS = 30
BITRATE = "8000k"              # IG/TikTok-ready
DEFAULT_BRAND = os.getenv("BRAND_COLOR", "#1e40af")  # EFH blue
DEFAULT_URL = os.getenv("SITE_URL", "https://elevateforhumanity.org")
LOGO_PATH = "assets/logo.png"  # optional
OUTPUT_DIR = "out"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# CSV columns (header exactly):
# title,hook,bullets,cta,footage_dir,bg_music,duration,brand_color,logo,qr_url,output
# bullets are ; separated. duration in seconds (e.g., 25)
# any field can be left blank, sensible defaults apply.

@dataclass
class ReelRow:
    title: str
    hook: str
    bullets: List[str]
    cta: str
    footage_dir: str
    bg_music: Optional[str]
    duration: int
    brand_color: str
    logo: Optional[str]
    qr_url: Optional[str]
    output: str

# ---------------------- Helpers ----------------------
def parse_csv(path: str) -> List[ReelRow]:
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            bullets = [b.strip() for b in (r.get("bullets") or "").split(";") if b.strip()]
            rows.append(ReelRow(
                title=(r.get("title") or "").strip() or "EFH Reel",
                hook=(r.get("hook") or "").strip() or "Quick tip you can use today",
                bullets=bullets or ["Learn fast", "Build smarter", "Ship today"],
                cta=(r.get("cta") or "").strip() or "Tap link • Free programs • Enroll now",
                footage_dir=(r.get("footage_dir") or "assets/footage").strip(),
                bg_music=(r.get("bg_music") or "assets/music/track.mp3").strip() if (r.get("bg_music") or "").strip() else None,
                duration=int((r.get("duration") or 22)),
                brand_color=(r.get("brand_color") or DEFAULT_BRAND).strip(),
                logo=(r.get("logo") or LOGO_PATH).strip() if (r.get("logo") or "").strip() else None,
                qr_url=(r.get("qr_url") or DEFAULT_URL).strip(),
                output=(r.get("output") or "reel.mp4").strip()
            ))
    return rows

def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def make_gradient_overlay(color_hex: str, alpha_top=0.65, alpha_mid=0.25, alpha_bot=0.65):
    # vertical vignette/gradient for text readability
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    r,g,b = hex_to_rgb(color_hex)
    steps = H
    for y in range(H):
        # cosine ease
        t = y / H
        a = (alpha_top*(1-t) + alpha_mid*(1-abs(2*t-1)) + alpha_bot*(t)) / 2.0
        a = max(0, min(0.85, a))
        draw.line([(0,y),(W,y)], fill=(r,g,b, int(a*255)))
    return ImageClip(np.array(img)).set_duration(1)

def fit_vertical(clip: VideoFileClip) -> VideoFileClip:
    # Scale and center-crop any aspect into 9:16 with slight Ken-Burns pan/zoom
    target_ratio = W/H
    w, h = clip.size
    ratio = w/h
    c = clip.fx(vfx.fadein, 0.1).fx(vfx.fadeout,0.1)
    if ratio > target_ratio:
        # too wide: scale by height then crop width
        c = c.resize(height=H)
        w2, h2 = c.size
        extra = (w2 - W)//2
        c = c.crop(x1=extra, x2=extra+W, y1=0, y2=H)
    else:
        c = c.resize(width=W)
        w2, h2 = c.size
        extra = (h2 - H)//2
        c = c.crop(x1=0, x2=W, y1=extra, y2=extra+H)
    # subtle zoom
    return c.fx(vfx.zoom_in, 1.03)

def safe_text(txt: str, size=72, color="white", stroke_color="black", stroke_width=2, font="Arial-Bold"):
    # MoviePy TextClip wrapper with safe defaults
    return TextClip(txt, fontsize=size, color=color, stroke_color=stroke_color,
                    stroke_width=stroke_width, font=font, method="caption", size=(int(W*0.9), None), align="center")

def slide_in(txt: str, y: int, t_start: float, t_dur: float, size=84):
    tc = safe_text(txt, size=size)
    tc = tc.set_position(lambda t: ((W - tc.w)//2, y - int(40*math.cos(min(1,t*3.14))))).set_start(t_start).set_duration(t_dur).crossfadein(0.2)
    return tc

def make_qr(url: str, box_size=8):
    qr = qrcode.QRCode(border=1, version=2, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    img = img.resize((box_size*29, box_size*29), Image.NEAREST)
    return ImageClip(np.array(img))

def pick_clips(folder: str, needed_dur: float) -> List[VideoFileClip]:
    files = sum([glob.glob(os.path.join(folder, p)) for p in ("*.mp4", "*.mov", "*.mkv", "*.MP4")], [])
    if not files:
        # fallback: create solid color bg
        solid = ColorClip((W,H), color=hex_to_rgb(DEFAULT_BRAND)).set_duration(needed_dur)
        return [solid]
    random.shuffle(files)
    chosen, total = [], 0.0
    for f in files:
        try:
            v = VideoFileClip(f)
            chosen.append(v)
            total += v.duration
            if total >= needed_dur + 2: break
        except Exception:
            continue
    if not chosen:
        return [ColorClip((W,H), color=hex_to_rgb(DEFAULT_BRAND)).set_duration(needed_dur)]
    return chosen

def concat_vclips(vclips: List[VideoFileClip], total_dur: float) -> VideoFileClip:
    fitted = [fit_vertical(c) for c in vclips]
    joined = concatenate_videoclips(fitted, method="compose", padding=-0.2)
    if joined.duration > total_dur:
        joined = joined.subclip(0, total_dur)
    else:
        joined = joined.loop(duration=total_dur)
    return joined.set_fps(FPS)

def add_music(base: VideoFileClip, music_path: Optional[str]):
    if not music_path or not os.path.isfile(music_path):
        return base
    try:
        a = AudioFileClip(music_path).volumex(0.25)  # gentle
        return base.set_audio(a.audio_loop(duration=base.duration))
    except Exception:
        return base

def make_thumbnail(frame: np.ndarray, title: str, brand_color: str, out_path: str):
    img = Image.fromarray(frame).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0,0,0,0))
    draw = ImageDraw.Draw(overlay)
    # top ribbon
    draw.rectangle([(0,0),(W,int(H*0.18))], fill=hex_to_rgb(brand_color)+(210,))
    # title
    wrapped = textwrap.fill(title, width=22)
    draw.text((int(W*0.05), int(H*0.045)), wrapped, fill=(255,255,255,255))
    thumb = Image.alpha_composite(img, overlay).convert("RGB")
    thumb.save(out_path, "PNG")

# ---------------------- Build Reel ----------------------
def build_reel(row: ReelRow):
    print(f"  📹 Building: {row.output}")
    
    # video bed
    clips = pick_clips(row.footage_dir, row.duration)
    bed = concat_vclips(clips, row.duration)

    # gradient/top overlay
    grad = make_gradient_overlay(row.brand_color).set_duration(row.duration)

    layers = [bed, grad]

    # logo badge (optional)
    if row.logo and os.path.isfile(row.logo):
        logo = (ImageClip(row.logo)
                .set_duration(row.duration)
                .resize(width=int(W*0.18))
                .set_position((int(W*0.04), int(H*0.04)))
                .set_opacity(0.95))
        layers.append(logo)

    # QR (optional)
    if row.qr_url:
        qr = make_qr(row.qr_url, box_size=6).set_duration(row.duration)
        qr = qr.set_position((W - int(W*0.26), H - int(W*0.26)))
        layers.append(qr)

    # Hook (0–3s)
    hook_clip = slide_in(row.hook, y=int(H*0.20), t_start=0.2, t_dur=3.0, size=92)
    layers.append(hook_clip)

    # Bullets (3–duration-4)
    t = 3.2
    each = max(1.6, (row.duration - 6.0) / max(1, len(row.bullets)))
    for b in row.bullets:
        layers.append(slide_in(f"• {b}", y=int(H*0.72), t_start=t, t_dur=each, size=70))
        t += each

    # CTA (last 3s)
    cta = slide_in(row.cta, y=int(H*0.86), t_start=max(0, row.duration-3.0), t_dur=3.0, size=72)
    layers.append(cta)

    comp = CompositeVideoClip(layers, size=(W,H)).set_duration(row.duration).set_fps(FPS)
    comp = add_music(comp, row.bg_music)

    # Export
    out_path = os.path.join(OUTPUT_DIR, row.output)
    print(f"  🎬 Rendering to: {out_path}")
    comp.write_videofile(out_path, fps=FPS, codec="libx264", audio_codec="aac",
                         bitrate=BITRATE, threads=4, preset="medium", ffmpeg_params=["-pix_fmt","yuv420p"])
    
    # Thumbnail
    thumb = os.path.splitext(out_path)[0] + "_thumb.png"
    make_thumbnail(comp.get_frame(1.0), row.title, row.brand_color, thumb)
    
    # Hashtags helper
    tags = hashtags_for_title(row.title)
    caption_path = os.path.splitext(out_path)[0]+"_caption.txt"
    with open(caption_path,"w",encoding="utf-8") as f:
        f.write(make_caption(row, tags))

    # Cleanup
    comp.close()
    for c in clips:
        try: c.close()
        except: pass
    
    return out_path, thumb, caption_path

def hashtags_for_title(title: str) -> List[str]:
    base = ["#elevateforhumanity","#workforce","#careertraining","#indianapolis",
            "#edtech","#apprenticeship","#learnandearn","#reskilling","#upskilling",
            "#entrepreneurship","#studentSuccess","#community","#WIOA","#federalfunding"]
    
    title_lower = title.lower()
    
    # Tech/IT
    if any(k in title_lower for k in ["tech","it","coding","software","developer","programming"]):
        base += ["#techcareers","#coding","#softwaredeveloper","#learntocode"]
    
    # Healthcare
    if any(k in title_lower for k in ["healthcare","medical","nursing","ehr","health"]):
        base += ["#healthcare","#medicalcareers","#nursing","#healthIT"]
    
    # Data/AI
    if any(k in title_lower for k in ["data","ai","machine learning","analytics"]):
        base += ["#datascience","#AI","#machinelearning","#analytics"]
    
    # Business
    if any(k in title_lower for k in ["business","management","project","hr"]):
        base += ["#businessskills","#projectmanagement","#leadership"]
    
    # Design/Creative
    if any(k in title_lower for k in ["ui","design","ux","figma","brand","creative"]):
        base += ["#uiux","#design","#figma","#webdesign","#creative"]
    
    return list(dict.fromkeys(base))[:30]

def make_caption(row: ReelRow, tags: List[str]) -> str:
    return f"""{row.hook}

{" • ".join(row.bullets[:5])}

{row.cta}
🔗 {row.qr_url}

{" ".join(tags)}

#ElevateForHumanity #FreeTraining #CareerChange
"""

# ---------------------- Main ----------------------
if __name__ == "__main__":
    print("\n🎬 Elevate for Humanity - Reels Generator")
    print("=" * 50)
    
    csv_path = "content.csv"
    if not os.path.isfile(csv_path):
        # create a starter CSV
        print("\n📝 Creating starter content.csv...")
        with open(csv_path,"w",newline="",encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["title","hook","bullets","cta","footage_dir","bg_music","duration","brand_color","logo","qr_url","output"])
            w.writerow([
                "EFH Programs","3 FREE ways to skill up",
                "Industry credentials; Job placement support; Paid apprenticeships",
                "Apply today • Link in bio","assets/footage","assets/music/track.mp3","22",
                DEFAULT_BRAND, LOGO_PATH, DEFAULT_URL, "efh_demo_01.mp4"
            ])
        print("✅ Created starter content.csv")
        print("\n📋 Next steps:")
        print("  1. Edit content.csv with your reel content")
        print("  2. Add video footage to assets/footage/")
        print("  3. Add background music to assets/music/")
        print("  4. Run: python reels_maker.py")
        exit(0)

    rows = parse_csv(csv_path)
    print(f"\n📊 Found {len(rows)} reels to generate\n")
    
    for i, r in enumerate(rows, 1):
        print(f"\n[{i}/{len(rows)}] Processing: {r.title}")
        print("-" * 50)
        try:
            out, thumb, caption = build_reel(r)
            print(f"  ✅ Video: {out}")
            print(f"  🖼  Thumbnail: {thumb}")
            print(f"  📝 Caption: {caption}")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            continue
    
    print("\n" + "=" * 50)
    print("🎉 All reels generated!")
    print(f"📁 Output directory: {OUTPUT_DIR}/")
    print("\n📱 Ready to upload to:")
    print("  • Instagram Reels")
    print("  • TikTok")
    print("  • YouTube Shorts")
    print("  • Facebook Reels")
