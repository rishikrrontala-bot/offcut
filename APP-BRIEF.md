You're working in a fresh repo where we are going to build OFFCUT.

You are an expert software architect who specializes in writing detailed app briefs and building MVPs for hackathons.

I am participating solo in Banana Hacks 2026. Here is the problem statement, copied from the official hackathon description:

“Build apps, games, and tools that solve real problems in a weekend around Image AI.”

Official event: https://banana-hacks-1111.devpost.com/

Use the hackathon-proof-loop skill and its hackathon-win workflow. Think deeply about the problem, picture the complete experience, nail the scope, and then build the finished product.

Keep every project file, asset, evaluation, document, and demo artifact under:

/Users/rishikrontala/Codex/HACKATHONS/banana-hacks/

Check whether rishikrrontala-bot already has an empty repository for this event before creating one.

EVENT CONSTRAINTS

- Check the challenge announced at the opening ceremony before committing to implementation.
- Begin project code, assets, and evaluation data after October 9, 2026, at 8:45 p.m. EDT.
- Protect October 11 at 9:59 p.m. EDT for submission. Use 11:59 p.m. EDT as the conservative final cutoff.
- Build fresh for Banana Hacks. Do not reuse an earlier hackathon project or cross-submit this project elsewhere.
- Deliver public GitHub source, a working demo, a PUBLIC YouTube video between 2 and 3 minutes, and a Devpost write-up of at most 500 words.
- Include brainstorming, inspiration, design decisions, resources, and the actual finished result.
- Credit libraries, pretrained models, datasets, and AI development tools.
- Verify the current submission portal. Complete the required Devpost description and use the preferred website route if available.

Sources:
https://www.bananahacks.tech/schedule
https://www.bananahacks.tech/code-of-conduct
https://www.bananahacks.tech/faq
https://www.bananahacks.tech/prizes

1. PRODUCT OVERVIEW

Product name: OFFCUT  
Tagline: “Make something from what’s left.”

Core problem:
A student or art teacher has leftover coloured paper but cannot easily turn that irregular, limited inventory into a recognisable piece of art.

Core objective:
Take a real photograph of those scraps and produce a collage the user can physically assemble, including a numbered cutting map and assembly guide.

The decisive product rule:
Every piece shown in the final collage must correspond to one unique, cuttable region of the photographed paper. Never invent extra material, reuse the same physical piece, or recolour the final preview.

Target user:
Students, art clubs, and teachers making small paper mosaics from leftover materials.

Reference style / UX vibe:
Claude artifacts style: a quiet workspace with controls beside a large, inspectable visual result. Use warm paper tones, ink typography, precise labels, generous spacing, and restrained motion. Let the real paper textures provide the colour.

Include tasteful “Built by Rishik Rontala” credit. Document the visual direction in DESIGN.md.

2. FEATURE SCOPE — A COMPLETE MVP WITHIN 24–48 HOURS

Must-have Core Feature 1: Photograph → buildable collage

Support one deliberately narrow input:
4–8 flat, opaque, coloured paper scraps, separated on a contrasting A4 reference sheet, photographed with all four sheet corners visible.

The complete pipeline:

1. Upload the photograph and confirm the reference-sheet corners.
2. Correct perspective and establish physical scale.
3. Use image segmentation to isolate the scraps.
4. Show the detected boundaries for user review.
5. Extract non-overlapping square tiles entirely inside the usable scrap regions, with a cutting margin.
6. Ask for a simple subject such as a bird, flower, mountain, or rocket.
7. Generate a high-contrast visual target informed by the photographed palette.
8. Assign each target cell to a unique physical source tile using a capacity-aware matching algorithm.
9. Render the final collage from the actual photographed tile textures.
10. Export the source cutting map and numbered assembly sheet.

Use approximately 12 mm tiles initially. Choose the output grid from the verified available inventory. Start with 6×6 or 8×8 designs; do not promise arbitrary portraits or unlimited resolution.

If there is insufficient material, explain what is missing and let the user reduce the grid or add paper.

Essential Supporting Feature 2: Review and recompute

Allow users to correct sheet corners and scrap masks, exclude a scrap, and recompute the collage.

Clicking a collage tile must highlight its exact location in the original photograph. Preserve this correspondence in the exported instructions.

The judge’s wow moment:
Remove a scarce coloured scrap. The artwork visibly adapts to the remaining material, and every resulting piece remains traceable.

Explicitly EXCLUDE:
Accounts, collaboration, marketplaces, arbitrary polygon nesting, fabric repair, 3D reconstruction, custom model training, community galleries, and secondary creative pipelines.

3. TECH STACK

- Frontend: Next.js, TypeScript, Tailwind CSS.
- Visual workspace: Canvas for texture previews; SVG for inspectable overlays and printable plans.
- Computer vision: OpenCV.js for perspective correction and geometry; a pretrained segmentation model such as SAM 2 through a verified inference endpoint.
- Image generation: a currently supported Gemini image-generation model, selected after a real availability and quota check.
- Custom engine: pure TypeScript functions for tile extraction, colour comparison, unique allocation, and export validation.
- Backend: minimal server routes for model calls. Keep secrets server-side.
- Storage: local session state and downloadable project files. No database required.
- Verification: Vitest for geometry and allocation; Playwright for the complete browser journey.

Check current official documentation and model licences before integration. Benchmark the model calls on real paper photographs before polishing the interface.

If generation is unavailable, accept a user-provided target image and retain the same segmentation, allocation, and export workflow. Show the unavailable feature honestly.

Explain which images leave the browser. Do not claim everything runs locally when hosted models are involved.

4. PAGES & USER FLOW

Build one studio with three connected areas:

- Input: photograph, capture guidance, subject, and grid size.
- Material map: detected scraps, usable tiles, and highlighted cutting locations.
- Artwork: the actual achievable collage, with source tracing and export controls.

User journey:

Photograph scraps → review detection → choose subject → generate target → inspect achievable collage → adjust materials → download cutting and assembly sheets → make the physical artwork.

Handle unsupported files, blurry photographs, missing corners, overlapping scraps, insufficient paper, model failures, and export errors with specific next actions.

The output should reveal something useful:
“This design can be made with these materials, and here is exactly where every piece comes from.”

5. PROOF, TESTS, AND DOCUMENTATION

Build the smallest real end-to-end proof first and record a raw 20–30 second demonstration before expanding.

Verify these properties:

- No source tile is used twice.
- Source tiles never overlap.
- Every tile stays inside its approved scrap mask.
- Target cells and exported instructions reference the same source IDs.
- Removing material produces a valid revised allocation or an honest insufficiency result.
- Perspective correction and physical dimensions survive export.
- Printable plans include a calibration square and instructions to print at actual size.
- Provider failures preserve the user’s work and permit recovery.

Evaluate on at least ten newly captured photographs with different scrap shapes and lighting. Report actual successes, failures, and timings.

Physically assemble one small collage from the exported plan. Show the photographed materials, software preview, instructions, and assembled result together.

Write APP-BRIEF.md, WIN-CONTRACT.md, DESIGN.md, README.md, LIMITATIONS.md, and a concise evaluation report.

State the limitations plainly: flat separated paper, controlled capture conditions, approximate colour under changing light, simple subjects, square pieces, and user review before cutting.

6. DEMO AND SUBMISSION

Aim primarily for the overall award and Best Creative Tool.

Banana Hacks is a first edition. Use comparable winners as research references, clearly labelled with their actual events. Study how SingleShot3D, AI Font Generation, and Thistle turn visual input into a usable result.

Map the five judging criteria to visible evidence:

- Technical execution: segmentation, geometry, constrained allocation, and verified export.
- Innovation: creative output bound to actual finite materials.
- Image AI: automatic material extraction and visual target generation.
- Usefulness: a physically assembled collage.
- Presentation: clear input-to-output transformation and readable instructions.

Prepare a narrated, captioned public YouTube demo around 2 minutes 30 seconds:

- Open immediately on the paper-to-art transformation.
- Explain the user’s problem.
- Show one uninterrupted real workflow.
- Trace a tile back to its source.
- Remove a scrap and recompute.
- Show the physical assembly.
- Explain the engineering and one honest limitation.

Budget time explicitly for the demo and submission. Freeze optional features before the final block.

Verify the deployed workflow, public repository, video visibility, and submission links without requiring login. During automated checks, keep audio muted.

Complete the submission materials and report the actual submission status. Never claim an entry was submitted without confirmation.

IMPLEMENTATION STANDARD — PRESERVE WORD FOR WORD

Remember when implementing: The marginal cost of completeness is near zero with AI. Do the whole thing. Do it right. Do it with tests. Do it with documentation. Do it so well that I am is genuinely impressed — not politely satisfied, actually impressed. Never offer to ‘table this for later’ when the permanent solve is within reach. Never leave a dangling thread when tying it off takes five more minutes. Never present a workaround when the real fix exists. The standard isn’t ‘good enough’ — it’s ‘holy shit, that’s done.’ Search before building. Test before shipping. Ship the complete thing. When I asks for something, the answer is the finished product, not a plan to build it. Time is not an excuse. Fatigue is not an excuse. Complexity is not an excuse. Boil the ocean.

Apply that completeness standard to the committed scope: a working visual pipeline, trustworthy physical instructions, meaningful tests, honest documentation, a strong demo, and a verified submission.

EVENT-TIME IMPLEMENTATION STATUS

The time gate passed before code began. Ceremony-specific constraints remain unverified; after being asked for the announcement, Rishik instructed continuation under the published Image AI theme. The scoped software is implemented and undergoing actual browser verification. The original brief and implementation standard above are preserved verbatim.

OpenCV.js performs calibrated perspective correction. Browser-local pretrained SlimSAM through Transformers.js predicts user-reviewable masks; contrast only proposes points. Core containment and unique allocation are pure TypeScript. Direct Gemini generation was withheld for the intended student audience; target upload is the authorized, clearly labelled fallback. Featherless GLM models received actual development jobs with a private reserved-cost ledger; reviewed Flash export code was integrated, while incomplete hard-model output was rejected. No key or private billing/worker record is in the source directory.

Ten new camera photographs, physical assembly, public narrated captioned video and verified submission remain evidence obligations. Do not count synthetic tests or planned actions as completed proof.

Sources: https://www.bananahacks.tech/code-of-conduct ; https://banana-hacks-1111.devpost.com/updates ; https://www.bananahacks.tech/schedule
