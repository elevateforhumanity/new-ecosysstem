#!/usr/bin/env python3
"""
Auto-Subtitle Generator for Reels
Adds word-by-word animated subtitles to existing reels
"""
import os
import json
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
from moviepy.video.tools.subtitles import SubtitlesClip

def generate_transcript_from_content(content_row):
    """Generate a simple transcript from the reel content"""
    transcript = []
    
    # Hook (0-3s)
    hook_words = content_row['hook'].split()
    time_per_word = 3.0 / len(hook_words)
    for i, word in enumerate(hook_words):
        start = i * time_per_word
        end = (i + 1) * time_per_word
        transcript.append({
            'start': start,
            'end': end,
            'text': word
        })
    
    # Bullets (3s onwards)
    bullets = content_row['bullets'].split(';')
    current_time = 3.2
    time_per_bullet = 2.0
    
    for bullet in bullets:
        words = bullet.strip().split()
        time_per_word = time_per_bullet / len(words)
        for word in words:
            transcript.append({
                'start': current_time,
                'end': current_time + time_per_word,
                'text': word
            })
            current_time += time_per_word
        current_time += 0.3  # pause between bullets
    
    return transcript

def create_subtitle_clip(txt, start, end):
    """Create a single subtitle clip with styling"""
    return (TextClip(txt, 
                    fontsize=60, 
                    color='white',
                    stroke_color='black',
                    stroke_width=3,
                    font='Arial-Bold',
                    method='caption',
                    size=(900, None),
                    align='center')
            .set_position(('center', 1400))
            .set_start(start)
            .set_duration(end - start)
            .crossfadein(0.1)
            .crossfadeout(0.1))

def add_subtitles_to_video(video_path, transcript, output_path):
    """Add subtitles to an existing video"""
    print(f"  📝 Adding subtitles to: {video_path}")
    
    video = VideoFileClip(video_path)
    
    # Create subtitle clips
    subtitle_clips = []
    for entry in transcript:
        clip = create_subtitle_clip(entry['text'], entry['start'], entry['end'])
        subtitle_clips.append(clip)
    
    # Composite video with subtitles
    final = CompositeVideoClip([video] + subtitle_clips)
    
    print(f"  🎬 Rendering with subtitles...")
    final.write_videofile(output_path, 
                         fps=video.fps,
                         codec='libx264',
                         audio_codec='aac',
                         bitrate='8000k',
                         preset='medium',
                         ffmpeg_params=['-pix_fmt', 'yuv420p'])
    
    video.close()
    final.close()
    
    print(f"  ✅ Saved: {output_path}")

def save_transcript_json(transcript, output_path):
    """Save transcript as JSON for reference"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(transcript, f, indent=2)

if __name__ == "__main__":
    import csv
    
    print("\n📝 Auto-Subtitle Generator")
    print("=" * 50)
    
    # Read content.csv
    content_file = "content.csv"
    if not os.path.isfile(content_file):
        print("❌ content.csv not found")
        exit(1)
    
    with open(content_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"\n📊 Found {len(rows)} videos to process\n")
    
    for i, row in enumerate(rows, 1):
        video_file = os.path.join('out', row['output'])
        
        if not os.path.isfile(video_file):
            print(f"[{i}/{len(rows)}] ⚠️  Skipping {row['output']} (not found)")
            continue
        
        print(f"[{i}/{len(rows)}] Processing: {row['title']}")
        
        # Generate transcript
        transcript = generate_transcript_from_content(row)
        
        # Save transcript
        transcript_file = os.path.splitext(video_file)[0] + '_transcript.json'
        save_transcript_json(transcript, transcript_file)
        print(f"  💾 Transcript: {transcript_file}")
        
        # Add subtitles
        output_file = os.path.splitext(video_file)[0] + '_subtitled.mp4'
        add_subtitles_to_video(video_file, transcript, output_file)
    
    print("\n" + "=" * 50)
    print("🎉 All subtitles added!")
    print("\n📁 Files with '_subtitled.mp4' have captions")
