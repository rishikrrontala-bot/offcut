# OFFCUT — Make something from what’s left.

## Inspiration
The hardest part of using leftover coloured paper is planning around what remains. A design can ask for colours or pieces you simply do not have. OFFCUT reverses that process: the available material sets the creative constraint. I built it solo for students, art clubs and teachers making small paper mosaics.

## What it does
Photograph 4–8 separated scraps on a contrasting A4 sheet. Confirm the four corners; OpenCV corrects perspective and establishes scale. A real pretrained SlimSAM model proposes paper boundaries in the browser. Inspect them, refine missed areas or erase mistakes, and explicitly confirm review before making a collage.

Choose a Heart, Flower or Bird pattern in your paper’s palette, or upload a simple target. OFFCUT extracts 12 mm squares whose complete footprint plus a 1 mm margin fits inside reviewed paper. It assigns each target cell one unique source square. Backgrounds consume paper too; insufficient material produces an actionable shortage instead of invented pieces.

The preview uses original image crops without recolouring. Click a collage cell to find its precise source in the original photograph. Remove a scarce scrap and recompute from the remaining inventory. Download numbered cutting and assembly plans, check the 20 mm print-calibration square, or save the project locally.

## How I built it
Next.js, React and Tailwind create a quiet paper-and-ink studio. OpenCV supplies perspective geometry; SlimSAM through Transformers.js supplies learned segmentation. Pure TypeScript checks containment and performs capacity-aware Hungarian matching in CIELAB colour space. Photos and target images stay in the browser; model weights download separately.

I considered generated targets, but chose the explicit target-upload fallback for the intended student audience. Designed patterns are labelled templates, not generated images. Image AI remains essential: it turns irregular scraps into an editable material inventory.

## Challenges, results and what I learned
Keeping physical scale and source identity consistent through segmentation, allocation, restoration and export was the main engineering challenge. The build passes 59 unit tests and nine local browser checks, plus type checking and production compilation. Its captioned, narrated 2:22 engineering recording shows real pretrained inference, unique allocation, source tracing and material removal/recompute on a clearly labelled illustration, with no hardcoded masks.

I learned that a convincing preview is only half the problem: trustworthy creative tools must preserve the path back to the material. Ten real-camera evaluations and one ruler-checked physical assembly remain unverified. No waste-reduction or physical-success claim is made. Those measurements are the next validation step.

## Credits
Built by Rishik Rontala. OpenCV, Transformers.js, Xenova’s SlimSAM weights, SlimSAM/Meta SAM, Next.js, React, Tailwind, Vitest, Playwright and Fontsource support the build. Codex and Featherless GLM models assisted development and review, with native Codex completing final improvements after broader model authorization. No event-specific model training was performed.
