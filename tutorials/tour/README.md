# Feature-tour videos (silent — voiceover added later)

Each spec records one `video.webm` showcasing a feature, with a **synthetic
human cursor** (Playwright's video recorder doesn't capture the OS pointer, so
`lib/cursor.ts` injects a DOM cursor that glides with easing + click ripples).

## Run

```bash
# all tours (set the test-account password for authenticated features)
$env:QA_TEST_PASSWORD="..."        # PowerShell
npx playwright test --config=tutorials/tour.config.ts

# one tour
npx playwright test --config=tutorials/tour.config.ts tutorials/tour/04-quiz.spec.ts
```

Videos land in `tutorials/output/tour/<spec-name>/video.webm` (1920×1080).

## Tours

| # | Spec | Feature | Auth |
|---|------|---------|------|
| 01 | landing | Marketing landing page scroll | no |
| 02 | login | Sign-in flow | yes |
| 03 | course-topic | Course gate + topic selector | yes |
| 04 | quiz | Live quiz: answer + feedback | yes |
| 05 | lesson | Theory / lesson screen | yes |
| 06 | mindmap | Mind-map canvas | yes |
| 07 | city | 3D Godot city | yes |
| 08 | arsenal | Saved formulas / notes | yes |
| 09 | darkmode-nav | Dark mode + sidebar walk | yes |

## Helpers (`lib/`)

- `cursor.ts` — `installCursor`, `humanMove`, `humanClick`, `humanType`, `beat`
- `auth.ts` — `tutorialLogin` (reuses the QA test account)

## Convert to mp4 (for editing / upload)

```bash
ffmpeg -i video.webm -c:v libx264 -pix_fmt yuv420p -crf 20 out.mp4
```

## Notes

- Recorded against **prod** (`wafflestack-app.vercel.app`) — no local server.
- `beat()` pauses are sized so a voiceover can be laid over each step.
- WebGL (R3F hero, Godot city) runs via SwiftShader in headless — slower but captured.
