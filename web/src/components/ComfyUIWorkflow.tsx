"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';

type ComfyNode = {
  id: number;
  type: string;
  pos: [number, number];
  size?: [number, number];
  inputs?: {
    name: string;
    type: string;
    link?: number;
  }[];
  outputs?: {
    name: string;
    type: string;
    links?: number[];
    slot_index?: number;
  }[];
  widgets_values?: any[];
  properties?: any;
};

type ComfyUIWorkflowProps = {
  workflowJson: string | object;
};

// Custom node component that mimics ComfyUI styling
const ComfyUINode = ({ data }: { data: any }) => {
  const getNodeColor = (nodeType: string) => {
    const typeColors: Record<string, string> = {
      'KSampler': '#423C5E',
      'CLIPTextEncode': '#2F4858',
      'VAEDecode': '#1F6582',
      'CheckpointLoaderSimple': '#264653',
      'EmptyLatentImage': '#287271',
      'SaveImage': '#2A9D8F',
      'LoadImage': '#66999B',
      'SONICTLoader': '#542344',
      'SONICSampler': '#8338EC',
      'LoadAudio': '#A42CD6',
      'ImageOnlyCheckpointLoader': '#3A86FF',
      'SONIC_PreData': '#FB5607',
      'VHS_VideoCombine': '#FF006E',
      // Default for other node types
      'default': '#2D3748'
    };

    return typeColors[nodeType] || typeColors.default;
  };

  const nodeColor = getNodeColor(data.type);

  return (
    <div
      className="comfyui-node"
      style={{
        background: nodeColor,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        width: '100%',
        color: 'white',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {/* Node Header */}
      <div style={{
        padding: '8px 10px',
        background: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontSize: '12px',
        fontWeight: 'bold',
      }}>
        {data.type}
      </div>

      {/* Input Ports */}
      {data.inputs && data.inputs.length > 0 && (
        <div style={{ padding: '6px 10px' }}>
          {data.inputs.map((input: any, idx: number) => (
            <div key={`in-${idx}`} className="flex items-center my-1" style={{ position: 'relative', fontSize: '10px' }}>
              <Handle
                type="target"
                position={Position.Left}
                id={idx.toString()}
                style={{
                  background: getColorForType(input.type),
                  width: '8px',
                  height: '8px',
                  left: '-4px',
                  top: '10px'
                }}
              />
              <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.8)' }}>{input.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Widget Values */}
      {data.widgets_values && data.widgets_values.length > 0 && (
        <div style={{
          padding: '6px 10px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.1)'
        }}>
          {data.widgets_values.map((val: any, idx: number) => (
            <div key={`val-${idx}`} style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.7)',
              padding: '2px 0',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              {String(val).substring(0, 25)}{String(val).length > 25 ? '...' : ''}
            </div>
          ))}
        </div>
      )}

      {/* Output Ports */}
      {data.outputs && data.outputs.length > 0 && (
        <div style={{ padding: '6px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {data.outputs.map((output: any, idx: number) => (
            <div key={`out-${idx}`} className="flex items-center justify-end my-1" style={{ position: 'relative', fontSize: '10px' }}>
              <span style={{ marginRight: '8px', color: 'rgba(255,255,255,0.8)' }}>{output.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={idx.toString()}
                style={{
                  background: getColorForType(output.type),
                  width: '8px',
                  height: '8px',
                  right: '-4px',
                  top: '10px'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  default: ComfyUINode
};

function getColorForType(type: string): string {
  const typeColors: Record<string, string> = {
    "MODEL": "#FF5607",
    "CONDITIONING": "#8338EC",
    "LATENT": "#FB8500",
    "IMAGE": "#3A86FF",
    "VAE": "#FFBE0B",
    "CLIP": "#06D6A0",
    "FLOAT": "#0AEFFF",
    "AUDIO": "#7209B7",
    "CLIP_VISION": "#4CC9F0",
    "CONTROL_NET": "#F72585",
    "MASK": "#B5179E",
    "DTYPE": "#560BAD",
    "SONIC_PREDATA": "#F15BB5",
    "MODEL_SONIC": "#9B5DE5",
    "VHS_FILENAMES": "#00BBF9",
    "VHS_BatchManager": "#00F5D4",
    // Default for other types
    "default": "#CCCCCC"
  };

  return typeColors[type] || typeColors.default;
};

export default function ComfyUIWorkflow({ workflowJson }: ComfyUIWorkflowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const workflow = useMemo(() => {
    try {
      return typeof workflowJson === 'string'
        ? JSON.parse(workflowJson)
        : workflowJson;
    } catch (e) {
      console.error("Error parsing workflow JSON:", e);
      return null;
    }
  }, [workflowJson]);

  useEffect(() => {
    if (!workflow || !workflow.nodes) return;

    // Normalize coordinates - find min/max position values to center the graph
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // First pass - find bounds
    workflow.nodes.forEach((node: ComfyNode) => {
      minX = Math.min(minX, node.pos[0]);
      minY = Math.min(minY, node.pos[1]);
      maxX = Math.max(maxX, node.pos[0]);
      maxY = Math.max(maxY, node.pos[1]);
    });

    // Check if we need to normalize (very spread out coordinates)
    const needsNormalization = maxX - minX > 5000 || maxY - minY > 5000;

    // Split the nodes into groups based on position proximity
    const nodeGroups: { [key: string]: ComfyNode[] } = {};
    if (needsNormalization) {
      workflow.nodes.forEach((node: ComfyNode) => {
        // Create a grouping key based on position (rounded to nearest 1000)
        const groupX = Math.round(node.pos[0] / 1000) * 1000;
        const groupY = Math.round(node.pos[1] / 1000) * 1000;
        const groupKey = `${groupX}_${groupY}`;

        if (!nodeGroups[groupKey]) {
          nodeGroups[groupKey] = [];
        }
        nodeGroups[groupKey].push(node);
      });
    } else {
      // If no normalization needed, put all nodes in one group
      nodeGroups['all'] = workflow.nodes;
    }

    // Convert ComfyUI nodes to ReactFlow nodes
    const reactFlowNodes: Node[] = [];

    // Process each group of nodes
    let groupOffsetX = 0;
    let groupOffsetY = 0;

    Object.keys(nodeGroups).forEach((groupKey) => {
      const nodes = nodeGroups[groupKey];

      // Find local min coordinates for this group
      let localMinX = Infinity;
      let localMinY = Infinity;

      nodes.forEach((node: ComfyNode) => {
        localMinX = Math.min(localMinX, node.pos[0]);
        localMinY = Math.min(localMinY, node.pos[1]);
      });

      // Create nodes with normalized positions
      nodes.forEach((node: ComfyNode) => {
        // For normalized position, use relative positioning within the group
        // and add group offset to maintain group separation
        const normalizedX = node.pos[0] - localMinX + groupOffsetX;
        const normalizedY = node.pos[1] - localMinY + groupOffsetY;

        reactFlowNodes.push({
          id: node.id.toString(),
          type: 'default',
          position: {
            x: normalizedX,
            y: normalizedY
          },
          data: {
            id: node.id,
            type: node.type,
            widgets_values: node.widgets_values,
            properties: node.properties,
            inputs: node.inputs,
            outputs: node.outputs
          },
          style: {
            width: node.size ? node.size[0] : 250,
            minWidth: '250px',
          }
        });
      });

      // Adjust group offset for next group - use more horizontal space
      if (needsNormalization) {
        groupOffsetX += 1000; // Increased space between groups horizontally
        if (groupOffsetX > 3000) {
          groupOffsetX = 0;
          groupOffsetY += 500; // Move to next row if too many groups in a row
        }
      }
    });

    // Convert ComfyUI links to ReactFlow edges
    const reactFlowEdges: Edge[] = [];

    if (workflow.links && Array.isArray(workflow.links)) {
      workflow.links.forEach((link: any) => {
        if (Array.isArray(link) && link.length >= 6) {
          const [id, sourceNodeId, sourceHandleId, targetNodeId, targetHandleId, type] = link;

          // Only create edges if both nodes are in our normalized set
          // (this handles cases where a node might be referenced in links but isn't in the nodes array)
          const sourceExists = reactFlowNodes.some(node => node.id === sourceNodeId.toString());
          const targetExists = reactFlowNodes.some(node => node.id === targetNodeId.toString());

          if (sourceExists && targetExists) {
            reactFlowEdges.push({
              id: id.toString(),
              source: sourceNodeId.toString(),
              target: targetNodeId.toString(),
              sourceHandle: sourceHandleId.toString(),
              targetHandle: targetHandleId.toString(),
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
              },
              style: {
                stroke: getColorForType(type || ''),
                strokeWidth: 3,
              },
              animated: true,
              data: { type }
            });
          }
        }
      });
    }

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);

    // Force re-render and fit view after a short delay
    const timer = setTimeout(() => {
      setNodes([...reactFlowNodes]);
    }, 100);

    return () => clearTimeout(timer);
  }, [workflow, setNodes, setEdges]);

  // If parsing failed, show an error
  if (!workflow) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">
        Invalid workflow JSON. Please check the format and try again.
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 shadow-lg w-full overflow-x-auto" style={{ height: 500 }}>
      <div className="p-3 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-200">
          ComfyUI Workflow Visualization
        </div>
        <div className="text-xs text-gray-400">
          {workflow.nodes.length} nodes, {workflow.links.length} connections
        </div>
      </div>
      <div style={{ height: 'calc(100% - 40px)', background: '#1A202C', minWidth: '1200px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.01}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
          fitViewOptions={{
            padding: 0.05,
            includeHiddenNodes: true,
            maxZoom: 0.7
          }}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
          panOnDrag={true}
          proOptions={{ hideAttribution: true }}
        >
          <Controls position="bottom-right" className="bg-gray-800 text-gray-200 border-gray-700" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            position="top-right"
            style={{
              height: 120,
              width: 200,
              background: 'rgba(26, 32, 44, 0.8)'
            }}
            nodeColor={(node) => {
              const nodeType = node.data?.type;
              if (!nodeType) return '#2D3748';

              const typeColors: Record<string, string> = {
                'KSampler': '#423C5E',
                'CLIPTextEncode': '#2F4858',
                'VAEDecode': '#1F6582',
                'CheckpointLoaderSimple': '#264653',
                'EmptyLatentImage': '#287271',
                'SaveImage': '#2A9D8F',
                'LoadImage': '#66999B',
                'SONICTLoader': '#542344',
                'SONICSampler': '#8338EC',
                'LoadAudio': '#A42CD6',
                'ImageOnlyCheckpointLoader': '#3A86FF',
                'SONIC_PreData': '#FB5607',
                'VHS_VideoCombine': '#FF006E',
                'default': '#2D3748'
              };

              return typeColors[nodeType] || typeColors.default;
            }}
          />
          <Background gap={16} size={1} color="#2D3748" />
        </ReactFlow>
      </div>
      <style jsx global>{`
        .comfyui-node {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .react-flow__handle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #fff;
        }
        .react-flow__edge-path {
          stroke-width: 2;
        }
        .react-flow__controls button {
          background-color: #2D3748;
          color: #E2E8F0;
          border-color: #4A5568;
        }
        .react-flow__controls button:hover {
          background-color: #4A5568;
        }
      `}</style>
    </div>
  );
}
