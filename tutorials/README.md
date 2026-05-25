# Tutorial Videos Pipeline

End-to-end workflow for producing Hebrew tutorial videos demonstrating WaffleStack features. Each video = screen recording + ImagineArt voiceover + subtitles.

## Layout

```
tutorials/
  scripts/         Playwright capture scripts (one per video)
  voiceovers/      script-NN.txt (HE source) + voice-NN.mp3 (ImagineArt output)
  subtitles/       voice-NN.he.srt + voice-NN.en.srt (Whisper output)
  output/          final-NN.mp4 (publishable)
  Makefile         orchestrates record → voice → publish
  README.md        this file
```

## Per-video pipeline (5 steps)

### 1. Write HE voiceover script
`tutorials/voiceovers/script-NN.txt` — natural Hebrew narration, ~150–200 words for a 75–90s video.

### 2. Generate voiceover via ImagineArt
- Open https://app.imagine.art
- Paste script into voiceover tool
- Choose Hebrew voice (e.g. "Noa" or similar)
- Export MP3 → save as `tutorials/voiceovers/voice-NN.mp3`

> ImagineArt voiceover API also exists; will document the curl flow once you confirm the endpoint path you use.

### 3. Record screen via Playwright + ffmpeg
```bash
# Start dev server
npm run dev
# In another shell:
cd tutorials
make record-NN
```
The Playwright script walks through the app at the same pace as the voiceover. Outputs `tutorials/output/raw-NN.mp4`.

### 4. Auto-subtitle via Whisper
```bash
make subtitle-NN
```
Generates `subtitles/voice-NN.he.srt` (Hebrew) + `voice-NN.en.srt` (English translation via Whisper's translate mode).

### 5. Compose final video
```bash
make publish-NN
```
ffmpeg overlays voiceover + burns subtitles → `output/final-NN.mp4`.

## Initial 6-video roadmap

| # | Title (HE) | Duration | File |
|---|---|---|---|
| 01 | התחלה ראשונה | 60s | tutorials/scripts/01-onboarding.spec.ts |
| 02 | שיעור ראשון | 75s | tutorials/scripts/02-lesson.spec.ts |
| 03 | תרגול שאלות | 60s | tutorials/scripts/03-quiz.spec.ts |
| 04 | מפת החשיבה שלך | 90s | tutorials/scripts/04-mindmap.spec.ts |
| 05 | הארסנל שלי | 60s | tutorials/scripts/05-arsenal.spec.ts |
| 06 | בנה את העיר | 60s | tutorials/scripts/06-city.spec.ts |

## Dependencies

- Node + Playwright (already in repo)
- ffmpeg on PATH
- whisper CLI (`pip install -U openai-whisper`) — optional for subtitles
- ImagineArt account for voiceovers
