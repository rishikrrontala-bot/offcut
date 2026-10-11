# OFFCUT — win contract

Banana Hacks 2026: https://banana-hacks-1111.devpost.com/ . Solo student entrant **Rishik Rontala**. Intended awards: overall and Best Creative Tool. Protect **October 11, 2026, 9:59 p.m. EDT** for submission; conservative final cutoff **11:59 p.m. EDT**.

Required entry: public source, working app, PUBLIC YouTube demo of two to three minutes, at most 500 words describing inspiration/design/resources/result, and truthful attribution. Ceremony-specific constraints remain unverified; Rishik authorized continuation under the published Image AI theme.

## User, problem and difference

Students, art clubs and teachers have irregular coloured scraps but cannot easily plan an artwork around their finite material. OFFCUT turns those scraps into an inspectable inventory and uniquely mapped cutting/assembly plan. Compared with [Sozofix’s photo-to-reuse guidance](https://www.kaggle.com/competitions/banana/writeups/sozofix-ai-diy-assistant), the intended distinction is a finite source inventory, one-use pieces and calibrated physical locations. No competitor code or assets were reused.

## Decisive proof

New camera photograph → reviewed pretrained segmentation and calibrated geometry → unique cuttable inventory → constrained allocation using actual image crops → trace each piece to its source → remove scarce paper and recompute → actual-size numbered plan → human-cut physical result.

The software portion is demonstrated on illustrated engineering input. The camera and physical portion remains missing and cannot be manufactured by synthetic testing.

| Judging criterion | Claim and evidence | Current status |
|---|---|---|
| Technical Execution and Difficulty | Real SlimSAM/OpenCV, whole-mask containment, unique Hungarian assignment, source/export correspondence, recovery and scale checks | Measured in 59 unit tests (1.90 s), nine local browser checks (31.7 s) and nine public checks (35.4 s); real-photo accuracy missing |
| Innovation and Creativity | Artwork is constrained by finite material; each cell traces to one unique source; exclusion changes the feasible inventory and output | Shown in software and the captured 2:22 narrated exclusion/recompute recording |
| Use of the Image AI Theme | Learned segmentation converts irregular visual input into editable material regions; target upload is the explicit generation fallback | Actual pretrained inference shown; no generated-image claim |
| Impact and Usefulness | A maker can follow numbered, calibrated plans using their own scraps | Plans exported and software checked; ruler-verified physical assembly and human usability proof missing |
| Design, Presentation and Demo | Quiet paper studio, inspectable previews, captions/narration, public app and concise entry | Studio checked including mobile; final 2:22 video and inspected gallery publicly available; YouTube/Devpost unverified |

No official weights have been verified. Equal-weight review means are estimates, not event scores.

## Completion priorities

The final recording/media is published on the website and all nine public browser checks pass. Keep evidence/attribution synchronized. Obtain supported real photographs and one measured assembly when Rishik supplies materials. Publish the required public YouTube URL and submit the honest entry before the protected time.

Do not add accounts, marketplaces, custom training, arbitrary nesting or secondary creative pipelines. Do not let optional polish displace submission. Missing physical evidence lowers the usefulness claim; a polished illustration must remain labelled.
