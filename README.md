ComfyUI Deploy (Pixio API Worker + Compatibility Notice)

ComfyUI 0.3.68 introduced breaking changes that affect custom node integrations:
- Prompt queue now expects a 6‑tuple with a “sensitive” field (iterable).
- execute/execute_async signatures may include ui_node_outputs.
- Frontend event streaming behavior changed; extensions overriding send_json must avoid recursion and properly await async calls.

This fork powers the Pixio API Worker integration for ComfyUI (see --comfy-api-base usage) and has been updated for 0.3.68.
For the latest maintained version and migration guidance, use:
https://github.com/rossman22590/comfyui-deploy

If you run older ComfyUI versions, ensure enqueue compatibility (5‑tuple vs 6‑tuple) or migrate to the repo above for a maintained path.
