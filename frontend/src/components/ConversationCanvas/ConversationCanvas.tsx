import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type Connection,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
  ConnectionMode,
  ConnectionLineType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { AnyCanvasNode } from '../../types/conversation';
import { ConversationCard } from '../ConversationCard/ConversationCard';
import { SectionCard } from '../SectionCard/SectionCard';
import { TextCard } from '../TextCard/TextCard';
import { CommentCard } from '../CommentCard/CommentCard';
import { NoteCard } from '../NoteCard/NoteCard';
import { DrawingCard } from '../DrawingCard/DrawingCard';
import { ShapeCard } from '../ShapeCard/ShapeCard';
import { MediaCard } from '../MediaCard/MediaCard';
import './ConversationCanvas.css';

// 自定义节点组件 - 根据节点类型渲染不同的卡片
const UniversalNodeComponent: React.FC<{ data: any }> = ({ data }) => {
  const { node, onSelect, onAddChild, onDelete, onUpdate, onSetNodeDraggable } = data;
  const isSelected = data.isSelected || false;

  // 根据节点类型渲染不同的组件
  switch (node.type) {
    case 'dialogue':
    case 'question':
      return (
        <div className="canvas-node-wrapper">
          <ConversationCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        </div>
      );

    case 'section':
      return (
        <div className="canvas-node-wrapper">
          <SectionCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onSetDraggable={onSetNodeDraggable}
          />
        </div>
      );

    case 'text':
      return (
        <div className="canvas-node-wrapper">
          <TextCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onSetDraggable={onSetNodeDraggable}
          />
        </div>
      );

    case 'comment':
      return (
        <div className="canvas-node-wrapper">
          <CommentCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onSetDraggable={onSetNodeDraggable}
          />
        </div>
      );

    case 'note':
      return (
        <div className="canvas-node-wrapper">
          <NoteCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onSetDraggable={onSetNodeDraggable}
          />
        </div>
      );

    case 'drawing':
      return (
        <div className="canvas-node-wrapper">
          <DrawingCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      );

    case 'shape':
      return (
        <div className="canvas-node-wrapper">
          <ShapeCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      );

    case 'media':
      return (
        <div className="canvas-node-wrapper">
          <MediaCard
            node={node}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      );

    default:
      return (
        <div className="canvas-node-wrapper">
          <div>Unknown node type: {node.type}</div>
        </div>
      );
  }
};

// 将nodeTypes定义移到组件外部，避免重复创建
const nodeTypes = {
  universal: UniversalNodeComponent,
} as const;

interface ConversationCanvasProps {
  nodes: AnyCanvasNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
  onEdgeConnect?: (sourceId: string, targetId: string) => void;
  onEdgeDisconnect?: (targetId: string) => void;
  onDrop?: (position: { x: number; y: number }, toolType: string) => void; // 拖拽放置
  onConnectEndInBlank?: (sourceId: string, position: { x: number; y: number }) => void; // 拖拽连接到空白处
  onNodeUpdate?: (nodeId: string, updates: Partial<AnyCanvasNode>) => void; // 更新节点
  onPaneClick?: () => void; // 点击空白画布
  drawingMode?: boolean; // 绘画模式
  onDrawingModeExit?: () => void; // 退出绘画模式
}

/**
 * 无限画布组件
 * 用于展示和操作对话节点树
 */
export const ConversationCanvas: React.FC<ConversationCanvasProps> = ({
  nodes: conversationNodes,
  selectedNodeId,
  onNodeSelect,
  onAddChild,
  onDelete,
  onNodePositionChange,
  onEdgeConnect,
  onEdgeDisconnect,
  onDrop,
  onConnectEndInBlank,
  onNodeUpdate,
  onPaneClick,
  drawingMode = false,
  onDrawingModeExit,
}) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  
  // 节点拖拽状态管理
  const [nodeDraggableStates, setNodeDraggableStates] = React.useState<Record<string, boolean>>({});
  
  // Section 拖拽时的内部节点追踪
  const sectionDragInfo = useRef<{
    sectionId: string;
    startPosition: { x: number; y: number };
    innerNodeIds: string[];
    innerNodesStartPositions: Record<string, { x: number; y: number }>;
  } | null>(null);
  
  // 绘画相关状态
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawingPaths, setDrawingPaths] = React.useState<string>('');
  const [currentPath, setCurrentPath] = React.useState<{ x: number; y: number }[]>([]);
  const [drawingColor, setDrawingColor] = React.useState('#000000');
  const [strokeWidth, setStrokeWidth] = React.useState(3);
  const svgRef = useRef<SVGSVGElement>(null);

  // 设置节点拖拽状态
  const setNodeDraggable = useCallback((nodeId: string, draggable: boolean) => {
    setNodeDraggableStates(prev => ({
      ...prev,
      [nodeId]: draggable,
    }));
  }, []);

  // 拖拽处理
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const toolType = event.dataTransfer.getData('tool-type');
      if (!toolType || !onDrop) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onDrop(position, toolType);
    },
    [onDrop, reactFlowInstance]
  );

  // 将ConversationNode转换为ReactFlow的Node格式
  const initialNodes: Node[] = useMemo(() => {
    return conversationNodes.map((node) => ({
      id: node.id,
      type: 'universal',
      position: node.position,
      draggable: nodeDraggableStates[node.id] !== false, // 默认可拖拽，除非明确设置为false
      zIndex: node.type === 'section' ? -1 : 0, // section永远在底层
      data: {
        node,
        isSelected: selectedNodeId === node.id,
        onSelect: () => onNodeSelect(node.id),
        onAddChild: onAddChild,
        onDelete: onDelete,
        onUpdate: onNodeUpdate,
        onSetNodeDraggable: (draggable: boolean) => setNodeDraggable(node.id, draggable),
      },
    }));
  }, [conversationNodes, selectedNodeId, nodeDraggableStates, onNodeSelect, onAddChild, onDelete, onNodeUpdate, setNodeDraggable]);

  // 生成边（连接父子节点）- 思维导图风格
  const initialEdges: Edge[] = useMemo(() => {
    return conversationNodes
      .filter((node) => !!node.parentId)
      .map((node) => ({
        id: `edge-${node.parentId}-${node.id}`,
        source: node.parentId!,
        target: node.id,
        sourceHandle: 'output', // 明确指定源连接点ID
        targetHandle: 'input',  // 明确指定目标连接点ID
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#667eea',
          strokeWidth: 2.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#667eea',
        },
      }));
  }, [conversationNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 当conversationNodes变化时，同步更新ReactFlow的nodes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // 当conversationNodes变化时，同步更新ReactFlow的edges
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // 处理节点拖拽开始
  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const draggedNode = conversationNodes.find(n => n.id === node.id);
      if (!draggedNode || draggedNode.type !== 'section') {
        sectionDragInfo.current = null;
        return;
      }

      // 如果是 section，记录内部节点信息
      const sectionNode = draggedNode as any;
      const sectionWidth = sectionNode.width || 300;
      const sectionHeight = sectionNode.height || 200;
      const sectionPos = sectionNode.position;

      // 找出所有在section内的节点
      const innerNodes = conversationNodes.filter(n => {
        if (n.id === node.id || n.type === 'section') return false;
        return (
          n.position.x >= sectionPos.x &&
          n.position.x <= sectionPos.x + sectionWidth &&
          n.position.y >= sectionPos.y &&
          n.position.y <= sectionPos.y + sectionHeight
        );
      });

      // 记录初始位置信息
      const innerNodesStartPositions: Record<string, { x: number; y: number }> = {};
      innerNodes.forEach(n => {
        innerNodesStartPositions[n.id] = { ...n.position };
      });

      sectionDragInfo.current = {
        sectionId: node.id,
        startPosition: { ...sectionPos },
        innerNodeIds: innerNodes.map(n => n.id),
        innerNodesStartPositions,
      };
    },
    [conversationNodes]
  );

  // 处理节点拖拽中（实时更新）
  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!sectionDragInfo.current || sectionDragInfo.current.sectionId !== node.id) {
        return;
      }

      const { startPosition, innerNodeIds, innerNodesStartPositions } = sectionDragInfo.current;
      const deltaX = node.position.x - startPosition.x;
      const deltaY = node.position.y - startPosition.y;

      // 实时更新内部节点的位置
      setNodes((nds) =>
        nds.map((n) => {
          if (innerNodeIds.includes(n.id)) {
            const startPos = innerNodesStartPositions[n.id];
            return {
              ...n,
              position: {
                x: startPos.x + deltaX,
                y: startPos.y + deltaY,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // 处理节点拖拽结束
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodePositionChange) {
        onNodePositionChange(node.id, node.position);
      }
      // 清除section拖拽信息
      sectionDragInfo.current = null;
    },
    [onNodePositionChange]
  );

  // 处理边的删除（右键或按Delete键）
  const onEdgeDeleteHandler = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        if (onEdgeDisconnect) {
          onEdgeDisconnect(edge.target);
        }
      });
    },
    [onEdgeDisconnect]
  );

  // 连接开始时记录源节点（只记录从output handle开始的连接）
  const onConnectStartHandler = useCallback(
    (_: React.MouseEvent | React.TouchEvent, params: { nodeId: string | null; handleId: string | null; handleType: string | null }) => {
      // 只有从 output handle（右侧）拖拽时才记录，input handle（左侧）不能拖拽创建
      if (params.handleId === 'output' && params.handleType === 'source') {
        connectingNodeId.current = params.nodeId;
      } else {
        connectingNodeId.current = null;
      }
    },
    []
  );

  // 处理新连接的创建（拖拽连接到节点）
  const onConnectHandler = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || !onEdgeConnect) return;
      
      // 检查是否会造成循环引用
      const checkCircular = (nodeId: string, targetId: string): boolean => {
        if (nodeId === targetId) return true;
        const node = conversationNodes.find(n => n.id === nodeId);
        if (node?.parentId) {
          return checkCircular(node.parentId, targetId);
        }
        return false;
      };

      if (checkCircular(params.source, params.target)) {
        alert('无法创建循环连接！');
        return;
      }

      // 通知外部更新连接
      onEdgeConnect(params.source, params.target);
      connectingNodeId.current = null;
    },
    [conversationNodes, onEdgeConnect]
  );

  // 连接结束时，如果没有连接到节点，在空白处创建新节点
  const onConnectEndHandler = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const sourceNodeId = connectingNodeId.current;
      
      if (!sourceNodeId || !onConnectEndInBlank) {
        connectingNodeId.current = null;
        return;
      }

      // 检查是否点击在空白处（pane或background）
      const target = event.target as Element;
      const targetIsPane = target.classList.contains('react-flow__pane') || 
                          target.classList.contains('react-flow__background') ||
                          target.classList.contains('react-flow__container');
      
      if (targetIsPane) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        });

        // 调用回调创建新节点
        onConnectEndInBlank(sourceNodeId, position);
      }
      
      connectingNodeId.current = null;
    },
    [onConnectEndInBlank, reactFlowInstance]
  );

  // 绘画功能
  const handleDrawingMouseDown = useCallback((e: React.MouseEvent) => {
    if (!drawingMode || !svgRef.current) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, [drawingMode]);

  const handleDrawingMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawingMode || !svgRef.current) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, { x, y }]);
  }, [isDrawing, drawingMode]);

  const handleDrawingMouseUp = useCallback(() => {
    if (!isDrawing || currentPath.length === 0) return;
    
    // 将当前路径转换为SVG路径字符串
    const pathString = currentPath.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
    
    // 合并到已有路径
    setDrawingPaths(prev => prev ? `${prev} ${pathString}` : pathString);
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath]);

  const handleClearDrawing = useCallback(() => {
    setDrawingPaths('');
    setCurrentPath([]);
  }, []);

  const handleExitDrawingMode = useCallback(() => {
    setIsDrawing(false);
    setCurrentPath([]);
    if (onDrawingModeExit) {
      onDrawingModeExit();
    }
  }, [onDrawingModeExit]);

  // 监听ESC键退出绘画模式
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawingMode) {
        handleExitDrawingMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingMode, handleExitDrawingMode]);

  // 渲染当前正在绘制的路径
  const renderCurrentPath = () => {
    if (currentPath.length < 2) return null;
    
    const pathString = currentPath.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
    
    return (
      <path
        d={pathString}
        stroke={drawingColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  };

  return (
    <div 
      ref={reactFlowWrapper}
      className="conversation-canvas-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStartHandler}
        onConnect={onConnectHandler}
        onConnectEnd={onConnectEndHandler}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={onEdgeDeleteHandler}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitView
        attributionPosition="bottom-left"
        // 启用连线编辑功能
        edgesFocusable={true}
        // 连线样式
        connectionLineStyle={{
          stroke: '#667eea',
          strokeWidth: 2,
        }}
        connectionLineType={ConnectionLineType.SmoothStep}
        // 交互规则配置
        panOnDrag={[1, 2]} // 中键(1)和右键(2)可以拖拽画布，左键(0)不行
        selectionOnDrag={true} // 左键拖拽启用框选
        panOnScroll={true} // 滚轮缩放
        selectionMode="partial" // 部分选中模式
        multiSelectionKeyCode="Shift" // 按住Shift多选
        deleteKeyCode="Delete" // Delete键删除
        selectionKeyCode={null} // 不需要特殊键就能框选
      >
        <Controls showInteractive={true} />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.node?.type === 'dialogue') return '#667eea';
            return '#999';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1}
          color="#999"
        />
      </ReactFlow>

      {/* 绘画层 */}
      {drawingMode && (
        <>
          <svg
            ref={svgRef}
            className="drawing-overlay"
            onMouseDown={handleDrawingMouseDown}
            onMouseMove={handleDrawingMouseMove}
            onMouseUp={handleDrawingMouseUp}
            onMouseLeave={handleDrawingMouseUp}
          >
            {/* 已绘制的路径 */}
            {drawingPaths && (
              <path
                d={drawingPaths}
                stroke={drawingColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
            {/* 当前正在绘制的路径 */}
            {renderCurrentPath()}
          </svg>

          {/* 绘画工具栏 */}
          <div className="drawing-toolbar-overlay">
            <div className="drawing-toolbar-content">
              <div className="drawing-tools-section">
                <label className="drawing-tool-label">颜色:</label>
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="drawing-color-input"
                />
              </div>

              <div className="drawing-tools-section">
                <label className="drawing-tool-label">粗细:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="drawing-stroke-input"
                />
                <span className="drawing-stroke-display">{strokeWidth}px</span>
              </div>

              <button
                className="drawing-clear-button"
                onClick={handleClearDrawing}
                title="清空绘画"
              >
                🗑️ 清空
              </button>

              <button
                className="drawing-exit-button"
                onClick={handleExitDrawingMode}
                title="退出绘画模式 (ESC)"
              >
                ✓ 完成
              </button>
            </div>
            <div className="drawing-hint">
              按 ESC 或点击 "完成" 退出绘画模式
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 包装器组件，提供ReactFlowProvider
export const ConversationCanvasWrapper: React.FC<ConversationCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ConversationCanvas {...props} />
    </ReactFlowProvider>
  );
};
