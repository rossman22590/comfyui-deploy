# Secrets Management: Python Implementation Guide

## Overview

This document provides guidelines for implementing the Python side of the secrets management feature in ComfyUI workflows.

## Using Environment Variables in ComfyUI

When deploying ComfyUI machines with secrets, the secret values will be automatically injected as environment variables. Here's how to access them in your custom ComfyUI nodes:

```python
import os

class SecretNodeExample:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt": ("STRING", {"multiline": True}),
            },
        }
    
    RETURN_TYPES = ("STRING",)
    FUNCTION = "process"
    CATEGORY = "examples"

    def process(self, prompt):
        # Access secrets via environment variables
        api_key = os.environ.get("OPENAI_API_KEY")
        
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not found")
        
        # Use the API key in your implementation
        # ...

        return (result,)
```

## Best Practices

1. **Always check for existence**: Use `os.environ.get("SECRET_NAME")` rather than direct access to handle cases where the secret might not be set.

2. **Provide fallbacks**: Consider using fallbacks for development environments:
   ```python
   api_key = os.environ.get("OPENAI_API_KEY", "your-dev-key-only-for-local-testing")
   ```

3. **Error handling**: Provide clear error messages when required secrets are missing.

4. **Documentation**: Document which secrets your nodes require so users can configure them properly.

## Example Workflow

1. Create a new custom node that uses environment variables
2. Configure your machine with the required secrets in the web UI
3. Deploy the machine
4. Your node will have access to the secrets at runtime

## Security Considerations

1. **Never log secret values**: Avoid printing or logging secret values in your code.

2. **Don't hardcode sensitive values**: Always use environment variables for sensitive information.

3. **Minimize secret usage scope**: Only access secrets when needed, not during node initialization.

## Testing Locally

When testing locally, you can set environment variables before starting ComfyUI:

```bash
# Linux/Mac
export OPENAI_API_KEY="your-key-here"
python main.py

# Windows
set OPENAI_API_KEY=your-key-here
python main.py
```

This allows you to test your nodes with secrets before deploying to production.
