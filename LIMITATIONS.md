# OFFCUT — limitations and evidence boundaries

- Supports flat, opaque, separated coloured paper on a contrasting portrait **A4** reference. US Letter is a different size. Fabric, translucent paper, overlap, curled scraps and 3D objects are unsupported.
- Correct A4 dimensions and confirmed corners establish scale. Perspective correction cannot recover lens distortion, a wrong sheet size or curling.
- Learned segmentation is a proposal, not a cutting guarantee. A human must inspect every boundary. Shadows, blur, torn edges, holes and low contrast can require brush/rectangle corrections or positive/negative SAM prompts; a clearer photograph may still be necessary. Contrast proposes automatic prompts, not final learned masks.
- The 1 mm mask margin and 14 mm extraction lattice are conservative only when the reviewed mask is correct. Packing is square-based and can yield fewer pieces than a human’s optimal arrangement.
- Colour matching reflects photographed lighting; it does not establish recognisability, printer colour accuracy or a perceptual quality score. Uploaded targets are centrally cropped without stretching and resampled to 6 × 6 or 8 × 8. Off-centre subjects can be omitted; crop placement is not adjustable.
- The achievable preview uses original source-image crops without recolouring or source reuse. Background cells also require actual material. Insufficient capacity blocks output. Simple subjects are appropriate.
- Image generation is unavailable. Heart/Flower/Bird are labelled designed templates; uploading a target is the authorized fallback. The subject note does not invoke a text or image model.
- Model weights and WASM runtimes need a first-time network download. Real-paper cold/warm latency and performance on other devices are unmeasured. Older phones can encounter browser memory limits.
- Images stay browser-local; hosting/model-download providers receive ordinary connection metadata. IndexedDB data remains until cleared. Project JSON exports contain input images and should be shared deliberately.
- Print at 100% actual size with fit-to-page disabled, then measure both sides of the **20 mm calibration square**. Cutting viewports overlap for context; every Source ID has one primary page and is cut once from the original paper. Printer, cutting and human assembly accuracy remain unmeasured.
- Synthetic fixtures and the illustrated example verify engineering behavior, not real-photo accuracy. **Zero camera inputs have been evaluated; no physical assembly or human usability result is verified.**
- The corrected 2:22 illustrated engineering recording is captured and its final frames were visually inspected. Final public deployment verification, PUBLIC YouTube publication and Devpost submission remain pending. A website-hosted video does not fulfill a specific YouTube requirement.
- Opening-ceremony-specific constraints remain unverified. Continuation under the published Image AI theme was authorized; no unknown constraint is asserted as satisfied.

Current software/media outcomes are in BUILD-STATUS.md and EVALUATION.md. Pending milestones are never counted as completed proof.
