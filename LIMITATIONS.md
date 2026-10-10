# OFFCUT — limitations and evidence boundaries

- Supports flat, opaque, separated coloured paper on a contrasting portrait A4 reference. Fabric, translucent paper, overlapping scraps and 3D objects are unsupported.
- Accurate A4 dimensions and confirmed corners are necessary. Perspective calibration cannot recover lens distortion, curled paper or incorrect sheet size.
- Learned segmentation is a proposal, not a cutting guarantee. Inspect every mask. Shadows, torn edges, blur, holes and low contrast can require correction; missed scraps can be prompted manually; a clearer photo can still be necessary. Only contrast-separated regions supply automatic prompts.
- A 1 mm mask margin and 14 mm lattice are conservative but depend on the reviewed mask being correct. Capacity can be lower than a human’s optimal packing.
- Colour matching reflects photographed lighting. It does not guarantee recognisable artwork, printer colour accuracy or a perceptual quality score. Uploaded targets are centrally cropped without stretching and resampled to a square 6×6/8×8 grid. The crop can omit off-centre subjects; crop placement is not adjustable.
- The final preview contains actual photo crops without recolouring. Simple subjects are appropriate; each background cell needs real source material. Insufficient capacity blocks output.
- Image generation is unavailable. Uploaded targets are the authorized fallback, with explicitly designed Heart/Flower/Bird patterns as a convenient alternative. Patterns are not AI-generated images. The subject note does not call a text or image model.
- Model weights and the WASM runtime need a first-time network download. Cold/warm performance on real paper and other devices is unmeasured. Browser memory limits may affect older phones.
- Input images remain browser-local; hosting/model-download providers receive ordinary connection metadata. Local project data persists until cleared. Project exports contain the input photographs and should be shared deliberately.
- Print the HTML plan at 100%, disable fit-to-page, and measure the 20 mm calibration square. Cutting viewports overlap for context; each Source ID has one primary cutting page and is cut once. Human print/cut/assembly accuracy has not been measured.
- Synthetic automated fixtures are engineering checks only. They do not count toward the ten newly captured photographs or establish real-world segmentation accuracy.
- No physical assembly, public narrated video or submitted hackathon entry has been verified. Current software checks and deployment status are recorded separately.
