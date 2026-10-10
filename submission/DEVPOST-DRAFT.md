DRAFT — NOT SUBMITTED

# OFFCUT: make something from what’s left

## Inspiration
Leftover coloured paper is difficult to plan around: each scrap has a different shape, colour and capacity. OFFCUT starts with the material a person actually has, then makes a small collage they can inspect and assemble. Built solo by Rishik Rontala for Banana Hacks 2026.

## What it does
Photograph 4–8 separated scraps on a contrasting portrait A4 sheet. Confirm the sheet’s four corners and short top edge. OpenCV corrects perspective; a real pretrained SlimSAM model proposes scrap masks in the browser. Review the boundaries and correct them with a brush or keyboard rectangle tool.

Upload a simple target image. OFFCUT finds 12 mm squares whose entire footprint and 1 mm margin fit inside reviewed paper. It assigns unique source pieces to a 6×6 or 8×8 layout. Background cells need real paper too; insufficient capacity blocks output.

The achievable artwork uses photographic crops without recolouring or reusing a source square. Click a cell to reveal its exact location in the original photograph. Exclude a scarce colour and an already-reviewed collage recomputes from what remains.

Download numbered actual-size cutting and assembly plans. A 20 mm calibration square lets the maker check print scale before cutting 12 mm pieces. Save locally or download a portable project.

## How it was built
Next.js, React and Tailwind form the studio. OpenCV supplies calibrated geometry; SlimSAM via Transformers.js supplies learned segmentation. Pure TypeScript validates containment and performs a Hungarian assignment using CIELAB colour distance. Photos stay browser-local; model weights download separately.

Codex coordinated implementation and verification. Featherless GLM-5.3-Flash supplied reviewed export repairs and draft assistance; GLM-5.3 attempts returned incomplete output. Credit goes to OpenCV, Transformers.js, SlimSAM, Meta SAM and Xenova for the pretrained tools.

## Challenges and evidence
Physical scale, unique source correspondence and model review had to survive the entire workflow. Fourteen unit tests and three browser checks pass, including actual pretrained inference on a synthetic engineering image: four masks and 104 cuttable squares. This does not establish real-photo accuracy. Image generation is unavailable; target upload is the explicit fallback.

Ten newly captured photographs, a ruler-verified physical assembly and the public narrated demo remain outstanding. No waste-saving or physical-result claim is made before those checks.

Public source: https://github.com/rishikrrontala-bot/offcut
Live app: https://offcut-six.vercel.app
