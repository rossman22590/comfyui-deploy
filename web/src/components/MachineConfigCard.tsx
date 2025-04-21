"use client";

import React, { useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon, ServerIcon, DocumentIcon, CubeIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface Model {
  name: string;
  type: string;
  base: string;
  save_path: string;
  description: string;
  reference: string;
  filename: string;
  url: string;
}

interface CustomNode {
  hash: string;
  disabled: boolean;
}

interface MachineConfig {
  comfyui: string;
  comfyui_hash: string;
  git_custom_nodes: {
    [url: string]: CustomNode;
  } | string[];
  file_custom_nodes: any[];
}

interface MachineConfigCardProps {
  machineConfig?: string | object;
  modelsConfig?: string | object;
  configJson?: string | object;
  modelsJson?: string | object;
}

export default function MachineConfigCard({ 
  machineConfig, 
  modelsConfig,
  configJson, 
  modelsJson 
}: MachineConfigCardProps) {
  const config: MachineConfig = React.useMemo(() => {
    try {
      const configData = machineConfig || configJson;
      if (!configData) {
        console.warn("No machine config data provided");
        return {
          comfyui: "93292bc450dd291925c45adea00ebedb8a3209ef",
          comfyui_hash: "",
          git_custom_nodes: {},
          file_custom_nodes: []
        };
      }
      
      const parsedConfig = typeof configData === 'string' ? JSON.parse(configData) : configData;
      console.log("Parsed machine config:", parsedConfig);
      
      // Always use the standard ComfyUI hash
      return {
        ...parsedConfig,
        comfyui: "93292bc450dd291925c45adea00ebedb8a3209ef"
      };
    } catch (e) {
      console.error("Error parsing machine config JSON:", e);
      return {
        comfyui: "93292bc450dd291925c45adea00ebedb8a3209ef",
        comfyui_hash: "",
        git_custom_nodes: {},
        file_custom_nodes: []
      };
    }
  }, [machineConfig, configJson]);

  const [models, setModels] = useState<any[]>([]);
  const [modelsData, setModelsData] = useState(modelsJson || modelsConfig);

  const getModelsFromUI = useCallback(() => {
    return modelsData;
  }, [modelsData]);

  const modelsList: Model[] = React.useMemo(() => {
    try {
      const modelData = modelsData;
      if (!modelData) {
        return [];
      }
      
      const parsedModels = typeof modelData === 'string' ? JSON.parse(modelData) : modelData;
      console.log("Parsed models:", parsedModels);
      return Array.isArray(parsedModels) ? parsedModels : [];
    } catch (e) {
      console.error("Error parsing models JSON:", e);
      return [];
    }
  }, [modelsData]);

  const getNodeTypeColor = (url: string) => {
    if (url.includes('github.com')) {
      return 'from-emerald-600 to-emerald-800';
    } else if (url.includes('huggingface.co')) {
      return 'from-amber-600 to-amber-800';
    } else {
      return 'from-purple-600 to-purple-800';
    }
  };

  const getModelTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'checkpoints': 'from-indigo-600 to-blue-800',
      'loras': 'from-pink-600 to-purple-800',
      'vae': 'from-amber-600 to-red-800',
      'clip': 'from-teal-600 to-emerald-800',
      'controlnet': 'from-cyan-600 to-blue-800',
      'upscaler': 'from-green-600 to-emerald-800'
    };

    return typeColors[type.toLowerCase()] || 'from-gray-600 to-gray-800';
  };

  const [nodeList, setNodeList] = useState<any>(null);
  const [isLoadingNodeList, setIsLoadingNodeList] = useState(false);

  // Fetch the ComfyUI-Manager custom-node-list.json
  const fetchNodeList = useCallback(async () => {
    try {
      setIsLoadingNodeList(true);
      const response = await fetch('https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json');
      if (!response.ok) {
        throw new Error('Failed to fetch node list');
      }
      const data = await response.json();
      setNodeList(data);
      return data;
    } catch (error) {
      console.error('Error fetching node list:', error);
      return null;
    } finally {
      setIsLoadingNodeList(false);
    }
  }, []);

  // Cross-check user nodes with the node list and fill in missing information
  const crossCheckNodes = useCallback(async (userConfig: any) => {
    if (!nodeList) {
      const fetchedNodeList = await fetchNodeList();
      if (!fetchedNodeList) return userConfig;
    }
    
    const enhancedConfig = { ...userConfig };
    
    // Only process if we have git_custom_nodes
    if (enhancedConfig.git_custom_nodes) {
      const nodeListEntries = nodeList ? Object.entries(nodeList) : [];
      
      // If git_custom_nodes is an array, convert to object format
      if (Array.isArray(enhancedConfig.git_custom_nodes)) {
        const nodeUrls = [...enhancedConfig.git_custom_nodes];
        enhancedConfig.git_custom_nodes = {};
        
        // Add each node with information from the node list if available
        nodeUrls.forEach(url => {
          const matchingNode = nodeListEntries.find(([_, nodeInfo]) => 
            nodeInfo && typeof nodeInfo === 'object' && 'repository' in nodeInfo && nodeInfo.repository === url
          );
          
          if (matchingNode) {
            const [_, nodeInfo] = matchingNode;
            if (nodeInfo && typeof nodeInfo === 'object' && 'hash' in nodeInfo) {
              enhancedConfig.git_custom_nodes[url] = {
                hash: typeof nodeInfo.hash === 'string' ? nodeInfo.hash : "",
                disabled: false
              };
            } else {
              enhancedConfig.git_custom_nodes[url] = {
                hash: "",
                disabled: false
              };
            }
          } else {
            enhancedConfig.git_custom_nodes[url] = {
              hash: "",
              disabled: false
            };
          }
        });
      } else {
        // If already an object, enhance with information from node list
        Object.keys(enhancedConfig.git_custom_nodes).forEach(url => {
          const matchingNode = nodeListEntries.find(([_, nodeInfo]) => 
            nodeInfo && typeof nodeInfo === 'object' && 'repository' in nodeInfo && nodeInfo.repository === url
          );
          
          if (matchingNode) {
            const [_, nodeInfo] = matchingNode;
            if (nodeInfo && typeof nodeInfo === 'object' && 'hash' in nodeInfo && 
                typeof nodeInfo.hash === 'string' && 
                enhancedConfig.git_custom_nodes[url] && 
                !enhancedConfig.git_custom_nodes[url].hash) {
              enhancedConfig.git_custom_nodes[url].hash = nodeInfo.hash;
            }
          }
        });
      }
    }
    
    return enhancedConfig;
  }, [nodeList, fetchNodeList]);

  // Enhanced download function that cross-checks nodes
  const downloadJson = async (data: any, filename: string) => {
    if (data && data.comfyui) {
      // Format for machine configuration export
      const exportData: {
        comfyui: string;
        git_custom_nodes: Record<string, { hash: string; disabled: boolean }>;
        file_custom_nodes: any[];
      } = {
        "comfyui": "22ad513c72b891322f7baf6b459aa41858087b3b", // Use the exact hash required
        "git_custom_nodes": {} as Record<string, { hash: string; disabled: boolean }>,
        "file_custom_nodes": []
      };
      
      // Add the comfyui-deploy node first
      exportData.git_custom_nodes["https://github.com/rossman22590/comfyui-deploy.git"] = {
        "hash": "40fc9d2914b8f1fc68534635146241d2cebca72b",
        "disabled": false
      };
      
      // Cross-check with ComfyUI-Manager node list and enhance the data
      const enhancedData = await crossCheckNodes(data);
      
      // Add other custom nodes if they exist
      if (enhancedData.git_custom_nodes) {
        if (Array.isArray(enhancedData.git_custom_nodes)) {
          // Convert array format to object format
          enhancedData.git_custom_nodes.forEach((url: string) => {
            if (url !== "https://github.com/rossman22590/comfyui-deploy.git") {
              exportData.git_custom_nodes[url] = {
                "hash": "",
                "disabled": false
              };
            }
          });
        } else {
          // It's already an object, merge with our base nodes
          Object.entries(enhancedData.git_custom_nodes as Record<string, any>).forEach(([url, config]) => {
            if (url !== "https://github.com/rossman22590/comfyui-deploy.git") {
              exportData.git_custom_nodes[url] = {
                hash: config.hash || "",
                disabled: config.disabled || false
              };
            }
          });
        }
      }
      
      // Create the JSON blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (Array.isArray(data)) {
      // Format for models export
      const modelsData = data.map(model => {
        // Ensure each model has all required fields
        return {
          "url": model.url || "",
          "base": model.base || "",
          "name": model.name || "",
          "type": model.type || "checkpoints",
          "filename": model.filename || "",
          "reference": model.reference || "",
          "save_path": model.save_path || "default",
          "description": model.description || ""
        };
      });
      
      // Create the JSON blob and download
      const blob = new Blob([JSON.stringify(modelsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Generic JSON export for other data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const processedNodes = React.useMemo(() => {
    if (!config || !config.git_custom_nodes) return {};
    
    // Handle git_custom_nodes as either an object or an array
    if (Array.isArray(config.git_custom_nodes)) {
      // If it's an array, convert to object format
      return config.git_custom_nodes.reduce((acc, url) => {
        acc[url] = { hash: "", disabled: false };
        return acc;
      }, {} as Record<string, CustomNode>);
    } else {
      // It's already an object
      return config.git_custom_nodes as Record<string, CustomNode>;
    }
  }, [config]);

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center">
            <ServerIcon className="h-5 w-5 mr-2 text-blue-400" />
            Machine Configuration
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => downloadJson(getModelsFromUI(), "models.json")}
              className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export Models
            </button>
            
            <button
              onClick={() => downloadJson(config, "machine_config.json")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export Config
            </button>
          </div>
        </div>
        
        <div className="mb-6 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div className="text-sm font-medium text-blue-400 mb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            ComfyUI Version
          </div>
          <div className="flex items-center text-sm">
            <div className="font-mono bg-gray-700 px-2 py-1 rounded text-green-400">
              {config.comfyui || "Unknown"}
            </div>
            <div className="ml-2 text-gray-400">
              {config.comfyui ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-indigo-400 mb-3 flex items-center">
            <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></div>
            Custom Nodes
          </h3>
          {Object.keys(processedNodes).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(processedNodes).map(([url, node], idx) => {
                const repoName = url.split('/').pop()?.replace('.git', '') || url;
                const bgGradient = getNodeTypeColor(url);
                
                return (
                  <div key={idx} className={`bg-gradient-to-br ${bgGradient} p-4 rounded-lg shadow-md border border-gray-700`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate max-w-[70%]">{repoName}</span>
                      {node.disabled ? (
                        <div className="flex items-center text-red-300">
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          <span className="text-xs">Disabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-300">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          <span className="text-xs">Active</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-200 hover:text-blue-100 flex items-center"
                      >
                        <span className="truncate max-w-[300px]">{url}</span>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <div className="mt-3 p-2 bg-black bg-opacity-30 rounded text-xs">
                      <div className="font-mono">Commit: <span className="text-gray-300">{node.hash.substring(0, 8)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic p-4 bg-gray-800 rounded-lg border border-gray-700">
              No custom nodes installed
            </div>
          )}
        </div>
        
        {modelsList.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-pink-400 mb-3 flex items-center">
              <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 animate-pulse"></div>
              Models
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modelsList.map((model, idx) => {
                const bgGradient = getModelTypeColor(model.type);
                
                return (
                  <div key={idx} className={`bg-gradient-to-br ${bgGradient} p-4 rounded-lg shadow-md border border-gray-700`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{model.name}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30">{model.type}</span>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black bg-opacity-30 p-2 rounded">
                        <span className="text-gray-400">Base:</span> <span className="text-gray-200">{model.base}</span>
                      </div>
                      <div className="bg-black bg-opacity-30 p-2 rounded">
                        <span className="text-gray-400">Path:</span> <span className="text-gray-200">{model.save_path}</span>
                      </div>
                    </div>
                    
                    {model.description && (
                      <div className="mt-3 text-xs bg-black bg-opacity-30 p-2 rounded">
                        <span className="text-gray-400">Description:</span><br />
                        <span className="text-gray-200">{model.description}</span>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center space-x-3">
                      <a 
                        href={model.reference} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded-lg text-blue-100 flex items-center transition-colors"
                      >
                        Reference <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                      </a>
                      
                      <a 
                        href={model.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-green-800 hover:bg-green-700 px-2 py-1 rounded-lg text-green-100 flex items-center transition-colors"
                      >
                        Download <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function isMachineConfig(text: string): boolean {
  try {
    const json = JSON.parse(text);
    return json && 
      typeof json === 'object' && 
      typeof json.comfyui === 'string' && 
      (typeof json.git_custom_nodes === 'object' || Array.isArray(json.git_custom_nodes));
  } catch (e) {
    return false;
  }
}

export function isModelsConfig(text: string): boolean {
  try {
    const json = JSON.parse(text);
    return Array.isArray(json) && 
      json.length > 0 && 
      json.every(item => 
        typeof item === 'object' && 
        typeof item.name === 'string' && 
        typeof item.type === 'string'
      );
  } catch (e) {
    return false;
  }
}
