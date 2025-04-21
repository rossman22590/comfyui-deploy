"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LightBulbIcon, 
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import dynamic from 'next/dynamic';
import { isComfyUIWorkflow, generateUniqueId } from '@/lib/utils';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import { MessageData } from '@/components/chat/Message';

// Dynamic imports
const ComfyUIWorkflow = dynamic(() => import('@/components/ComfyUIWorkflow'), {
  ssr: false, // ReactFlow doesn't support SSR
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "100ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-purple-700 animate-bounce" style={{ animationDelay: "200ms" }}></div>
        </div>
        <span className="text-sm text-gray-500">Loading workflow visualizer...</span>
      </div>
    </div>
  )
});

const MachineConfigCard = dynamic(() => import('@/components/MachineConfigCard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "100ms" }}></div>
          <div className="w-3 h-3 rounded-full bg-purple-700 animate-bounce" style={{ animationDelay: "200ms" }}></div>
        </div>
        <span className="text-sm text-gray-500">Loading machine visualizer...</span>
      </div>
    </div>
  )
});

import { isMachineConfig, isModelsConfig } from '@/components/MachineConfigCard';

type Citation = {
  text?: string;
  url: string;
  title: string;
  snippets: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: "1",
      text: "👋 Welcome to Pixio Chat! How can I help you with ComfyUI today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});
  const [expandedMachineConfigs, setExpandedMachineConfigs] = useState<Record<string, boolean>>({});
  const [detectedWorkflow, setDetectedWorkflow] = useState<boolean>(false);
  const [detectedMachineConfig, setDetectedMachineConfig] = useState<boolean>(false);
  const [detectedModelsConfig, setDetectedModelsConfig] = useState<boolean>(false);
  const [machineConfigJson, setMachineConfigJson] = useState<string>("");
  const [modelsConfigJson, setModelsConfigJson] = useState<string>("");
  const [collapsedUserWorkflows, setCollapsedUserWorkflows] = useState<Record<string, boolean>>({});
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [thinkingText, setThinkingText] = useState<string | null>(null);
  const [detectedCommandTrigger, setDetectedCommandTrigger] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const controller = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Make sure the app fills the entire viewport height properly
  useEffect(() => {
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isLoading) return;

    // Check if it's a ComfyUI workflow JSON or machine config
    const isWorkflow = isComfyUIWorkflow(newMessage);
    const isMachine = isMachineConfig(newMessage);
    const isModels = isModelsConfig(newMessage);
    
    // Add user message
    const userMessage: MessageData = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    
    // Reset detected states
    setDetectedWorkflow(false);
    setDetectedMachineConfig(false);
    setDetectedModelsConfig(false);
    setDetectedCommandTrigger(false);
    
    // For JSON inputs, always fold them by default
    if (isWorkflow || isMachine || isModels) {
      setTimeout(() => {
        setCollapsedUserWorkflows(prev => ({
          ...prev,
          [userMessage.id]: true
        }));
      }, 100);
    }
    
    // If it's a workflow JSON, handle it directly without API call
    if (isWorkflow) {
      const botMessage: MessageData = {
        id: Date.now().toString(),
        text: newMessage, // Keep the JSON as-is
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Auto-expand the workflow
      setTimeout(() => {
        setExpandedWorkflows(prev => ({
          ...prev,
          [botMessage.id]: true
        }));
      }, 500);
      
      return;
    }
    
    // If it's a machine config, handle it directly
    if (isMachine) {
      // Look for a models config in recent messages
      const matchingModelsJson = messages.length > 1 ? 
        findRelatedConfig(messages.length, false) : null;
      
      const botMessage: MessageData = {
        id: Date.now().toString(),
        text: JSON.stringify({
          machineConfig: JSON.parse(newMessage),
          modelsConfig: matchingModelsJson ? JSON.parse(matchingModelsJson) : null
        }),
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Auto-expand the machine config
      setTimeout(() => {
        setExpandedWorkflows(prev => ({
          ...prev,
          [botMessage.id]: true
        }));
        setExpandedMachineConfigs(prev => ({
          ...prev,
          [botMessage.id]: true
        }));
      }, 500);
      
      return;
    }
    
    // If it's a models config, handle it directly
    if (isModels) {
      // Look for a machine config in recent messages
      const matchingMachineJson = messages.length > 1 ? 
        findRelatedConfig(messages.length, true) : null;
      
      const botMessage: MessageData = {
        id: Date.now().toString(),
        text: JSON.stringify({
          machineConfig: matchingMachineJson ? JSON.parse(matchingMachineJson) : null,
          modelsConfig: JSON.parse(newMessage)
        }),
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Auto-expand the machine config
      setTimeout(() => {
        setExpandedMachineConfigs(prev => ({
          ...prev,
          [botMessage.id]: true
        }));
      }, 500);
      
      return;
    }
    
    // Otherwise, proceed with normal API call
    setIsLoading(true);
    
    // Create a unique ID for this thinking message
    const thinkingId = `thinking-${Date.now()}`;
    
    // Start the "thinking" animation
    setThinkingText("The AI is thinking...");
    
    try {
      // Get current machine configs if available
      let currentMachineConfig = null;
      let currentModels = null;
      
      // Look for machine configs in previous messages
      for (let i = messages.length - 1; i >= 0; i--) {
        try {
          const msg = messages[i];
          const parsed = JSON.parse(msg.text);
          
          if (parsed.machineConfig) {
            currentMachineConfig = parsed.machineConfig;
          }
          
          if (parsed.modelsConfig) {
            currentModels = parsed.modelsConfig;
          }
          
          if (currentMachineConfig && currentModels) {
            break;
          }
        } catch (e) {
          // Not a JSON, continue
        }
      }
      
      // Check if this might be a machine update request or model JSON
      const hasModelJson = /\[\s*\{\s*\"url\"/.test(newMessage) || 
                          (newMessage.includes('"url"') && 
                          newMessage.includes('"type"') && 
                          newMessage.includes('"filename"'));
      
      const useFunctionCalling = 
        /update|add|remove|install|modify|change|config|model|checkpoint|lora|node|custom|create|ma[ch][ci][hn]e|setup|mahcien|mahcine|machien|creat\s+e?machine/i.test(newMessage) || hasModelJson;
      
      // Create abort controller for fetch
      controller.current = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
          })).concat([{
            role: "user",
            content: userMessage.text
          }]),
          return_related_questions: true,
          include_thinking: true,
          use_function_calling: useFunctionCalling,
          machineConfig: currentMachineConfig,
          models: currentModels
        }),
        signal: controller.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log the response data for debugging
      console.log("API response:", data);
      
      // Stop the "thinking" animation
      setThinkingText(null);
      
      // Check if there's a thinking process to display
      if (data.thinking && data.thinking.trim()) {
        const thinkingMessage: MessageData = {
          id: thinkingId,
          text: data.thinking,
          sender: "thinking",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, thinkingMessage]);
      }
      
      // Check if we received updated machine configs
      if (data.updated_machine_config || data.updated_models) {
        // Create a special message with the updated configs
        const configUpdateMessage: MessageData = {
          id: Date.now().toString(),
          text: JSON.stringify({
            machineConfig: data.updated_machine_config,
            modelsConfig: data.updated_models
          }),
          sender: "bot",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, configUpdateMessage]);
        
        // Auto-expand the machine config - make sure both states are updated
        setTimeout(() => {
          setExpandedWorkflows(prev => ({
            ...prev,
            [configUpdateMessage.id]: true
          }));
          setExpandedMachineConfigs(prev => ({
            ...prev,
            [configUpdateMessage.id]: true
          }));
        }, 100); // Reduce timeout to make it appear faster
      }
      
      // Process citations if available
      const processedCitations = data.citations && data.citations.length > 0 
        ? data.citations.map((citation: any) => ({
            text: citation.text || "",
            url: citation.url || "#",
            title: citation.title || "Source",
            snippets: citation.snippets || []
          }))
        : [];
        
      console.log("Processed citations:", processedCitations);
      
      // Add the bot response
      const botMessage: MessageData = {
        id: Date.now().toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
        citations: processedCitations
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Update related questions if they exist
      if (data.related_questions && Array.isArray(data.related_questions)) {
        setRelatedQuestions(data.related_questions);
      } else {
        setRelatedQuestions([]);
      }
      
      setApiError(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setApiError("Failed to get a response. Please try again.");
      setThinkingText(null);
    } finally {
      setIsLoading(false);
      controller.current = null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleCitations = (messageId: string) => {
    setExpandedCitations(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Find related machine or models config in previous messages
  const findRelatedConfig = (currentMessageIdx: number, isMachine: boolean): string | null => {
    // Look for a matching config message within the last 3 messages
    const searchRange = 3;
    const startIdx = Math.max(0, currentMessageIdx - searchRange);
    
    for (let i = startIdx; i < currentMessageIdx; i++) {
      const msg = messages[i];
      if ((isMachine && isMachineConfig(msg.text)) || (!isMachine && isModelsConfig(msg.text))) {
        return msg.text;
      }
    }
    
    return null;
  };

  // Handle input change and detect workflow JSON on paste
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Check for different JSON types
    const isWorkflow = isComfyUIWorkflow(value);
    const isMachine = isMachineConfig(value);
    const isModels = isModelsConfig(value);
    
    setDetectedWorkflow(isWorkflow);
    setDetectedMachineConfig(isMachine);
    setDetectedModelsConfig(isModels);
    
    if (isMachine) {
      setMachineConfigJson(value);
    }
    
    if (isModels) {
      setModelsConfigJson(value);
    }

    // Check for machine command
    const isMachineCommand = /\b(create|add|update|edit|setup|build|modify|configure) machine\b/i.test(value);
    setDetectedCommandTrigger(isMachineCommand);
    
    // Auto-resize textarea based on content but limit height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 100; // Limit max height to 100px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  };

  // Handle paste event specifically
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (isComfyUIWorkflow(pastedText)) {
      setDetectedWorkflow(true);
    } else if (isMachineConfig(pastedText)) {
      setDetectedMachineConfig(true);
      setMachineConfigJson(pastedText);
    } else if (isModelsConfig(pastedText)) {
      setDetectedModelsConfig(true);
      setModelsConfigJson(pastedText);
    }
  };

  // Clear detected configurations
  const clearConfig = () => {
    setNewMessage("");
    setDetectedWorkflow(false);
    setDetectedMachineConfig(false);
    setDetectedModelsConfig(false);
    setMachineConfigJson("");
    setModelsConfigJson("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Add download JSON functionality
  const downloadJson = (data: any, filename: string) => {
    // Create a Blob with the JSON data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Trigger a click to download the file
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Download machine config JSON
  const downloadMachineConfig = (config: any) => {
    if (!config) return;
    
    downloadJson(config, 'machine-config.json');
  };
  
  // Download models JSON
  const downloadModels = (models: any) => {
    if (!models || !Array.isArray(models) || models.length === 0) return;
    
    downloadJson(models, 'models.json');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <ChatHeader 
        onReset={() => setMessages([messages[0]])} 
        showResetButton={messages.length > 1} 
      />

      {/* Chat container - flexible height */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-6 px-4 space-y-6"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="max-w-screen-xl mx-auto w-full">
          <MessageList
            messages={messages}
            expandedWorkflows={expandedWorkflows}
            setExpandedWorkflows={setExpandedWorkflows}
            collapsedUserWorkflows={collapsedUserWorkflows}
            setCollapsedUserWorkflows={setCollapsedUserWorkflows}
          />
          
          {/* Thinking indicator */}
          {thinkingText && (
            <ThinkingIndicator 
              isLoading={true} 
              thinkingText={thinkingText} 
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        onSubmit={handleSendMessage}
        isLoading={isLoading}
        onStopGeneration={() => {
          setIsLoading(false);
          if (controller.current) {
            controller.current.abort();
            controller.current = null;
          }
          setThinkingText(null);
        }}
        value={newMessage}
        onChange={handleInputChange}
        onPaste={handlePaste}
        detectedWorkflow={detectedWorkflow}
        detectedMachineConfig={detectedMachineConfig}
        detectedModelsConfig={detectedModelsConfig}
        detectedCommandTrigger={detectedCommandTrigger}
        clearConfig={clearConfig}
        downloadMachineConfig={downloadMachineConfig}
        downloadModels={downloadModels}
        machineConfigJson={machineConfigJson}
        modelsConfigJson={modelsConfigJson}
      />

      {/* Related questions */}
      {relatedQuestions.length > 0 && (
        <div className="px-4 py-3 bg-white border-t">
          <div className="max-w-screen-xl mx-auto">
            <h3 className="text-xs font-medium text-gray-500 flex items-center mb-2">
              <AcademicCapIcon className="h-3 w-3 mr-1" />
              Related Questions
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedQuestions.map((question, i) => (
                <button
                  key={`related-${i}-${generateUniqueId()}`}
                  onClick={() => {
                    setNewMessage(question);
                    setSelectedSuggestion(question);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedSuggestion === question
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add CSS custom properties for viewport height handling */}
      <style jsx global>{`
        :root {
          --vh: 1vh;
        }
        /* Add smooth scrolling for code blocks */
        pre {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }
        pre::-webkit-scrollbar {
          height: 6px;
        }
        pre::-webkit-scrollbar-track {
          background: transparent;
        }
        pre::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 3px;
        }
        /* Add gradient glow effect on large screens */
        @media (min-width: 1024px) {
          .chat-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100px;
            background: linear-gradient(to bottom, rgba(238, 242, 255, 0.8), transparent);
            pointer-events: none;
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
}