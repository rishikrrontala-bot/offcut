# OFFCUT — evaluation and evidence

## Current engineering checkpoint — October 11, 2026

- Latest unit result: **59 passing tests in 1.90 s**. Production compilation and type checking pass.
- Updated local Chrome suite: **nine passing checks in 31.7 s**, after the responsive-header fix.
- Updated public Chrome suite: **nine passing checks in 35.4 s**, on production deployment `dpl_8v5oCR5nE4rtkLxUWkoKNeHoXurV`, source commit `949d352`, READY and aliased to https://offcut-six.vercel.app/ . The earlier six-check result at `0dff9b0` is historical.
- Final eleven-scene engineering video: **captured and checked**, 142.16 s (2:22), 1280 × 720, H.264/AAC. It uses illustrated input with actual OpenCV and pretrained SlimSAM. Full-grid framing assertions and real material exclusion/reallocation checks passed. Five final frames were visually inspected: learned masks, clean achievable artwork, source trace, calibrated plan and exclusion/recompute. The final MP4 and exact transcript are publicly served. The MP4 returned HTTP 200 with `video/mp4`, 2,765,649 bytes, and the same SHA-256 as the checked local file.

Historical results are retained as history, not current release totals: 14 unit/three browser checks, then 56/five, then 57/six. The latest actual-vision artifact (`artifacts/vision-check.json`) reports four masks and 104 usable squares with an 8.0 s model stage on a synthetic engineering image. It used actual learned inference, not hardcoded masks, with no camera input or external image POST. That is not a real-paper segmentation-accuracy measurement.

| Verified property | Evidence |
|---|---|
| Whole-footprint containment, holes, margins, exclusive masks and source separation | `tests/engine.test.ts` |
| Unique capacity-aware allocation, shortages and stale-revision guards | `tests/engine.test.ts` |
| Validated session encoding, source correspondence and physical export scale | `tests/session.test.ts`, `tests/export.test.ts` |
| Stable palette IDs, including identical-colour papers | Session/unit and browser restoration regressions |
| Actual OpenCV and pretrained SlimSAM, automatic masks, missed-paper recovery and positive/negative refinement | `tests/e2e/studio.spec.ts`, `artifacts/vision-check.json` |
| Illustrated example traverses the actual model pipeline; review gate, 36/64 source crops, tracing and labels survive restore/export | Studio browser journeys |
| Calibration: 20 mm square and 4 mm spacing, no text overlap in screen/print layout | Print-plan browser regressions |
| Real served MP4/transcript, metadata, muted/no autoplay, walkthrough/studio phone overflow | `tests/e2e/walkthrough.spec.ts` and responsive studio checks |

The full nine-check suite passed both locally (31.7 s) and publicly (35.4 s). The public `/walkthrough` loaded the real 142.16 s video and passed phone checks. Public MP4 SHA-256: `3d5a7a45087c1c9d7be4916c603a6faa8674def27f94edaf868daa5255bb408f`.

## Real-camera evaluation — not run

**Camera-photo count: zero. Physical assemblies: zero verified. Human usability results: none.** No supplied camera photo, ruler measurement or human result is counted as completed proof.

Capture ten new event-time photos under supported conditions: 4–8 separated flat opaque scraps on a contrasting portrait A4 sheet with all corners visible. Vary shape, lighting, mild shadows, capture angle and scarce-colour inventory while preserving supported conditions. Keep capture time and originals. `submission/HUMAN-PROOF.md` gives plain instructions and a ten-input log.

Record each input’s conditions; cold/warm model load; segmentation time; automatic result; required corrections; reviewed usable-square count; chosen grid; allocation/export time; exclusion/recompute behavior; and failure/next action. Report real counts with denominators and raw times, including failures.

| Photo | Capture time / conditions | Automatic result | Corrections | Usable squares | Timings | Export / recompute |
|---|---|---|---|---|---|---|
| No photographs supplied | Not evaluated | Not run | Not measured | Not measured | Not measured | Not run |

## Physical proof — not run

A human must print the exported real-photo plan at 100%, disable fit-to-page, measure both sides of the 20 mm calibration square with a physical ruler, cut each unique 12 mm source square once, and assemble the numbered grid. Photograph the input, software preview, instructions, ruler check and resulting collage. Record mismatches and confusion. Synthetic screenshots cannot establish printer, cut or assembly accuracy.

## Presentation and submission evidence

The initial 128.16 s recording passed stream/audio checks but visual review found the artwork off-screen in its allocation scene. It was rejected as the final presentation. The accepted 142.16 s recording adds asserted full-grid framing and an actual exclusion/recompute scene. It was captured successfully, and the five final gallery frames were visually checked. The earlier clip is not used in the upload bundle.

No audio is played through speakers during automation; narration is synthesized to files and checked through measured audio statistics. Gallery images are labelled illustrations. A public web player does not substitute for the required PUBLIC YouTube URL. YouTube publication and Devpost submission are unverified; automated account access is restricted and the Devpost connector returned an internal error.

Independent rubric reviews are estimates, not official judging or a measured product-quality score. Missing camera/physical evidence must remain visible in any rating.
