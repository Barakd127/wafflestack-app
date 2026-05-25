# Tutorial-videos pipeline orchestrator.
# Each target operates on a single video (NN = 01, 02, ...).
#
# Usage:
#   make record NN=01      # Playwright walks the flow, ffmpeg records desktop
#   make subtitle NN=01    # Whisper auto-SRT
#   make publish NN=01     # Compose final mp4 (record + voice + subtitle)
#   make all NN=01         # Run the whole pipeline for one video
#
# Prereqs: ffmpeg on PATH, playwright installed (npx), whisper (pip).
# Voice file must already be at voiceovers/voice-$(NN).mp3 (exported from ImagineArt).

NN ?= 01
RAW := output/raw-$(NN).mp4
VOICE := voiceovers/voice-$(NN).mp3
SRT_HE := subtitles/voice-$(NN).he.srt
SRT_EN := subtitles/voice-$(NN).en.srt
FINAL := output/final-$(NN).mp4

# Platform-specific desktop grab. Override with `make record NN=01 DEVICE=gdigrab`.
DEVICE ?= gdigrab
RES ?= 1280x720
FRAMERATE ?= 30
DURATION ?= 90

.PHONY: record subtitle publish all clean list

record:
	@echo "Recording desktop while Playwright drives the flow..."
	@mkdir -p output
	@ffmpeg -y -f $(DEVICE) -framerate $(FRAMERATE) -video_size $(RES) -i desktop \
		-t $(DURATION) -c:v libx264 -preset fast -pix_fmt yuv420p $(RAW) &
	@sleep 1
	@npx playwright test scripts/$(NN)-*.spec.ts --headed --reporter=line
	@echo "Raw video: $(RAW)"

subtitle:
	@echo "Generating subtitles via Whisper..."
	@mkdir -p subtitles
	@whisper $(VOICE) --language he --output_dir subtitles --output_format srt
	@mv subtitles/voice-$(NN).srt $(SRT_HE) 2>/dev/null || true
	@whisper $(VOICE) --language he --task translate --output_dir subtitles --output_format srt
	@mv subtitles/voice-$(NN).srt $(SRT_EN) 2>/dev/null || true
	@echo "Subtitles: $(SRT_HE), $(SRT_EN)"

publish:
	@echo "Composing final video..."
	@ffmpeg -y -i $(RAW) -i $(VOICE) \
		-c:v libx264 -preset slow -crf 22 \
		-c:a aac -b:a 128k \
		-shortest \
		-vf "subtitles=$(SRT_HE):force_style='FontName=Arial,Fontsize=18,Alignment=2,Outline=1'" \
		$(FINAL)
	@echo "Published: $(FINAL)"

all: record subtitle publish
	@echo "Video $(NN) ready: $(FINAL)"

clean:
	@rm -f output/raw-$(NN).mp4 output/final-$(NN).mp4

list:
	@ls -la output/ voiceovers/ subtitles/ 2>/dev/null
