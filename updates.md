# ComfyUI 0.3.68 Compatibility Updates

Date: 2025-11-06

- custom_routes.py: post_prompt now enqueues 6-tuple to ComfyUI with sensitive set to [] (iterable) to match new API.
- comfy-nodes/external_video.py: requeue_workflow_unchecked and requeue_workflow updated to enqueue 6-tuple with sensitive=[] and to read currently_running tuples robustly across versions.
- custom_routes.py: swizzle_execute changed to signature-agnostic (*args/**kwargs) to support execute_async adding ui_node_outputs.
- custom_routes.py: validate_prompt handling normalized to support async/sync implementations and multiple signatures (3-arg, 2-arg, 1-arg).
- custom_routes.py: send_json override fixed to avoid recursion and to properly call/await the original send_json, preventing partial SSE writes and coroutine warnings.

Notes:
- Streaming path uses post_prompt, so it inherits the enqueue fix.
- Restart ComfyUI after updating, and ensure the instance loads these patched files from /comfyui/custom_nodes/comfyui-deploy.
