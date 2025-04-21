import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Message {
  role: string;
  content: string;
  sender?: string;
  text?: string;
}

interface Citation {
  text: string;
  url: string;
  title: string;
}

interface PerplexityResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  web_search?: {
    context?: {
      content?: string;
      url?: string;
      title?: string;
    }[];
  };
}

// Direct implementation instead of router
export async function POST(request: Request) {
  try {
    // Parse request body
    const req = await request.json();
    const {
      messages,
      include_thinking = false,
      return_related_questions = false,
      use_function_calling = false,
      machineConfig = null,
      models = null,
      disable_web_search = false
    } = req;

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages must be provided as an array" }, { status: 400 });
    }

    // Get the last user message to check for special content
    const lastMessage = messages[messages.length - 1];
    const lastUserMessage = lastMessage?.content || lastMessage?.text || "";

    console.log("Last user message:", lastUserMessage);

    // Check if it's a ComfyUI workflow JSON
    const isComfyUIWorkflow = (text: string): boolean => {
      try {
        const json = JSON.parse(text);
        return json &&
          typeof json === 'object' &&
          json.nodes &&
          Array.isArray(json.nodes) &&
          json.links &&
          Array.isArray(json.links);
      } catch (e) {
        return false;
      }
    };

    // Check for ComfyUI workflow - skip web search completely for these
    if (isComfyUIWorkflow(lastUserMessage)) {
      console.log("ComfyUI workflow detected, skipping API calls");
      return NextResponse.json({
        response: lastUserMessage, // Return the workflow as-is
        thinking: "",
        citations: [],
        related_questions: []
      });
    }

    // Check for model URL/JSON patterns in the message
    const hasModelUrl = /\"url\":\s*\"https?:\/\/[^\"]+\"/.test(lastUserMessage);
    const hasModelJson = /\[\s*\{\s*\"url\"/.test(lastUserMessage) ||
      (lastUserMessage.includes('"url"') &&
        lastUserMessage.includes('"type"') &&
        lastUserMessage.includes('"filename"'));

    // Direct check for common machine creation phrases with typos
    if (lastUserMessage.toLowerCase().includes("create ma") ||
      lastUserMessage.toLowerCase().includes("creat ma") ||
      lastUserMessage.toLowerCase().includes("setup ma") ||
      lastUserMessage.toLowerCase().includes("new mach") ||
      lastUserMessage.toLowerCase().includes("make ma") ||
      lastUserMessage.toLowerCase().includes("create machine") ||
      lastUserMessage.toLowerCase().match(/\bma[ch][ci][hn]e\b/) ||
      lastUserMessage.toLowerCase().includes("emachine") ||
      hasModelJson || hasModelUrl) {
      console.log("Machine creation detected via direct check");
      // Forward to OpenAI API for machine creation
      return forwardToOpenAI({ ...req, disable_web_search: true });
    }

    // Check if this is a custom node JSON
    if (lastUserMessage && lastUserMessage.includes('"custom_nodes"') &&
      lastUserMessage.includes('"git_url"')) {
      try {
        // Try to extract the custom nodes JSON
        const customNodesMatch = lastUserMessage.match(/custom_nodes['"]*\s*:\s*(\[[\s\S]*?\])/);
        if (customNodesMatch && customNodesMatch[1]) {
          const customNodesJson = customNodesMatch[1].trim();
          let customNodes;

          try {
            customNodes = JSON.parse(customNodesJson);
          } catch (e) {
            // If direct parsing fails, try with surrounding brackets
            try {
              customNodes = JSON.parse(`${customNodesJson}`);
            } catch (e2) {
              console.error("Failed to parse custom nodes JSON:", e2);
            }
          }

          if (customNodes && Array.isArray(customNodes)) {
            // Create a machine config with these custom nodes
            const machineConfig: any = {
              comfyui: "latest",
              git_custom_nodes: {} as Record<string, { hash: string, disabled: boolean }>,
              file_custom_nodes: []
            };

            // Convert the array of custom nodes to the git_custom_nodes format
            customNodes.forEach((node: any) => {
              if (node.name && node.git_url) {
                machineConfig.git_custom_nodes[node.git_url] = {
                  hash: "",
                  disabled: false
                };
              }
            });

            // Apply required nodes
            const finalConfig = ensureRequiredNodes(machineConfig);

            return NextResponse.json({
              response: `I've added the custom nodes to your machine configuration.`,
              thinking: "",
              citations: [],
              related_questions: [],
              updated_machine_config: finalConfig,
              updated_models: []
            });
          }
        }
      } catch (error) {
        console.error("Error processing custom nodes:", error);
      }
    }

    // Check if this is just a model URL
    if (lastUserMessage && lastUserMessage.trim().startsWith('http') &&
      (lastUserMessage.includes('.safetensors') ||
        lastUserMessage.includes('.ckpt') ||
        lastUserMessage.includes('.pth') ||
        lastUserMessage.includes('.pt') ||
        lastUserMessage.includes('.bin'))) {

      // This is a direct model URL - handle it as a special case
      const modelUrl = lastUserMessage.trim();
      const modelInfo = handleModelUrlInput(modelUrl);

      if (modelInfo) {
        return NextResponse.json({
          response: `I've added the model from ${modelUrl} to your machine configuration.`,
          thinking: "",
          citations: [],
          related_questions: [],
          updated_machine_config: ensureRequiredNodes(modelInfo.updated_machine_config),
          updated_models: modelInfo.updated_models
        });
      }
    }

    // Check if it's a machine creation request using keywords
    const machineCreationKeywords = /create\s+ma[ch][ci][hn]e|setup\s+ma[ch][ci][hn]e|new\s+ma[ch][ci][hn]e|make\s+ma[ch][ci][hn]e|initialize\s+ma[ch][ci][hn]e|setup\s+for|create\s+setup|pixio\s+setup|comfy\s+setup|machine|config|build/i;
    const isMachineCreation = machineCreationKeywords.test(lastUserMessage);

    // If it's a machine creation request or function calling is requested
    if (use_function_calling || isMachineCreation) {
      console.log("Using OpenAI function calling for request");
      // Forward to OpenAI API
      return forwardToOpenAI({ ...req, disable_web_search: true });
    }

    // Create system prompt
    const systemPrompt = `You are a ComfyUI expert that provides assistance with workflow JSON and machine configurations.
        
When helping with machine configurations:
1. You understand both machine configuration JSON format and models configuration format
2. For machine configs, you can guide users on custom nodes for specific tasks
3. For model configs, you can recommend specific models and help find them on Hugging Face, Civitai, or GitHub
4. You understand how to construct a proper machine config with the comfyui version, git_custom_nodes and file_custom_nodes
5. You can explain what each model is used for within ComfyUI workflows

${include_thinking ? "Include your thinking process in a special section after your main response that will be shown separately in the UI. Format your thinking with a heading # Thinking Process followed by your detailed analysis." : ""}`;

    // Fix message format issues and ensure proper alternation
    const formattedMessages: Message[] = [
      { role: "system", content: systemPrompt }
    ];

    // Process messages to ensure proper alternation of user/assistant
    // Perplexity requires strict alternation after system message - MUST start with a user message
    let lastRole = null;
    let firstNonSystemMessage = true;

    for (const msg of messages) {
      if (typeof msg !== 'object') continue;

      const role = msg.role || (msg.sender === 'user' ? 'user' : 'assistant');
      const content = msg.content || msg.text || "";

      // Skip welcome message (first assistant message) to fix the alternation
      if (firstNonSystemMessage && role === 'assistant') {
        firstNonSystemMessage = false;
        continue;
      }

      firstNonSystemMessage = false;

      // Ensure we don't have two of the same role in a row (except system)
      if (role !== 'system' && lastRole === role) {
        // Skip or combine with previous message
        continue;
      }

      formattedMessages.push({ role, content });
      lastRole = role;
    }

    // If the message sequence doesn't end with 'user', we need to remove the last message
    if (formattedMessages.length > 1 && formattedMessages[formattedMessages.length - 1].role !== 'user') {
      formattedMessages.pop();
    }

    // If we don't have any user messages, we can't make a request
    if (formattedMessages.length <= 1 || !formattedMessages.some(m => m.role === 'user')) {
      return NextResponse.json({
        response: "Please provide a message to start the conversation.",
        thinking: "",
        citations: [],
        related_questions: []
      });
    }

    // Log the formatted messages
    console.log("Formatted messages for Perplexity:", JSON.stringify(formattedMessages, null, 2));

    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar-reasoning-pro",
        messages: formattedMessages,
        web_search: !disable_web_search,
        web_search_options: {
          search_context_size: "medium",
          timeout: 10000 // Increased timeout to 10 seconds
        },
      })
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      console.error("Request body:", JSON.stringify({
        model: "sonar-reasoning-pro",
        messages: formattedMessages,
        web_search: !disable_web_search,
        web_search_options: {
          search_context_size: "medium",
          timeout: 10000
        },
      }));
      return NextResponse.json(
        { error: `API request failed with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    // Parse the response
    const data: PerplexityResponse = await response.json();

    // Extract the assistant's response
    const content = data.choices[0].message.content;

    // Extract thinking process if it exists
    let mainResponse = content;
    let thinkingProcess = "";

    if (include_thinking) {
      const thinkingMatch = content.match(/# Thinking Process\s+([\s\S]+)$/i);

      if (thinkingMatch) {
        // Extract the thinking process and remove it from the main response
        thinkingProcess = thinkingMatch[1].trim();
        mainResponse = content.replace(/# Thinking Process\s+[\s\S]+$/i, "").trim();
      }
    }

    // Extract citations if available
    const citations: Citation[] = [];
    if (data.web_search && data.web_search.context) {
      data.web_search.context.forEach((item) => {
        citations.push({
          text: item.content || "",
          url: item.url || "#",
          title: item.title || "Source"
        });
      });
    }

    // Generate related questions if requested
    let relatedQuestions: string[] = [];
    if (return_related_questions && mainResponse) {
      // Simple extraction of questions from the response
      const questionMatches = mainResponse.match(/(?:\?|^|\.|\n)([^.?!]+\?)/g);
      if (questionMatches && questionMatches.length > 0) {
        relatedQuestions = questionMatches
          .map((q: string) => q.trim().replace(/^[.!?]\s+/, ""))
          .filter((q: string) => q.length > 10 && q.length < 100)
          .slice(0, 3);
      }
    }

    // Return the formatted response
    return NextResponse.json({
      response: mainResponse,
      thinking: thinkingProcess,
      citations,
      related_questions: relatedQuestions,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// Helper function to ensure machine config has required nodes
function ensureRequiredNodes(machineConfig: any): any {
  // Create a copy to avoid modifying the original
  const config = { ...machineConfig };

  // Ensure git_custom_nodes exists
  if (!config.git_custom_nodes) {
    config.git_custom_nodes = {};
  }

  // Always include the comfyui-deploy repository
  config.git_custom_nodes["https://github.com/rossman22590/comfyui-deploy.git"] = {
    hash: "40fc9d2914b8f1fc68534635146241d2cebca72b",
    disabled: false
  };

  return config;
}

// Helper function to extract model information from URL
function extractModelInfoFromUrl(url: string): any {
  try {
    // Default values
    let result = {
      name: "Unknown Model",
      type: "checkpoint",
      base: "SD1.5",
      save_path: "default",
      description: "",
      reference: "",
      filename: "",
      url: url
    };

    // Extract filename from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    result.filename = filename;

    // Extract name (without extension)
    if (filename) {
      result.name = filename.replace(/\.(safetensors|ckpt|pt|pth|bin)$/, '');
    }

    // Extract reference (repo URL)
    const repoPath = url.split('/resolve/')[0];
    if (repoPath) {
      result.reference = repoPath;
    }

    // Try to determine model type from URL and filename
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('lora')) {
      result.type = 'lora';
    } else if (lowerUrl.includes('vae')) {
      result.type = 'vae';
    } else if (lowerUrl.includes('embedding')) {
      result.type = 'embedding';
    } else if (lowerUrl.includes('controlnet')) {
      result.type = 'controlnet';
    } else if (lowerUrl.includes('upscaler')) {
      result.type = 'upscaler';
    }

    // Try to determine model base from URL path
    if (lowerUrl.includes('sd-xl') || lowerUrl.includes('sdxl') || lowerUrl.includes('xl-base')) {
      result.base = 'SDXL';
      result.description = 'Stable Diffusion XL model';
    } else if (lowerUrl.includes('sd15') || lowerUrl.includes('sd-1.5') || lowerUrl.includes('v1-5')) {
      result.base = 'SD1.5';
      result.description = 'Stable Diffusion 1.5 model';
    } else if (lowerUrl.includes('sd2') || lowerUrl.includes('sd-2')) {
      result.base = 'SD2.0';
      result.description = 'Stable Diffusion 2.0 model';
    }

    return result;
  } catch (error) {
    console.error("Error extracting model info:", error);
    return {
      name: "Unknown Model",
      type: "checkpoint",
      base: "SD1.5",
      save_path: "default",
      description: `Model from ${url}`,
      reference: "",
      filename: "model.safetensors",
      url: url
    };
  }
}

// Function to handle a single model URL input directly
function handleModelUrlInput(url: string): any {
  if (!url) return null;

  try {
    return {
      updated_machine_config: ensureRequiredNodes({
        comfyui: "latest",
        git_custom_nodes: {},
        file_custom_nodes: []
      }),
      updated_models: [extractModelInfoFromUrl(url)]
    };
  } catch (error) {
    console.error("Error handling model URL input:", error);
    return null;
  }
}

// Function to forward requests to OpenAI
async function forwardToOpenAI(req: any) {
  try {
    // Call the OpenAI API directly instead of forwarding
    // Parse request body to get needed fields
    const {
      messages,
      include_thinking = false,
      machineConfig = null,
      models = null,
      disable_web_search = false
    } = req;

    // Create system prompt
    const systemPrompt = `You are a ComfyUI expert that provides assistance with workflow JSON and machine configurations.
        
When helping with machine configurations:
1. You understand both machine configuration JSON format and models configuration format
2. For machine configs, you can guide users on custom nodes for specific tasks
3. For model configs, you can recommend specific models and help find them on Hugging Face, Civitai, or GitHub
4. You understand how to construct a proper machine config with the comfyui version, git_custom_nodes and file_custom_nodes
5. You can explain what each model is used for within ComfyUI workflows
6. If the user asks to update their machine config or add a model, use the update_machine_config function

${include_thinking ? "Include your thinking process in a special section after your main response that will be shown separately in the UI. Format your thinking with a heading # Thinking Process followed by your detailed analysis." : ""}`;

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    // Fix message format issues
    const formattedMessages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Process each message to ensure correct format
    for (const msg of messages) {
      if (typeof msg === 'object') {
        formattedMessages.push({
          role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
          content: msg.content || msg.text || ""
        });
      }
    }

    // Add current machine config context if provided
    if (machineConfig && models) {
      formattedMessages.push({
        role: "system",
        content: `Current machine configuration: ${JSON.stringify(machineConfig, null, 2)}\n\nCurrent models: ${JSON.stringify(models, null, 2)}`
      });
    }

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

    // Create chat completion with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
      messages: formattedMessages,
      tools: [{
        type: "function",
        function: updateMachineConfigFn
      }],
      temperature: 0.7,
    });

    // Process response
    const assistantMessage = completion.choices[0].message;
    let content = assistantMessage.content || "";
    let toolCalls = assistantMessage.tool_calls || [];

    // Extract thinking process if it exists
    let mainResponse = content;
    let thinkingProcess = "";

    if (include_thinking && content) {
      const thinkingMatch = content.match(/# Thinking Process\s+([\s\S]+)$/i);

      if (thinkingMatch) {
        // Extract the thinking process and remove it from the main response
        thinkingProcess = thinkingMatch[1].trim();
        mainResponse = content.replace(/# Thinking Process\s+[\s\S]+$/i, "").trim();
      }
    }

    // Process tool calls if any
    let updatedMachineConfig = null;
    let updatedModels = null;

    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        if (toolCall && toolCall.function && toolCall.function.name === 'update_machine_config') {
          try {
            const argumentsStr = toolCall.function.arguments || "{}";
            const args = JSON.parse(argumentsStr);

            if (args && args.machineConfig) {
              // Ensure machineConfig has all required properties
              updatedMachineConfig = ensureRequiredNodes({
                comfyui: args.machineConfig.comfyui || "latest",
                git_custom_nodes: args.machineConfig.git_custom_nodes || {},
                file_custom_nodes: args.machineConfig.file_custom_nodes || []
              });
            }

            if (args && args.models && Array.isArray(args.models)) {
              // Ensure each model has required properties
              updatedModels = args.models.map((model: any) => ({
                name: model.name || "Unnamed Model",
                type: model.type || "checkpoint",
                base: model.base || "SD1.5",
                save_path: model.save_path || "",
                description: model.description || "",
                reference: model.reference || "",
                filename: model.filename || "",
                url: model.url || ""
              }));
            }
          } catch (e) {
            console.error("Error parsing tool call arguments:", e);
          }
        }
      }
    }

    // Return the formatted response with updated configs
    return NextResponse.json({
      response: mainResponse || "I've updated your machine configuration.",
      thinking: thinkingProcess,
      updated_machine_config: updatedMachineConfig,
      updated_models: updatedModels,
      related_questions: []
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: `OpenAI API request failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
