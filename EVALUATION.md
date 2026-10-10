# OFFCUT — evaluation protocol and results

Real-paper evaluation: **not run**. No newly captured camera photographs or physical measurements have been supplied.

Engineering evidence (October 10, 2026): **14/14 unit tests and 3/3 browser checks passed**. Production compilation/type checks passed; dependency audit reported zero known vulnerabilities. The imported-session fixture passed allocation, source tracing, exclusion/recompute, mandatory mask review, print download, browser recovery and mobile overflow checks. A dedicated browser check also verified clearing during a delayed decode and keyboard upload focus; print-plan SVG references rendered correctly and a PDF was captured. The separate synthetic image ran actual OpenCV and pretrained SlimSAM: four masks, 104 cuttable squares, 7.7 seconds measured model stage (including any loading in that run), no external photo POST requests observed. The final public-deployment run passed all three browser checks in 13.8 seconds on this Mac, without authentication. The same checks passed locally. These are engineering fixtures, not camera photographs or segmentation-accuracy measurements. An earlier run exposed an OpenCV loader failure; it was fixed and the complete checks rerun.

| Engineering check | Result | Evidence |
|---|---|---|
| Whole-footprint containment, holes, margins and overlap | Passed | tests/engine.test.ts |
| Unique constrained allocation, shortage and revision guards | Passed | tests/engine.test.ts |
| Session RLE validation and physical export scale | Passed | tests/session.test.ts; tests/export.test.ts |
| Complete browser workflow with synthetic session | Passed | tests/e2e/studio.spec.ts |
| Real OpenCV + pretrained SAM on synthetic image | Passed; 4 masks, 104 squares, 7.7 s | artifacts/vision-check.json (local test artifact) |

Screenshots and local artifacts are retained for review and excluded from the public source. They are not presented as real-paper evaluation.

Capture ten new camera photographs during the hacking window: 4–8 separated flat opaque scraps on contrasting A4, all corners visible. Vary shape, lighting, shadow, capture angle and scarce-colour inventory while retaining supported capture conditions. Keep capture times and conditions. Obtain the first real photograph before claiming an end-to-end proof.

For each input record: source file and capture time; conditions; cold/warm model load; segmentation time; automatic result; corrections needed; reviewed mask result; verified usable tile count; grid; allocation and export time; exclusion/recompute result; failure and next action. Report counts with denominators and raw times.

| Photo | Conditions | Segmentation result | Corrections | Tile count | Timings | Export / recompute |
|---|---|---|---|---|---|---|
| No photographs supplied | Not evaluated | Not run | Not measured | Not measured | Not measured | Not run |

Automated checks to implement: whole tile plus margin inside masks including holes; no source overlaps; unique assignment; preview/export identity; invalidation after corner/mask changes; revised allocation or insufficiency after exclusion; perspective/physical-scale round trip; actual-size printable calibration; provider-failure recovery.

Physical proof requires human work: print plans at 100%, measure the calibration square with a ruler, cut and assemble one small collage, and photograph original scraps, software preview, plans and result together. Record the measured square and the actual differences; do not manufacture an assembly image or claim it was built from an unrelated result.

Record a raw 20–30-second real end-to-end demonstration before expanding features. Later produce the public narrated captioned 2–3-minute video. Automated playback must stay muted.

Public release verified: https://offcut-six.vercel.app . The first generic-framework deployment served a 404; explicit Next.js configuration corrected it before release verification.
