import { useState, useCallback, useMemo } from 'react';
import type { ConversationCanvas, AnyCanvasNode, QuestionNode } from '../types/conversation';

/**
 * 画布管理Hook
 * 管理多个画布及其内部的对话节点
 */
export const useCanvasManager = () => {
  const [canvases, setCanvases] = useState<ConversationCanvas[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // 获取当前激活的画布
  const activeCanvas = useMemo(
    () => canvases.find((c) => c.id === activeCanvasId) || null,
    [canvases, activeCanvasId]
  );

  // 当前画布的节点
  const currentNodes = useMemo(
    () => activeCanvas?.nodes || [],
    [activeCanvas]
  );

  // 创建新画布
  const createCanvas = useCallback(() => {
    const newCanvas: ConversationCanvas = {
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `对话空间 ${canvases.length + 1}`,
      nodes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCanvases((prev) => [...prev, newCanvas]);
    setActiveCanvasId(newCanvas.id);
    return newCanvas.id;
  }, [canvases.length]);

  // 删除画布
  const deleteCanvas = useCallback((canvasId: string) => {
    setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
    if (activeCanvasId === canvasId) {
      setActiveCanvasId(null);
    }
  }, [activeCanvasId]);

  // 切换画布
  const switchCanvas = useCallback((canvasId: string) => {
    setActiveCanvasId(canvasId);
    setSelectedNodeId(null);
    setExpandedNodeId(null);
  }, []);

  // 更新画布标题
  const updateCanvasTitle = useCallback((canvasId: string, title: string) => {
    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === canvasId
          ? { ...canvas, title, updatedAt: Date.now() }
          : canvas
      )
    );
  }, []);

  // 在当前画布添加对话节点（连接LLM）
  const addDialogueNode = useCallback((question: string, parentId?: string, position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'dialogue',
      parentId,
      question,
      messages: [],
      isLoading: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 在当前画布添加普通问题节点（不连接LLM）
  const addQuestionNode = useCallback((question: string, parentId?: string, position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: QuestionNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'question',
      parentId,
      question,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    };

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Section 节点
  const addSectionNode = useCallback((title: string, position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'section',
      title,
      width: 400,
      height: 300,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Text 节点
  const addTextNode = useCallback((content: string, position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Comment 节点
  const addCommentNode = useCallback((content: string, position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'comment',
      content,
      resolved: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Note 节点
  const addNoteNode = useCallback((content: string, position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'note',
      content,
      color: '#fef3c7',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Drawing 节点
  const addDrawingNode = useCallback((position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'drawing',
      paths: '',
      color: '#000000',
      strokeWidth: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Shape 节点
  const addShapeNode = useCallback((shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow', position?: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape',
      shapeType,
      width: shapeType === 'circle' ? 100 : 150,
      height: 100,
      color: '#667eea',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 添加 Media 节点
  const addMediaNode = useCallback((
    mediaType: 'image' | 'video' | 'audio',
    url: string,
    filename: string,
    position?: { x: number; y: number }
  ) => {
    if (!activeCanvasId) return;

    const newNode: AnyCanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'media',
      mediaType,
      url,
      filename,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
    } as any;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: [...canvas.nodes, newNode],
              updatedAt: Date.now(),
            }
          : canvas
      )
    );

    return newNode.id;
  }, [activeCanvasId]);

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    if (!activeCanvasId) return;

    setCanvases((prev) =>
      prev.map((canvas) => {
        if (canvas.id !== activeCanvasId) return canvas;

        // 递归删除子节点
        const deleteRecursive = (id: string): string[] => {
          const children = canvas.nodes.filter((n) => n.parentId === id).map((n) => n.id);
          return [id, ...children.flatMap(deleteRecursive)];
        };

        const idsToDelete = deleteRecursive(nodeId);
        return {
          ...canvas,
          nodes: canvas.nodes.filter((node) => !idsToDelete.includes(node.id)),
          updatedAt: Date.now(),
        };
      })
    );

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    if (expandedNodeId === nodeId) {
      setExpandedNodeId(null);
    }
  }, [activeCanvasId, selectedNodeId, expandedNodeId]);

  // 更新节点位置
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    if (!activeCanvasId) return;

    setCanvases((prev) =>
      prev.map((canvas) => {
        if (canvas.id !== activeCanvasId) return canvas;

        const movingNode = canvas.nodes.find(n => n.id === nodeId);
        if (!movingNode) return canvas;

        // 如果移动的是 Section，需要同时移动内部的所有节点
        if (movingNode.type === 'section') {
          const sectionNode = movingNode as any; // SectionNode
          const oldPosition = sectionNode.position;
          const deltaX = position.x - oldPosition.x;
          const deltaY = position.y - oldPosition.y;

          // 检测哪些节点在 Section 内部
          const sectionWidth = sectionNode.width || 300;
          const sectionHeight = sectionNode.height || 200;

          const updatedNodes = canvas.nodes.map((node) => {
            if (node.id === nodeId) {
              // 更新 Section 自身的位置
              return { ...node, position, updatedAt: Date.now() };
            }
            
            // 检查节点是否在 Section 内部
            if (node.type !== 'section') {
              const nodeX = node.position.x;
              const nodeY = node.position.y;
              
              const isInside = 
                nodeX >= oldPosition.x &&
                nodeX <= oldPosition.x + sectionWidth &&
                nodeY >= oldPosition.y &&
                nodeY <= oldPosition.y + sectionHeight;

              if (isInside) {
                // 移动内部节点
                return {
                  ...node,
                  position: {
                    x: nodeX + deltaX,
                    y: nodeY + deltaY,
                  },
                  updatedAt: Date.now(),
                };
              }
            }

            return node;
          });

          return {
            ...canvas,
            nodes: updatedNodes,
            updatedAt: Date.now(),
          };
        }

        // 非 Section 节点，正常更新位置
        return {
          ...canvas,
          nodes: canvas.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, position, updatedAt: Date.now() }
              : node
          ),
          updatedAt: Date.now(),
        };
      })
    );
  }, [activeCanvasId]);

  // 更新节点
  const updateNode = useCallback((nodeId: string, updates: Partial<AnyCanvasNode>) => {
    if (!activeCanvasId) return;

    setCanvases((prev) =>
      prev.map((canvas) => {
        if (canvas.id !== activeCanvasId) return canvas;

        const targetNode = canvas.nodes.find(n => n.id === nodeId);
        if (!targetNode) return canvas;

        // 如果是 section 且 position 发生了变化，需要同时移动内部节点
        if (targetNode.type === 'section' && updates.position) {
          const sectionNode = targetNode as any;
          const oldPosition = sectionNode.position;
          const newPosition = updates.position;
          const deltaX = newPosition.x - oldPosition.x;
          const deltaY = newPosition.y - oldPosition.y;

          // 只有当位置真的发生变化时才移动内部节点
          if (deltaX !== 0 || deltaY !== 0) {
            const sectionWidth = updates.width ?? sectionNode.width ?? 300;
            const sectionHeight = updates.height ?? sectionNode.height ?? 200;

            const updatedNodes = canvas.nodes.map((node) => {
              if (node.id === nodeId) {
                return { ...node, ...updates, updatedAt: Date.now() } as AnyCanvasNode;
              }

              // 检查节点是否在 Section 内部（使用调整前的位置和大小）
              if (node.type !== 'section') {
                const nodeX = node.position.x;
                const nodeY = node.position.y;
                
                const isInside = 
                  nodeX >= oldPosition.x &&
                  nodeX <= oldPosition.x + (sectionNode.width || 300) &&
                  nodeY >= oldPosition.y &&
                  nodeY <= oldPosition.y + (sectionNode.height || 200);

                if (isInside) {
                  return {
                    ...node,
                    position: {
                      x: nodeX + deltaX,
                      y: nodeY + deltaY,
                    },
                    updatedAt: Date.now(),
                  };
                }
              }

              return node;
            });

            return {
              ...canvas,
              nodes: updatedNodes,
              updatedAt: Date.now(),
            };
          }
        }

        // 普通更新
        return {
          ...canvas,
          nodes: canvas.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, ...updates, updatedAt: Date.now() } as AnyCanvasNode
              : node
          ),
          updatedAt: Date.now(),
        };
      })
    );
  }, [activeCanvasId]);

  // 选择节点
  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  // 连接节点（创建父子关系）
  const connectNodes = useCallback((sourceId: string, targetId: string) => {
    if (!activeCanvasId) return;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: canvas.nodes.map((node) =>
                node.id === targetId
                  ? { ...node, parentId: sourceId, updatedAt: Date.now() }
                  : node
              ),
              updatedAt: Date.now(),
            }
          : canvas
      )
    );
  }, [activeCanvasId]);

  // 断开节点连接（移除父子关系）
  const disconnectNode = useCallback((nodeId: string) => {
    if (!activeCanvasId) return;

    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === activeCanvasId
          ? {
              ...canvas,
              nodes: canvas.nodes.map((node) =>
                node.id === nodeId
                  ? { ...node, parentId: undefined, updatedAt: Date.now() }
                  : node
              ),
              updatedAt: Date.now(),
            }
          : canvas
      )
    );
  }, [activeCanvasId]);

  // 展开节点详情
  const expandNode = useCallback((nodeId: string) => {
    setExpandedNodeId(nodeId);
  }, []);

  // 关闭详情
  const closeDetail = useCallback(() => {
    setExpandedNodeId(null);
  }, []);

  // 获取选中的节点
  const selectedNode = useMemo(
    () => currentNodes.find((n) => n.id === selectedNodeId) || null,
    [currentNodes, selectedNodeId]
  );

  // 获取展开的节点
  const expandedNode = useMemo(
    () => currentNodes.find((n) => n.id === expandedNodeId) || null,
    [currentNodes, expandedNodeId]
  );

  return {
    canvases,
    activeCanvasId,
    activeCanvas,
    currentNodes,
    selectedNodeId,
    selectedNode,
    expandedNodeId,
    expandedNode,
    createCanvas,
    deleteCanvas,
    switchCanvas,
    updateCanvasTitle,
    addDialogueNode,
    addQuestionNode,
    addSectionNode,
    addTextNode,
    addCommentNode,
    addNoteNode,
    addDrawingNode,
    addShapeNode,
    addMediaNode,
    deleteNode,
    updateNode,
    updateNodePosition,
    selectNode,
    connectNodes,
    disconnectNode,
    expandNode,
    closeDetail,
  };
};
