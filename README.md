# OFFCUT

Make something from what’s left. Built by Rishik Rontala for Banana Hacks 2026.

OFFCUT turns a photograph of separated coloured paper scraps into a finite material inventory, an achievable photographic collage and actual-size cutting/assembly plans. Every output square uses one unique source square; backgrounds consume material too. It never recolours or duplicates photographed paper.

Live app: https://offcut-six.vercel.app · Public source: https://github.com/rishikrrontala-bot/offcut

## Use it

1. Photograph 4–8 flat, opaque, separated scraps on a contrasting portrait A4 sheet. Keep all four reference-sheet corners visible.
2. Upload a JPEG/PNG/WebP photograph, position the four corner handles (or use the numeric fields), and confirm the short top edge and corners.
3. OpenCV corrects perspective. Browser-local pretrained SlimSAM predicts masks using contrast-proposed point prompts. Inspect and correct every boundary with the brush or keyboard rectangle editor, then explicitly confirm review.
4. Upload a simple target image and select a 6×6 or 8×8 grid. Image generation is unavailable; the subject field is a note, not an AI prompt.
5. Make the collage. Click any piece to locate its exact region in the original photograph. Excluding a paper recomputes an already-reviewed collage or reports insufficient material.
6. Download the HTML print plan, open it and print at **100% actual size**, with fit-to-page disabled. Measure the 20 mm calibration square before cutting. Source viewports overlap; cut each numbered Source ID only once.

Photos and targets are processed in the browser. Model weights/runtime download from Hugging Face/CDN; image inputs are not uploaded. Sessions save to this browser’s IndexedDB. Download a portable project JSON or clear local data on shared devices. No API key is required for the app.

## Run locally

Node 22 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The project settings disable dependency install scripts and use legacy peer resolution, matching the verified lockfile. The explicit build/dev command copies the pinned OpenCV runtime from the installed package into the public vendor directory. Native ONNX and Sharp are excluded from browser bundles.

```sh
npm test
npm run typecheck
npm run build
npm start
```

For browser checks, start the production server on 127.0.0.1:3037 and run `npm run test:e2e`. Tests use an installed Google Chrome in muted mode. `PLAYWRIGHT_BASE_URL` can point the same checks at a deployment. Synthetic fixtures are explicitly engineering inputs; they are not real-paper evaluation photographs.

## How it works

The A4 reference is rectified to 1050×1485 pixels (5 px/mm). Conservative 12 mm tiles are accepted only when their whole footprint plus a 1 mm margin lies inside one included, exclusive mask. A 14 mm lattice keeps source pieces separate. A rectangular Hungarian assignment minimises squared CIELAB distance while using every source tile at most once. Capacity shortages produce an error. Preview and print plans use the same source IDs and unmodified photographic crops.

Assembly plans are 72 mm or 96 mm square. The source sheet is divided into four overlapping 120×168.5 mm viewports, each printed at actual size with a locator and physical offset. A numbered mapping table joins source positions to assembly cells.

## Evidence and development

Unit checks cover geometry, holes, margins, source overlap, uniqueness, shortages, stale revisions, session encoding and physical export scale. Browser checks cover the integrated workflow and actual pretrained inference; current outcomes are in EVALUATION.md. No ten-camera-photo benchmark or physical assembly has been supplied yet. Deployment, public video and submission are tracked in BUILD-STATUS.md; no pending milestone is presented as complete.

Development assistance: Codex coordinated, reviewed and integrated external Featherless API coding jobs. GLM-5.3-Flash supplied export code that was corrected during review. GLM-5.3’s larger requests returned incomplete output; Codex implemented the remaining engine. Featherless supplies development assistance, not OFFCUT’s segmentation or image generator. Credentials, billing records and worker responses live outside this source directory.

Read APP-BRIEF.md, WIN-CONTRACT.md, DESIGN.md, LIMITATIONS.md, EVALUATION.md and THIRD-PARTY.md. Ceremony-specific constraints remain unverified; Rishik instructed continuation under the published Image AI theme.
