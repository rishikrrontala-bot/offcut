# OFFCUT Iteration 01 Review

## Scores (0-100, equal weight, mean = (sum)/5)

| Category | Score |
|---|---|
| Technical Execution / Difficulty | 86 |
| Innovation / Creativity | 84 |
| Use of Image AI Theme | 80 |
| Impact / Usefulness | 58 |
| Design / Presentation / Demo | 52 |

**Mean (equal weight, explicit labelled estimate): 72.0**

## Reason per score

### Technical Execution / Difficulty — 86
Evidence covers substantial in-browser implementation: OpenCV perspective warp, pretrained SlimSAM WASM q8 masks, manual positive/negative SAM refinement with one image-embedding cache, keyboard rectangle and paint/erase review, deterministic rectangular Hungarian CIELab matching to 6x6/8x8 targets, full-footprint 12mm square plus 1mm margin extraction, per-paper used/available counts, unique primary cutting page per piece, 5-step undo preserving exact RLE mask arrays, zoom 200% with exact coordinates, PNG pixel-matching photo crop order, IndexedDB private sessions, and no app backend. 56 unit checks passed, types/build passed, and expanded browser journeys pass including actual OpenCV + SAM on synthetic images. This is a wide engineering surface; difficulty is clearly high. No points granted for test count alone; the score reflects the verified capabilities, not the number of tests. No accuracy claims are made for synthetic results, and no camera-photo benchmark exists, which caps the score below the top band.

### Innovation / Creativity — 84
The concept of an offline, browser-only paper-studio that combines physical colour-paper photography, SAM segmentation, deterministic rectangular matching, and per-piece cutting pages is distinctive relative to a generic AI wrapper. Explicitly designed Heart/Flower/Bird targets in actual paper palette, excluding paper before pattern selection, and truthful shortage handling are creative constraints. Aspect-preserving target crop with visible grid-sampled comparison is a strong UX idea. Missing physical assembly and video demo reduce the ability to see the full creative artefact, but the implemented interactions are clearly non-generic.

### Use of Image AI Theme — 80
The submission uses a real pretrained image AI model (SlimSAM WASM q8) for masks, with manual SAM point refinement and missed-paper recovery reusing one embedding. Image AI is central to the pipeline, not decorative. The public ImageAI theme is followed; the ceremony-specific constraint is unverified. No image generation is used, which is acceptable per the brief since an uploaded-image fallback suffices. Score reflects strong, evidenced use of image AI in segmentation and the paper-to-artwork pipeline, held back by absence of any real-photo validation of SAM accuracy.

### Impact / Usefulness — 58
Usefulness is materially limited by missing real-world proof. Zero newly captured camera-paper photos, zero 10-input real-photo benchmark, no human print-scale validation, no completed cuts, and no physical assembly are all absent. User time/utility has not been measured. Synthetic engineering images are explicitly not camera photographs, and no accuracy claims are made for synthetic results. The core pipeline exists and the per-paper shortage messaging is truthful, but impact is judged on what users can do today: no physical proof exists that the system works end-to-end on real paper. Treat missing physical proof materially under impact.

### Design / Presentation / Demo — 52
Evidence describes a coherent warm quiet paper-studio UI, unique cutting pages, navigation mobile jumps, numbers toggle, clear timer with safe cancel, and clean PNG export. However, no public narrated video exists, only a 382-word draft not submitted, and images cannot be visually inspected. The public site and GitHub exist, but this iteration's changes are local pending deployment. Without a demo or visual proof, presentation is assessed on the textual evidence and verified interaction flows, which is moderate but unproven publicly. Missing video is treated materially here.

## 3 biggest remaining gaps

1. No real-photo or physical validation: zero captured camera-paper photos, no 10-input real-photo benchmark, no human print-scale check, no cuts, no completed physical assembly. Until real photos and an assembled artwork are shown, usefulness and accuracy remain unproven.

2. No public narrated demo/video and the iteration is local pending deployment; only a 382-word draft exists and is not submitted. This materially limits assessment of design/presentation and the end-to-end user journey.

3. No user time/utility measurement and no measurement of SAM/matching accuracy on real paper. Synthetic engineering images are explicitly not camera photographs, and no accuracy claims are made for synthetic results, so reliability at the physical 5px/mm scale is not evidenced.

## Notes

- Scores are based on evidenced current state only; planned features are not credited.
- No visual inspection was performed; image-related assessments rely on stated evidence and test descriptions.
- No winning prediction is made.
- Test counts were not rewarded for their own sake; scores reflect verified capabilities and gaps.
- The prior root estimate before improvement was stated as 80/85/85/60/55 (mean 73); this review scores independently and differs due to weight given to missing physical proof and demo material.
- Mean is an explicit labelled equal-weight estimate.