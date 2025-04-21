import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon, DocumentChartBarIcon, ServerIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface ChatInputProps {
  onSubmit: (messageText: string) => Promise<void>;
  isLoading: boolean;
  onStopGeneration: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  detectedWorkflow?: boolean;
  detectedMachineConfig?: boolean;
  detectedModelsConfig?: boolean;
  detectedCommandTrigger?: boolean;
  clearConfig?: () => void;
  downloadMachineConfig?: (config: any) => void;
  downloadModels?: (models: any) => void;
  machineConfigJson?: string;
  modelsConfigJson?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isLoading,
  onStopGeneration,
  value,
  onChange,
  onPaste,
  detectedWorkflow,
  detectedMachineConfig,
  detectedModelsConfig,
  detectedCommandTrigger,
  clearConfig,
  downloadMachineConfig,
  downloadModels,
  machineConfigJson,
  modelsConfigJson
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (value.trim() && !isLoading) {
      await onSubmit(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-t p-4 pt-2 pb-3 flex-shrink-0 mt-auto"
    >
      <div className="max-w-screen-xl mx-auto w-full mb-1">
        <div className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200">
          {detectedWorkflow && (
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentChartBarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-sm font-medium text-indigo-700">ComfyUI Workflow Detected!</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={clearConfig}
                    className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Visualize
                  </button>
                </div>
              </div>
              <p className="text-xs text-indigo-600 mt-1">
                Send this workflow to visualize it as an interactive node graph.
              </p>
            </div>
          )}
          
          {(detectedMachineConfig || detectedModelsConfig) && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ServerIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">
                    {detectedMachineConfig ? "Machine Config Detected!" : "Models Config Detected!"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={clearConfig}
                    className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Visualize
                  </button>
                  {detectedMachineConfig && machineConfigJson && downloadMachineConfig && (
                    <button
                      onClick={() => downloadMachineConfig(JSON.parse(machineConfigJson))}
                      className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Download
                    </button>
                  )}
                  {detectedModelsConfig && modelsConfigJson && downloadModels && (
                    <button
                      onClick={() => downloadModels(JSON.parse(modelsConfigJson))}
                      className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Send this configuration to visualize it in a structured format.
              </p>
            </div>
          )}
          <div className="flex items-start px-4 py-3 relative">
            {detectedCommandTrigger && (
              <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium animate-pulse">
                Machine Command Detected
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              onPaste={onPaste}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ComfyUI or paste a workflow JSON..."
              className={`flex-1 bg-transparent outline-none resize-none min-h-[40px] max-h-[100px] py-2 ${detectedCommandTrigger ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}
              disabled={isLoading}
              rows={1}
              style={{ height: 'auto' }}
            />
            <motion.button
              onClick={handleSubmit}
              disabled={value.trim() === "" || isLoading}
              className={`ml-2 p-2 rounded-full self-end ${
                value.trim() === "" || isLoading
                  ? "text-gray-300 cursor-not-allowed"
                  : detectedCommandTrigger
                    ? "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 hover:shadow-lg"
                    : "text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:shadow-lg"
              }`}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </motion.button>
            {isLoading && (
              <button
                onClick={onStopGeneration}
                className="absolute right-16 top-2 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                title="Stop generation"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInput;
