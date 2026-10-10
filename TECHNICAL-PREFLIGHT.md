# OFFCUT — technical integration

Implementation now uses Node 22, Next.js 16.4.0 (Webpack), Transformers.js **4.3.1**, OpenCV.js **4.11.0-release.1**, React 19 and Tailwind 4. The earlier 3.8.1 preflight choice was replaced after dependency security review; the supported low-level SAM APIs were checked in the installed 4.3.1 source and actual browser inference passed. Dependency audit reported zero known vulnerabilities at the verified lockfile.

The OpenCV UMD runtime is copied from the pinned package during explicit build/dev preparation, served from the same origin and awaited before getPerspectiveTransform/warpPerspective. Allocated Mats are deleted. Inverse homography maps selected source tiles back to the original photograph.

SlimSAM runs WASM/q8 in a browser worker. The photograph is encoded once per detection, then separate point prompt groups use the image embeddings for decoder output. Three candidate masks per group are postprocessed to full sheet dimensions; area/IoU filtering selects proposals. Manual correction does not rerun the model. All masks require explicit review. Contrast only supplies seed points, not learned mask results. The generic mask-generation pipeline is not used.

The completed browser check produced 4 masks and 104 squares from a clearly labelled synthetic engineering image in a measured 7.9-second model stage. This is neither a camera-photo benchmark nor an accuracy claim. Real cold/warm download, encoder/decoder and correction timing still require the first camera photograph.

Input photo validation, finite A4 corner geometry, fully contained tiles with a 1 mm margin, unique allocation and stale-revision rejection are verified. Next's native ONNX/Sharp server modules are excluded from browser bundles; Webpack is explicit.

Primary references:
- https://github.com/huggingface/transformers.js/releases
- https://huggingface.co/docs/transformers.js/en/api/models#sammodel
- https://huggingface.co/spaces/Xenova/segment-anything-web/blob/main/worker.js
- https://huggingface.co/Xenova/slimsam-77-uniform/tree/main/onnx
- https://github.com/czg1225/SlimSAM/blob/master/LICENSE
- https://github.com/TechStark/opencv-js
- https://docs.opencv.org/4.11.0/dd/d52/tutorial_js_geometric_transformations.html
- https://nextjs.org/docs/app/getting-started/installation

Direct Gemini image generation remains withheld for the student-facing app under researched age/audience restrictions. OFFCUT clearly uses the authorized target-upload fallback and actual pretrained segmentation.
