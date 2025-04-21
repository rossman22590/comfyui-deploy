import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserIcon, SparklesIcon, LightBulbIcon, ServerIcon, DocumentChartBarIcon, AcademicCapIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { isComfyUIWorkflow, formatTime } from '@/lib/utils';
import ComfyUIWorkflow from '../ComfyUIWorkflow';
import { isMachineConfig, isModelsConfig } from '../MachineConfigCard';
import dynamic from 'next/dynamic';

// Dynamically import MachineConfigCard to avoid SSR issues
const MachineConfigCard = dynamic(() => import('../MachineConfigCard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="animate-pulse space-y-2 w-full">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
});

export interface Citation {
  title: string;
  url: string;
  text?: string;
  snippets: string[];
}

export interface MessageData {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'thinking';
  timestamp: Date;
  citations?: Citation[];
}

export interface MessageProps {
  message: MessageData;
  expandedWorkflows: Record<string, boolean>;
  setExpandedWorkflows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  collapsedUserWorkflows: Record<string, boolean>;
  setCollapsedUserWorkflows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const Message: React.FC<MessageProps> = ({
  message,
  expandedWorkflows,
  collapsedUserWorkflows,
  setExpandedWorkflows,
  setCollapsedUserWorkflows
}) => {
  const { id, text, sender, timestamp, citations } = message;
  const [workflowExpanded, setWorkflowExpanded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  // If this is a workflow and it's in expandedWorkflows, open it
  useEffect(() => {
    if (expandedWorkflows[id]) {
      setWorkflowExpanded(true);
    }
  }, [expandedWorkflows, id]);

  const isComfyWorkflow = isComfyUIWorkflow(text);
  const isMachineConfigJson = isMachineConfig(text);
  const isModelsConfigJson = isModelsConfig(text);
  const isCollapsibleJson = isComfyWorkflow || isMachineConfigJson || isModelsConfigJson;

  // Parse <think> tags from the message
  const [displayText, thinkingContent] = useMemo(() => {
    if (!text) return ["", ""];

    // Check for <think> tags
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const matches = [...text.matchAll(thinkRegex)];

    if (matches.length === 0) {
      return [text, ""];
    }

    // Extract thinking content and replace tags in display text
    let thinking = "";
    let display = text;

    matches.forEach(match => {
      thinking += match[1] + "\n\n";
      display = display.replace(match[0], "");
    });

    // Trim whitespace and return
    return [display.trim(), thinking.trim()];
  }, [text]);

  // Detect and extract thinking blocks from the message
  // Using the format <think>thinking content</think>

  // Determine if this is a collapsed user workflow
  const isCollapsedUserWorkflow = sender === 'user' && isCollapsibleJson && collapsedUserWorkflows[id];

  // Check if message contains machine and model configs
  const hasMachineConfigs = useMemo(() => {
    try {
      // First check if the text is directly a machine config
      if (isMachineConfigJson) return true;

      // Only attempt to parse if it looks like JSON
      if (!text || typeof text !== 'string' || !text.trim().startsWith('{')) {
        return false;
      }

      // Then check if it's a JSON object with machineConfig property
      const parsed = JSON.parse(text);
      return parsed &&
        typeof parsed === 'object' &&
        (parsed.machineConfig || parsed.modelsConfig);
    } catch (e) {
      console.error("Error checking for machine configs:", e);
      return false;
    }
  }, [text, isMachineConfigJson]);

  // Extract machine and models config from message
  const extractedConfigs = useMemo(() => {
    try {
      // If it's already a machine config, return it directly
      if (isMachineConfigJson) {
        return {
          machineConfig: text,
          modelsConfig: null
        };
      }

      // Only attempt to parse if it looks like JSON
      if (!text || typeof text !== 'string' || !text.trim().startsWith('{')) {
        return { machineConfig: null, modelsConfig: null };
      }

      // If it's a JSON with machineConfig property
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        return {
          machineConfig: parsed.machineConfig || null,
          modelsConfig: parsed.modelsConfig || null
        };
      }

      return { machineConfig: null, modelsConfig: null };
    } catch (e) {
      console.error("Error extracting configs:", e);
      return { machineConfig: null, modelsConfig: null };
    }
  }, [text, isMachineConfigJson]);

  return (
    <div
      ref={messageRef}
      className="flex mb-4"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sender === 'user'
            ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600'
            : 'bg-white border border-gray-200'
          }`}>
          {sender === 'user' ? (
            <UserIcon className="h-4 w-4 text-white" />
          ) : sender === 'thinking' ? (
            <LightBulbIcon className="h-4 w-4 text-green-600" />
          ) : (
            <SparklesIcon className="h-4 w-4 text-indigo-600" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1">
        <div className={`p-3 rounded-lg shadow-sm ${sender === 'user'
            ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 text-white'
            : sender === 'thinking'
              ? 'bg-green-50 border border-green-100'
              : 'bg-white border border-gray-200'
          }`}>
          <div className="flex flex-col">
            <div>
              {/* For collapsed user JSON */}
              {isCollapsedUserWorkflow ? (
                <div className="flex flex-col">
                  <div className="text-sm text-white mb-2">
                    {isComfyWorkflow
                      ? 'ComfyUI Workflow JSON (collapsed)'
                      : isMachineConfigJson
                        ? 'Machine Configuration JSON (collapsed)'
                        : isModelsConfigJson
                          ? 'Models Configuration JSON (collapsed)'
                          : 'JSON (collapsed)'}
                  </div>
                  <button
                    onClick={() => setCollapsedUserWorkflows(prev => ({ ...prev, [id]: false }))}
                    className="text-xs bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded self-start"
                  >
                    Show JSON
                  </button>
                </div>
              ) : hasMachineConfigs ? (
                // For machine configuration messages
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <ServerIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Machine Setup
                    </h3>
                    <button
                      onClick={() => {
                        setWorkflowExpanded(!workflowExpanded);
                        setExpandedWorkflows(prev => ({ ...prev, [id]: !workflowExpanded }));
                      }}
                      className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded"
                    >
                      {workflowExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  {/* Always show machine config card - don't check workflowExpanded */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <MachineConfigCard
                      configJson={extractedConfigs.machineConfig}
                      modelsJson={extractedConfigs.modelsConfig}
                    />
                  </div>
                </div>
              ) : isCollapsibleJson && sender === 'user' ? (
                // For user JSON messages that are not collapsed
                <div className="flex flex-col">
                  <div className="text-sm text-white mb-2">
                    {isComfyWorkflow
                      ? 'ComfyUI Workflow JSON'
                      : isMachineConfigJson
                        ? 'Machine Configuration JSON'
                        : isModelsConfigJson
                          ? 'Models Configuration JSON'
                          : 'JSON'}
                  </div>
                  <pre className="text-xs bg-blue-700 p-3 rounded overflow-auto max-h-96 text-white">
                    {JSON.stringify(JSON.parse(text), null, 2)}
                  </pre>
                  <button
                    onClick={() => setCollapsedUserWorkflows(prev => ({ ...prev, [id]: true }))}
                    className="text-xs bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded self-start mt-2"
                  >
                    Hide JSON
                  </button>
                </div>
              ) : isComfyWorkflow ? (
                // For workflow visualization messages
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <DocumentChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                      ComfyUI Workflow
                    </h3>
                    <button
                      onClick={() => {
                        setWorkflowExpanded(!workflowExpanded);
                        setExpandedWorkflows(prev => ({ ...prev, [id]: !workflowExpanded }));
                      }}
                      className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded"
                    >
                      {workflowExpanded ? 'Hide Graph' : 'Show Graph'}
                    </button>
                  </div>
                  {workflowExpanded && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white" style={{ height: '400px' }}>
                      <ComfyUIWorkflow workflowJson={text} />
                    </div>
                  )}
                </div>
              ) : (
                // Normal message content with markdown
                <div className={`prose prose-sm max-w-none ${sender === 'user' ? 'text-white' : 'dark:prose-invert'}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre({ node, children, className, ...props }) {
                        const language =
                          className?.includes('language-json') ? 'json' :
                            className?.includes('language-') ? className.replace('language-', '') :
                              '';

                        return (
                          <pre
                            className={`${className || ''} ${language ? `language-${language}` : ''}`}
                            data-language={language || 'code'}
                            {...props}
                          >
                            {children}
                          </pre>
                        );
                      }
                    }}
                  >
                    {displayText}
                  </ReactMarkdown>
                  
                  {/* Thinking content inline */}
                  {thinkingContent && (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <LightBulbIcon className="w-4 h-4 mr-1 text-indigo-600" />
                          <span className="font-medium text-xs text-indigo-800">AI Thinking Process</span>
                        </div>
                        <button
                          onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                          className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded"
                        >
                          {isThinkingExpanded ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {isThinkingExpanded && (
                        <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded overflow-auto max-h-96">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {thinkingContent}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citations, if present - improved card display */}
      {citations && citations.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <AcademicCapIcon className="h-4 w-4 mr-1 text-indigo-600" />
            <h3 className="text-sm font-medium text-indigo-800">Sources from Perplexity ({citations.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {citations.map((citation, index) => (
              <div 
                key={index}
                className="bg-white border border-indigo-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="p-3 border-b border-indigo-50 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedCitation(expandedCitation === `${id}-${index}` ? null : `${id}-${index}`)}
                >
                  <a 
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {citation.title || citation.url}
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 flex-shrink-0" />
                  </a>
                  <button className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1 px-2 rounded">
                    {expandedCitation === `${id}-${index}` ? 'Hide' : 'Show'}
                  </button>
                </div>
                {expandedCitation === `${id}-${index}` && (
                  <>
                    {citation.text && (
                      <div className="p-3 text-xs text-gray-600 bg-gray-50">
                        <p>{citation.text}</p>
                      </div>
                    )}
                    {citation.snippets && citation.snippets.length > 0 && (
                      <div className="p-3 text-xs text-gray-600 bg-gray-50">
                        {citation.snippets.map((snippet, i) => (
                          <p key={i} className="mb-2">{snippet}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
