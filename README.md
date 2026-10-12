# OFFCUT

**Make something from what’s left.** Built solo by Rishik Rontala for Banana Hacks 2026.

OFFCUT turns a photograph of separated coloured scraps into a finite material inventory, an achievable collage made from original image crops, and numbered actual-size cutting/assembly plans. Every artwork cell uses one unique source square. Backgrounds need real paper too; the app never recolours or duplicates a source piece.

[Open the studio](https://offcut-six.vercel.app/) · [Public source](https://github.com/rishikrrontala-bot/offcut)

## Use it

1. Photograph 4–8 flat, opaque, separated scraps on a contrasting portrait A4 sheet (210 × 297 mm). Keep every reference-sheet corner visible. The built-in **Try illustrated example** also exercises the real pipeline, with a persistent synthetic-input label.
2. Upload JPEG, PNG or WebP. Position the four corner handles or numeric fields, confirm the short 210 mm edge is at the top, and run detection.
3. OpenCV rectifies perspective. Browser-local pretrained SlimSAM proposes masks from contrast-supplied points. Inspect every boundary before confirming review. Brush/erase, keyboard rectangle editing, positive/negative SAM points, zoom, numeric point entry and five-step undo support correction. Missed paper can be prompted without re-encoding the image.
4. Choose a Heart, Flower or Bird template in the available palette, or upload a simple target. Templates are explicitly designed patterns; image generation is unavailable. Uploaded targets use an aspect-preserving central square crop, shown beside the achievable result. Choose a 6 × 6 or 8 × 8 grid.
5. Make the collage. Click a square to reveal its source in the original photograph. Exclude a paper to recompute from the remaining inventory or receive an honest shortage. Saving/reopening preserves explicit palette IDs, including papers with identical average colours.
6. Download the HTML cutting/assembly plan. Open it and print at **100% actual size**, with fit-to-page disabled. Measure both sides of the **20 mm calibration square** before cutting. Each Source ID has one primary cutting page; overlapping viewports provide context, not duplicate pieces. Cut the original paper, then assemble the numbered squares. The PNG export also preserves original crop textures. Illustrated inputs remain labelled in exports.
7. Save to this browser, download a portable project JSON, or clear local data on shared devices.

Input photographs and target images stay in the browser. Model weights and runtimes download from Hugging Face/CDNs, which receive ordinary connection metadata. No image POST or app API key is needed. Saved/exported projects contain the input images, so share them deliberately.

## Run locally

Node 22 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The checked-in npm configuration disables dependency install scripts and uses the verified lockfile’s peer-resolution settings. Build/dev prepares the pinned OpenCV runtime from the installed package; native ONNX and Sharp are excluded from browser bundles.

```sh
npm test
npm run typecheck
npm run build
npm start
```

For browser checks, start a production server on 127.0.0.1:3037 and run `npm run test:e2e`. `PLAYWRIGHT_BASE_URL` points the same checks at a deployment. Tests use installed Google Chrome with audio muted. Recorder setup and commands are in `submission/WALKTHROUGH-README.md`.

## Engineering

A4 is rectified to 1050 × 1485 pixels (5 px/mm). A 12 mm source square is accepted only when its whole footprint plus a 1 mm margin is inside one included, exclusive mask. A 14 mm lattice keeps source pieces separate. A rectangular Hungarian assignment minimises squared CIELAB distance and uses each source tile at most once. Capacity shortages block allocation.

Preview, source trace, assembly grid and export share source IDs. Assembly is 72 mm or 96 mm square. Four overlapping 120 × 168.5 mm cutting viewports include locators and offsets; a mapping table identifies each piece’s primary page and assembly cell.

## Verification and evidence

Latest unit run: **59 passing tests in 1.90 s**; production build and type checking pass. On October 11 the updated release passed **all nine local Chrome browser checks in 31.7 s**, including actual pretrained inference, example labels, source tracing, print calibration, project recovery, mobile overflow and the served walkthrough asset. All nine checks also passed against the public deployment in **35.4 s**.

The final **2:22** narrated/captioned engineering recording is captured: 142.16 s, 1280 × 720, eleven scenes, H.264 video and AAC narration. It uses illustrated input with real OpenCV/SlimSAM and shows unique allocation, source tracing, actual removal/recompute and the exported plan. Full-grid framing was visually checked. The final media files are publicly served under `public/demo/`; the [walkthrough](https://offcut-six.vercel.app/walkthrough), metadata, transcript and phone layout passed public browser checks. The deployed MP4 matches the local file byte-for-byte.

**No real camera photographs have been evaluated, no physical assembly is verified, and no human usability result is claimed.** The illustrated example and synthetic fixtures are engineering evidence, not real-world accuracy measurements. YouTube URL supplied by Rishik: https://youtu.be/ekFjI1mhMRA; full logged-out YouTube playback remains unverified. The [Devpost entry](https://devpost.com/software/offcut-g5c2bo) was verified as SUBMITTED, 5/5 steps done, on October 11 around 12:08 p.m. EDT. Current outcomes live in EVALUATION.md and BUILD-STATUS.md; the preserved APP-BRIEF.md is the original brief/event record.

## Credits and submission

Codex and user-authorized Featherless GLM-5.3-Flash, GLM-5.3 and GLM-5.2 assisted implementation and review. The user later permitted any suitable model; final interface, recorder and release work also uses native Codex assistance. Featherless supports development, not the app’s image inference. No model was trained for this event. Private credentials and billing/worker records stay outside this repository; Featherless spending remains capped at $10 including previous usage/reservations, with no purchases or top-ups.

Read DESIGN.md, LIMITATIONS.md, THIRD-PARTY.md and WIN-CONTRACT.md. The copy-ready write-up and exact fields are in `submission/DEVPOST-DRAFT.md` and `submission/DEVPOST-READY.md`; `submission/HUMAN-PROOF.md` explains the remaining paper test. Ceremony-specific constraints remain unverified; Rishik authorized continuation under the published Image AI theme.

## OFFCUT identity

The new [wordmark](submission/brand/offcut-wordmark.png), [clean icon](submission/brand/offcut-icon-clean.png) and [3:2 Devpost cover](submission/brand/offcut-devpost-cover.png) use the paper/ink/terra design direction. The detached square represents a leftover finding a new place. These branding assets were created using built-in image generation; they are not segmentation outputs or physical proof.
