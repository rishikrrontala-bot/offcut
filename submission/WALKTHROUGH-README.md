# OFFCUT — labelled engineering walkthrough

The recorder captures the actual studio using the built-in illustrated example and real browser-local OpenCV/SlimSAM. It does not substitute an illustration for camera or physical proof.

The accepted final recording is **142.16 seconds (2:22), 1280 × 720, eleven scenes, H.264/AAC**. It includes asserted full-grid framing and actual material exclusion/recompute after visual review rejected the first 128.16 s clip’s off-screen allocation scene. The final five gallery frames were visually inspected. Local served-asset tests pass as part of all nine browser checks; updated public deployment checks are pending.

## Honest scope

- A persistent badge says **“Illustrated input · real segmentation · physical result unverified.”**
- Source crops come from the illustrated drawing. Masks are predicted by real pretrained inference, not hardcoded.
- The recording demonstrates the mandatory review control; automated checking is not evidence that a human inspected the boundaries.
- The actual export opens with its 20 mm calibration square and synthetic-input disclaimer.
- Credit: **Built by Rishik Rontala**. No camera evaluation, physical assembly, public YouTube upload or Devpost submission is claimed.

## Run

The app must run at `BASE_URL` (default http://127.0.0.1:3037), with installed Playwright and Google Chrome. On macOS, `/usr/bin/say` writes voice files; it does not play audio. Playwright’s video runtime can be installed with `npx playwright install ffmpeg`. Muxing uses the available imageio-ffmpeg binary documented in the recorder.

```sh
BASE_URL=http://127.0.0.1:3037 node scripts/record-walkthrough.cjs --rehearse
BASE_URL=http://127.0.0.1:3037 node scripts/record-walkthrough.cjs --record
node scripts/record-walkthrough.cjs --assemble
```

Rehearsal checks real selectors and the complete flow. Recording requires a matching rehearsal receipt, regenerates narration files, records actual live browser frames, and holds scenes for measured narration/pacing. Assembly muxes H.264/AAC with timestamped voice segments, checks duration/dimensions and measures audio volume. It can rerun muxing against captured artifacts.

## Files and release

- `WALKTHROUGH-NARRATION.json`: eleven spoken/captioned scenes and honesty badge.
- `../scripts/record-walkthrough.cjs`: recorder developed with GLM assistance and finalized with native Codex after the user allowed any suitable model.
- `../artifacts/walkthrough/`: local WebM/MP4, rehearsal receipt, measured manifest/timeline, plan HTML and voice AIFF files.
- `../public/demo/engineering-walkthrough.mp4`: final checked MP4 copied for the release.
- `../public/demo/walkthrough-transcript.txt`: text exported from the actual narration.
- `engineering-walkthrough.srt`: selectable subtitles generated from the final measured scene timeline.
- `gallery/`: inspected frames from the final actual recording.

The `/walkthrough` player provides controls, begins muted and does not autoplay. Browser tests fetch the real MP4 and transcript, load real metadata, and check phone overflow. Local success does not imply the deployed asset passed; record public results separately.

## Safety and provenance

Chrome is headless with `--mute-audio`. TTS writes files; audio is verified by statistics rather than speakers. Video frames are not fabricated assembly evidence. The manifest’s `synthetic:true` identifies the input; its `published:false` refers to capture-time publication status, not a later verified web release. No YouTube publication is implied by file creation or web hosting.
