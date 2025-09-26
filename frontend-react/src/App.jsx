// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useConversation } from './stores/conversation';
import MindMapNode from './components/MindMapNode';
import './App.css';

// 定义自定义节点类型
const nodeTypes = {
  mindMapNode: MindMapNode,
};

function App() {
  const { rootNodes, loading, addRootNodeWithQuestion, resetTree, addChildNode } = useConversation();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [debugMode, setDebugMode] = useState(false);

  // 将树结构转换为 ReactFlow 元素 - 改进的思维导图布局
  const convertToReactFlowElements = useCallback((nodes) => {
    const newNodes = [];
    const newEdges = [];
    const nodeMap = new Map();

    const processNode = (node, parentId = null, depth = 0, x = 0, y = 0) => {
      // 创建节点元素 - 使用自适应大小
      const nodeElement = {
        id: node.id,
        type: 'mindMapNode',
        position: { x, y },
        data: { 
          node, 
          isRoot: parentId === null,
          loading: loading && node.id === (rootNodes.find(rn => rn.id === node.id) ? node.id : null),
          onAddChild: addChildNode,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: depth === 0 ? '#f0f8ff' : '#ffffff',
          border: depth === 0 ? '3px solid #007bff' : '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minWidth: '250px',
          maxWidth: '400px',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }
      };

      newNodes.push(nodeElement);
      nodeMap.set(node.id, nodeElement);

      // 如果有父节点，创建边
      if (parentId) {
        const edge = {
          id: `edge-${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          animated: true,
          style: {
            stroke: '#e0e0e0',
            strokeWidth: 2,
          },
          type: 'smoothstep',
        };
        newEdges.push(edge);
      }

      // 处理子节点 - 使用分层布局
      if (node.children && node.children.length > 0) {
        const childCount = node.children.length;
        const spacingY = 150; // 垂直间距
        const startY = y - (childCount - 1) * spacingY / 2; // 垂直居中排列
        
        node.children.forEach((child, index) => {
          const childX = x + 300; // 水平距离
          const childY = startY + index * spacingY;
          
          processNode(child, node.id, depth + 1, childX, childY);
        });
      }
    };

    // 处理所有根节点 - 居中显示
    nodes.forEach((rootNode, index) => {
      const x = 0; // 中心节点在中间
      const y = index * 200; // 如果有多个根节点，垂直排列
      processNode(rootNode, null, 0, x, y);
    });

    return { nodes: newNodes, edges: newEdges };
  }, [loading, rootNodes, addChildNode]);

  // 初始化元素
  useEffect(() => {
    if (rootNodes.length > 0) {
      const { nodes: newNodes, edges: newEdges } = convertToReactFlowElements(rootNodes);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [rootNodes, convertToReactFlowElements]);

  // 处理添加根节点
  const handleAddRootClick = useCallback(async () => {
    if (loading) return;
    
    const question = prompt('请输入中心主题:');
    if (question && question.trim()) {
      try {
        await addRootNodeWithQuestion(question.trim());
      } catch (error) {
        console.error('[ERROR] 添加中心主题失败:', error);
        alert(`添加中心主题失败: ${error.message || '未知错误'}`);
      }
    }
  }, [loading, addRootNodeWithQuestion]);

  // 处理节点变化
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  // 处理边变化
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // 处理连接
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div id="app">
      <header className="app-header">
        <h1>🧠 BrainTree</h1>
        <p>智能思维导图 - 探索思维的无限可能</p>
      </header>

      <main className="app-main">
        <div className="tree-container">
          {rootNodes.length > 0 ? (
            <div className="react-flow-wrapper">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.5 }}
                connectionMode="loose"
                onNodeDragStop={() => {
                  // 可选：保存位置到 localStorage
                }}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </div>
          ) : (
            <div className="empty-state">
              <p>开始创建你的第一个思维导图吧！</p>
              <button 
                onClick={handleAddRootClick} 
                className="add-root-btn" 
                disabled={loading}
              >
                + 添加中心主题
              </button>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h3>控制面板</h3>
            <button onClick={resetTree} className="reset-btn" disabled={loading}>
              重置思维导图
            </button>
          </div>

          <div className="sidebar-section">
            <h3>统计信息</h3>
            <p>节点总数: {rootNodes.reduce((count, node) => count + countNodes(node), 0)}</p>
            <p>根节点数: {rootNodes.length}</p>
            <p>加载状态: {loading ? '是' : '否'}</p>

            {debugMode && (
              <div className="debug-info">
                <h4>调试信息</h4>
                <p>Store 状态: {JSON.stringify({ nodes: rootNodes.length, loading }, null, 2)}</p>
                <p>根节点: {JSON.stringify(rootNodes, null, 2)}</p>
              </div>
            )}
            <button onClick={() => setDebugMode(!debugMode)} className="debug-btn" disabled={loading}>
              {debugMode ? '隐藏' : '显示'}调试信息
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// 辅助函数：计算节点总数
const countNodes = (node) => {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => count += countNodes(child));
  }
  return count;
};

export default App;