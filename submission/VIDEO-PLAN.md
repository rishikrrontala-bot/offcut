# OFFCUT — Demo Video Plan (2:30) — DRAFT, FOOTAGE NOT RECORDED

Rules: every spoken line is captioned on screen. No audio playback claims. Public YouTube visibility is required on submission. Nothing below marked REQUIRED HUMAN FOOTAGE may be presented as completed work until recorded.

## 0:00–0:20 — The real journey (raw, REQUIRED HUMAN FOOTAGE)
Open with the actual scraps beside the completed physical collage (REQUIRED HUMAN FOOTAGE). Later show an uninterrupted 20–30-second real screen workflow: newly captured photo → corner confirmation → learned masks → review → allocation. Do not replace it with synthetic fixtures or a simulation.
- Narration (captioned): "These leftover pieces are the starting point. OFFCUT finds a collage we can make from this exact paper."

## 0:20–0:45 — Photo to calibrated canvas
Screen recording: corner confirmation on the A4 photo, OpenCV perspective warp to 1050×1485 (5 px/mm).
- Caption: "Manual corner confirm → calibrated 5 px/mm canvas."

## 0:45–1:20 — Local segmentation and mandatory review
Screen recording: SlimSAM (q8, WASM) masks appear locally in-browser; then the mandatory review step — brush + keyboard corrections on a mask. Show a before/after mask.
- Caption: "SlimSAM runs locally. Every mask is human-reviewed — nothing is trusted blindly."

## 1:20–1:50 — Allocation and inspection
Screen recording: Hungarian CIELab allocation on the 6×6 or 8×8 grid; every background cell filled. Click a cell to reveal the exact source scrap via inverse homography. Then exclude one reviewed piece and show recomputation.
- Caption: "Unique Hungarian allocation in CIELab. Real photo crops only — never recoloured. Click to see the source. Exclude → recompute."

## 1:50–2:15 — From screen to paper (REQUIRED HUMAN FOOTAGE)
Download the 20 mm-calibrated, actual-size, numbered cut/assembly plan; then fresh footage of printing, holding a ruler against both sides of the 20 mm calibration square; finished source tiles are 12 mm, cutting one piece, and beginning physical assembly. Keep it honest — show only what has actually been assembled by recording time.
- Caption: "Actual-size plans, ruler-verified, cut and numbered."

## 2:15–2:30 — Close
Screen recording of IndexedDB/project JSON save, link to https://github.com/rishikrrontala-bot/offcut (live app: https://offcut-six.vercel.app).
- Caption: "Built solo by Rishik Rontala for Banana Hacks 2026. SlimSAM + Transformers.js + OpenCV. Your photographs and project stay in your browser."

## Pre-flight checklist
- [ ] Record all REQUIRED HUMAN FOOTAGE (paper photo, ruler measurement, assembly)
- [ ] Captions present for every spoken line
- [ ] No claims of accuracy, waste savings, or completed assembly beyond recorded evidence
- [ ] Public YouTube visibility enabled at submission

## Root review corrections

The reviewed plan has no invented personal backstory. A4 corners belong to the sheet, not the scraps. Calibration is 20 mm; cut tiles are 12 mm. The raw screen workflow must use a newly captured real photograph. Physical footage is still required and no video has been recorded.
