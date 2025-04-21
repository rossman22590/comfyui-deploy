import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

// Function to ensure all machine configurations have the required format
function ensureRequiredNodes(config: any = {}) {
  // Create a new config with the exact format specified
  const standardConfig: any = {
    "comfyui": "93292bc450dd291925c45adea00ebedb8a3209ef",
    "git_custom_nodes": {
      "https://github.com/rossman22590/comfyui-deploy.git": {
        "hash": "40fc9d2914b8f1fc68534635146241d2cebca72b",
        "disabled": false
      }
    },
    "file_custom_nodes": []
  };

  // Add base_model for internal use, but don't include in export
  standardConfig.base_model = "SD1.5";

  // If user provided custom nodes, preserve them but ensure our required format
  if (config.git_custom_nodes) {
    // First make sure we have the comfyui-deploy repo with the EXACT hash specified
    const otherNodes = Object.entries(config.git_custom_nodes)
      .filter(([url]) => url !== "https://github.com/rossman22590/comfyui-deploy.git")
      .reduce<Record<string, any>>((acc, [url, nodeConfig]) => {
        acc[url] = nodeConfig;
        return acc;
      }, {});

    // Then merge them, ensuring comfyui-deploy comes first
    standardConfig.git_custom_nodes = {
      "https://github.com/rossman22590/comfyui-deploy.git": {
        "hash": "40fc9d2914b8f1fc68534635146241d2cebca72b",
        "disabled": false
      },
      ...otherNodes
    };
  }

  console.log("Using standardized machine config:", standardConfig);
  return standardConfig;
}

function extractModelData(message: string) {
  try {
    // Try to find JSON in the message
    const jsonMatch = message.match(/\[.*\]/s);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      try {
        // Try to parse the JSON
        const modelData = JSON.parse(jsonString);
        if (Array.isArray(modelData) && modelData.length > 0 && 'url' in modelData[0]) {
          console.log("Successfully extracted model data from JSON", modelData);
          return modelData;
        }
      } catch (err) {
        console.log("Error parsing model JSON:", err);
      }
    }

    // Check for URL patterns
    const urlMatches = message.match(/https?:\/\/[^\s"']+/g);
    if (urlMatches && urlMatches.length > 0) {
      // If we found URLs but couldn't parse JSON, create basic model entries
      return urlMatches.map(url => ({
        url,
        name: url.split('/').pop() || 'model',
        type: 'checkpoints',
        filename: url.split('/').pop() || 'model.safetensors',
        save_path: 'default'
      }));
    }
  } catch (error) {
    console.error("Error extracting model data:", error);
  }
  return null;
}

// Function to build tools for OpenAI function calling
const buildTools = (machineConfig: any, models: any[]) => {
  return [
    {
      type: "function" as const,
      function: {
        name: "update_machine_config",
        description: "Update the machine configuration with new settings",
        parameters: {
          type: "object",
          properties: {
            comfyui: {
              type: "string",
              description: "The ComfyUI version",
            },
            comfyui_hash: {
              type: "string",
              description: "The ComfyUI hash",
            },
            git_custom_nodes: {
              type: "object",
              description: "Custom nodes to include in the config",
              additionalProperties: {
                type: "object",
                properties: {
                  hash: { type: "string" },
                  disabled: { type: "boolean" },
                },
              },
            },
          },
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "update_models",
        description: "Update the models configuration",
        parameters: {
          type: "object",
          properties: {
            models: {
              type: "array",
              description: "List of models to use",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  base: { type: "string" },
                  save_path: { type: "string" },
                  description: { type: "string" },
                  reference: { type: "string" },
                  filename: { type: "string" },
                  url: { type: "string" },
                },
              },
            },
          },
        }
      }
    }
  ];
};

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Define machine configuration update function
const updateMachineConfigFn = {
  name: 'update_machine_config',
  description: 'Update a machine configuration by adding a new model or custom nodes',
  parameters: {
    type: 'object',
    properties: {
      machineConfig: {
        type: 'object',
        description: 'The updated machine configuration',
        properties: {
          comfyui: { type: 'string', description: 'ComfyUI version' },
          git_custom_nodes: {
            type: 'object',
            description: 'Custom node repositories',
            additionalProperties: true
          },
          file_custom_nodes: {
            type: 'array',
            description: 'Custom file nodes',
            items: {
              type: 'string'
            }
          }
        }
      },
      models: {
        type: 'array',
        description: 'Updated models list',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            base: { type: 'string' },
            save_path: { type: 'string' },
            description: { type: 'string' },
            reference: { type: 'string' },
            filename: { type: 'string' },
            url: { type: 'string' }
          },
          additionalProperties: true
        }
      }
    },
    required: ['machineConfig']
  }
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get request body
    const body = await req.json();
    const { message, messageId, enable_function_calling = false, machineConfig, models } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Check for "Create Machine" command explicitly
    const isCreateMachineCommand =
      message.toLowerCase().includes("create machine") ||
      message.toLowerCase().includes("add machine") ||
      message.toLowerCase().includes("setup machine");

    // Prepare initial configs
    let updatedMachineConfig = machineConfig || {};
    let updatedModels = models || [];

    // If this is a create machine command and no config exists, create default
    if (isCreateMachineCommand && (!machineConfig || Object.keys(machineConfig).length === 0)) {
      console.log("Creating default machine config for 'Create Machine' command");

      // Create default machine config
      updatedMachineConfig = {
        comfyui: "93292bc450dd291925c45adea00ebedb8a3209ef",
        comfyui_hash: "93292bc450dd291925c45adea00ebedb8a3209ef",
        git_custom_nodes: {
          "https://github.com/rossman22590/comfyui-deploy.git": {
            "hash": "40fc9d2914b8f1fc68534635146241d2cebca72b",
            "disabled": false
          }
        },
        file_custom_nodes: []
      };

      // Add a default model if we don't have any
      if (!updatedModels || updatedModels.length === 0) {
        updatedModels = [{
          url: "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors",
          base: "SD1.5",
          name: "v1-5-pruned-emaonly.safetensors",
          type: "checkpoints",
          filename: "v1-5-pruned-emaonly.safetensors",
          reference: "https://huggingface.co/runwayml/stable-diffusion-v1-5",
          save_path: "default",
          description: "Stable Diffusion 1.5 base model"
        }];
      }

      // Since we've created a machine, return immediately
      return NextResponse.json({
        response: "I've created a new machine configuration with ComfyUI and the essential custom nodes. It includes the Stable Diffusion 1.5 model as a starting point. You can now use this machine to generate images with ComfyUI workflows.",
        updated_machine_config: updatedMachineConfig,
        updated_models: updatedModels
      });
    }

    // Configure OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare the tools if function calling is enabled
    const tools = enable_function_calling ? buildTools(machineConfig, models) : [];

    // Prepare the system message with context about the assistant's purpose
    const systemMessage = {
      role: "system",
      content: `You are ComfyUI Assistant, a helpful and friendly AI assistant specialized in helping users with ComfyUI, a powerful UI for Stable Diffusion.
      
Current date: ${new Date().toISOString().split('T')[0]}

${machineConfig ? `The user has a machine with the following configuration:
\`\`\`json
${JSON.stringify(machineConfig, null, 2)}
\`\`\`
` : ''}

${models && models.length > 0 ? `The user has the following models:
\`\`\`json
${JSON.stringify(models, null, 2)}
\`\`\`
` : ''}

If the user asks to create, update, or modify a machine configuration or models, you should use the appropriate function call.
If they share a ComfyUI workflow, analyze it and explain what it does in detail.`
    };

    // Prepare messages for the API call
    const messages = [
      systemMessage,
      { role: "user", content: message }
    ];

    try {
      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: messages as any, // Type assertion to handle typing issues
        tools: tools.length > 0 ? tools : undefined,
        stream: false,
      });

      // Process function calls if any
      let responseText = response.choices[0]?.message?.content || "";

      if (response.choices[0]?.message?.tool_calls && response.choices[0]?.message?.tool_calls.length > 0) {
        for (const toolCall of response.choices[0].message.tool_calls) {
          if (toolCall.function.name === "update_machine_config") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              updatedMachineConfig = {
                ...updatedMachineConfig,
                ...args
              };
              // If this is the first time creating a machine config, ensure we have the deploy node
              if (!updatedMachineConfig.git_custom_nodes ||
                !Object.keys(updatedMachineConfig.git_custom_nodes).includes("https://github.com/rossman22590/comfyui-deploy.git")) {
                if (!updatedMachineConfig.git_custom_nodes) updatedMachineConfig.git_custom_nodes = {};
                updatedMachineConfig.git_custom_nodes["https://github.com/rossman22590/comfyui-deploy.git"] = {
                  "hash": "40fc9d2914b8f1fc68534635146241d2cebca72b",
                  "disabled": false
                };
              }
            } catch (error) {
              console.error("Error parsing update_machine_config arguments:", error);
            }
          } else if (toolCall.function.name === "update_models") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              if (args.models && Array.isArray(args.models)) {
                updatedModels = args.models;
              }
            } catch (error) {
              console.error("Error parsing update_models arguments:", error);
            }
          }
        }
      }

      // Return the response with updated configs
      return NextResponse.json({
        response: responseText || "I've updated your configuration.",
        updated_machine_config: updatedMachineConfig,
        updated_models: updatedModels
      });
    } catch (error) {
      console.error("Error processing OpenAI request:", error);
      return NextResponse.json(
        { error: "Failed to process request: " + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
