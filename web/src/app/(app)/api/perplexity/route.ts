import { NextResponse } from 'next/server';

interface Message {
  role: string;
  content: string;
}

interface Citation {
  text: string;
  url: string;
  title: string;
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const req = await request.json();
    const { messages, include_thinking = false, return_related_questions = false } = req;

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages must be provided as an array" }, { status: 400 });
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

    // Clone messages and add system prompt at the beginning
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role || "user",
        content: msg.content || msg.text || ""
      }))
    ];

    // Format payload for Perplexity API
    const requestPayload = {
      model: "sonar-reasoning-pro",
      messages: formattedMessages,
      web_search: true,
      web_search_options: {
        search_context_size: "medium",
      }
    };

    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(requestPayload)
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", errorText);
      return NextResponse.json(
        { error: `API request failed with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();

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
      data.web_search.context.forEach((item: any) => {
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
