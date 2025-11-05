import { useState } from 'react';
import { ConversationCanvas, Toolbar, Sidebar, DialogueInput, DialogueViewer, EmptyState } from './components';
import { useCanvasManager } from './hooks/useCanvasManager';
import { callLLM } from './services/llm';
import { buildContextPath } from './utils/contextBuilder';
import type { Message, DialogueNode, QuestionNode } from './types/conversation';
import './App.css';

/**
 * 主应用组件
 * 基于树形结构的LLM交互对话系统
 */
function App() {
  const {
    canvases,
    activeCanvasId,
    currentNodes,
    selectedNodeId,
    createCanvas,
    deleteCanvas,
    switchCanvas,
    addDialogueNode,
    addQuestionNode,
    addSectionNode,
    addTextNode,
    addCommentNode,
    addNoteNode,
    addShapeNode,
    addMediaNode,
    deleteNode,
    updateNode,
    updateNodePosition,
    selectNode,
    connectNodes,
    disconnectNode,
  } = useCanvasManager();

  const [showDialogueInput, setShowDialogueInput] = useState(false);
  const [parentNodeForAdd, setParentNodeForAdd] = useState<string | undefined>(undefined);
  const [viewingNodeId, setViewingNodeId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState(false); // 绘画模式

  // 创建新画布
  const handleCreateCanvas = () => {
    createCanvas();
  };

  // 删除画布
  const handleDeleteCanvas = (canvasId: string) => {
    deleteCanvas(canvasId);
  };

  // 切换画布
  const handleSwitchCanvas = (canvasId: string) => {
    switchCanvas(canvasId);
  };

  // 显示对话输入框 - 创建根节点
  const handleAddRootNode = () => {
    setParentNodeForAdd(undefined);
    setShowDialogueInput(true);
  };

  // 显示对话输入框 - 创建子节点
  const handleAddChildNode = (parentId: string) => {
    setParentNodeForAdd(parentId);
    setShowDialogueInput(true);
  };

  // 处理拖拽创建节点
  const handleCanvasDrop = (position: { x: number; y: number }, toolType: string) => {
    if (!activeCanvasId) return;

    switch (toolType) {
      case 'dialogue':
      // 先创建待对话状态的节点
      const nodeId = addDialogueNode('', undefined, position);
      
      if (nodeId) {
        // 更新为pending状态
        updateNode(nodeId, { 
          status: 'pending',
          title: '待输入',
          summary: '点击输入问题...'
        });
        // 打开输入窗口
        setParentNodeForAdd(undefined);
        setShowDialogueInput(true);
        // 保存节点ID，用于后续更新
        setViewingNodeId(nodeId);
      }
        break;

      case 'section':
        addSectionNode('新分组', position);
        break;

      case 'text':
        addTextNode('', position);
        break;

      case 'comment':
        addCommentNode('', position);
        break;

      case 'pencil':
        // Pencil工具通过点击工具栏切换绘画模式，不通过拖拽创建
        break;

      case 'note':
        addNoteNode('', position);
        break;

      default:
        console.log('Unknown tool type:', toolType);
    }
  };

  // 处理从节点拖拽连接到空白处（创建子节点）
  const handleConnectEndInBlank = (sourceId: string, position: { x: number; y: number }) => {
    if (!activeCanvasId) return;
    
    // 先创建待对话状态的子节点
    const nodeId = addDialogueNode('', sourceId, position);
    
    if (nodeId) {
      // 更新为pending状态
      updateNode(nodeId, { 
        status: 'pending',
        title: '待输入',
        summary: '点击输入问题...'
      });
      // 打开输入窗口
      setParentNodeForAdd(sourceId);
      setShowDialogueInput(true);
      // 保存节点ID，用于后续更新
      setViewingNodeId(nodeId);
    }
  };

  // 构建上下文消息历史（使用工具函数）
  const buildContextMessages = (parentId?: string): Message[] => {
    if (!parentId) return [];
    return buildContextPath(parentId, currentNodes);
  };

  // 提交问题，创建节点
  const handleDialogueSubmit = async (question: string, connectLLM: boolean) => {
    if (!activeCanvasId) return;

    let nodeId: string | undefined;

    // 检查是否有已存在的pending节点需要更新
    if (viewingNodeId && currentNodes.find(n => n.id === viewingNodeId && n.type === 'dialogue')) {
      // 更新现有pending节点
      nodeId = viewingNodeId;
      updateNode(nodeId, {
        question,
        status: connectLLM ? 'loading' : 'completed',
        isLoading: connectLLM,
        title: undefined, // 清除临时标题
        summary: undefined, // 清除临时摘要
      });
    } else {
      // 创建新节点（正常流程，如点击工具栏按钮）
      let position = { x: 250, y: 100 };
      
      if (parentNodeForAdd) {
        const parentNode = currentNodes.find(n => n.id === parentNodeForAdd);
        if (parentNode) {
          position = {
            x: parentNode.position.x + 350,
            y: parentNode.position.y + Math.random() * 100 - 50,
          };
        }
      } else {
        position = {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        };
      }

      if (connectLLM) {
        nodeId = addDialogueNode(question, parentNodeForAdd, position);
      } else {
        nodeId = addQuestionNode(question, parentNodeForAdd, position);
      }
    }

    // 关闭输入窗口
    setShowDialogueInput(false);
    setParentNodeForAdd(undefined);
    
    if (connectLLM && nodeId) {
      // 连接LLM时，保持viewingNodeId以显示加载状态
      setViewingNodeId(nodeId);
      
      try {
        // 构建消息历史，包含父节点的上下文
        const contextMessages = buildContextMessages(parentNodeForAdd);
        
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: question,
          timestamp: Date.now(),
        };

        // 合并上下文和当前问题
        const messages: Message[] = [...contextMessages, userMessage];

        // 调用LLM API（传入完整上下文）
        const response = await callLLM(messages);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
        };

        // 更新节点，添加回答、主题和概述
        updateNode(nodeId, {
          title: response.title || '对话',
          summary: response.summary || response.content.slice(0, 50) + '...',
          answer: response.content,
          isLoading: false,
          status: 'completed',
          messages: [userMessage, assistantMessage], // 只保存当前对话，不重复保存上下文
        });
      } catch (error) {
        console.error('LLM调用失败:', error);
        // 更新节点，标记错误
        updateNode(nodeId, {
          answer: `抱歉，AI回答失败: ${error instanceof Error ? error.message : '未知错误'}`,
          isLoading: false,
          status: 'completed',
        });
      }
    } else {
      // 不连接LLM时，清除viewingNodeId
      setViewingNodeId(null);
    }
  };

  // 处理节点选择 - 打开查看器或输入窗口
  const handleNodeSelect = (nodeId: string) => {
    selectNode(nodeId);
    const node = currentNodes.find(n => n.id === nodeId);
    
    // 如果是pending状态的对话节点，只打开输入窗口，不打开查看器
    if (node && node.type === 'dialogue' && node.status === 'pending') {
      setViewingNodeId(nodeId); // 保存节点ID用于后续更新
      setParentNodeForAdd(node.parentId);
      setShowDialogueInput(true);
      // 注意：不要打开DialogueViewer
    } else {
      // 其他情况打开查看器
      setViewingNodeId(nodeId);
    }
  };

  // 关闭查看器
  const handleCloseViewer = () => {
    setViewingNodeId(null);
  };

  // 处理点击空白画布 - 取消选定
  const handlePaneClick = () => {
    selectNode(''); // 传入空字符串取消选定
    setViewingNodeId(null);
  };

  // 获取父节点的问题（用于显示）
  const getParentQuestion = () => {
    if (parentNodeForAdd) {
      const parentNode = currentNodes.find(n => n.id === parentNodeForAdd);
      if (parentNode && ('question' in parentNode)) {
        return parentNode.question;
      }
    }
    return undefined;
  };

  // 工具栏处理函数
  const handleAddSection = (position?: { x: number; y: number }) => {
    addSectionNode('新分组', position);
  };

  const handleAddText = (position?: { x: number; y: number }) => {
    addTextNode('', position);
  };

  const handleAddComment = (position?: { x: number; y: number }) => {
    addCommentNode('', position);
  };

  const handleAddNote = (position?: { x: number; y: number }) => {
    addNoteNode('', position);
  };

  const handleAddDrawing = () => {
    // 切换绘画模式而不是创建节点
    setDrawingMode(!drawingMode);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow', position?: { x: number; y: number }) => {
    addShapeNode(shapeType, position);
  };

  const handleAddMedia = (file: File, position?: { x: number; y: number }) => {
    // 判断文件类型
    let mediaType: 'image' | 'video' | 'audio';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
    } else {
      alert('不支持的文件类型！请选择图片、视频或音频文件。');
      return;
    }

    // 创建本地URL
    const url = URL.createObjectURL(file);
    addMediaNode(mediaType, url, file.name, position);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Brain-Tree</h1>
        </div>
      </header>

      <div className="app-body">
        <main className="app-main">
          {activeCanvasId ? (
            <ConversationCanvas
              nodes={currentNodes}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              onAddChild={handleAddChildNode}
              onDelete={deleteNode}
              onNodePositionChange={updateNodePosition}
              onEdgeConnect={connectNodes}
              onEdgeDisconnect={disconnectNode}
              onDrop={handleCanvasDrop}
              onConnectEndInBlank={handleConnectEndInBlank}
              onNodeUpdate={updateNode}
              onPaneClick={handlePaneClick}
              drawingMode={drawingMode}
              onDrawingModeExit={() => setDrawingMode(false)}
            />
          ) : (
            <EmptyState onCreateCanvas={handleCreateCanvas} />
          )}
        </main>

        {/* 悬浮侧边栏 */}
        <Sidebar
          canvases={canvases}
          activeCanvasId={activeCanvasId}
          onCanvasSelect={handleSwitchCanvas}
          onCanvasDelete={handleDeleteCanvas}
          onCanvasAdd={handleCreateCanvas}
        />
      </div>

      {/* 只在有活跃画布时显示工具栏 */}
      {activeCanvasId && (
        <Toolbar
          onAddNode={handleAddRootNode}
          onAddSection={handleAddSection}
          onAddText={handleAddText}
          onAddComment={handleAddComment}
          onAddNote={handleAddNote}
          onAddDrawing={handleAddDrawing}
          onAddShape={handleAddShape}
          onAddMedia={handleAddMedia}
          nodeCount={currentNodes.length}
        />
      )}

      {/* 对话输入对话框 */}
      {showDialogueInput && (
        <DialogueInput
          onSubmit={handleDialogueSubmit}
          onCancel={() => {
            setShowDialogueInput(false);
            setParentNodeForAdd(undefined);
          }}
          parentQuestion={getParentQuestion()}
        />
      )}

      {/* 对话查看器 */}
      {viewingNodeId && !showDialogueInput && (() => {
        const node = currentNodes.find(n => n.id === viewingNodeId);
        // 只有非pending状态的节点才显示查看器
        if (node && ('question' in node)) {
          // 如果是pending状态，不显示查看器
          if (node.type === 'dialogue' && node.status === 'pending') {
            return null;
          }
          return (
            <DialogueViewer
              node={node as DialogueNode | QuestionNode}
              onClose={handleCloseViewer}
            />
          );
        }
        return null;
      })()}
    </div>
  );
}

export default App;