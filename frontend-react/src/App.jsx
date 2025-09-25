// src/App.jsx
import React, { useState, useRef, useCallback } from 'react';
import TreeNode from './components/TreeNode';
import { useConversation } from './stores/conversation'; // Import hook
import './App.css'; // Import CSS

function App() {
  const { rootNodes, loading, addRootNodeWithQuestion, resetTree } = useConversation(); // Use hook - loading 现在来自 store
  const [debugMode, setDebugMode] = useState(false);
  const [showAddRootInput, setShowAddRootInput] = useState(false); // 控制显示根节点输入框
  const [newRootQuestion, setNewRootQuestion] = useState(''); // 存储根节点问题
  const inputRef = useRef(null); // 引用输入框

  // 定义 countNodes 函数
  const countNodes = (node) => {
    let count = 1; // Count the current node
    if (node.children) {
      node.children.forEach(child => count += countNodes(child)); // 递归调用
    }
    return count;
  };

  const storeState = {
    nodesCount: rootNodes.reduce((count, node) => count + countNodes(node), 0),
    rootNodesCount: rootNodes.length,
    loading // Use the loading state from the store
  };

  // 处理添加根节点输入框的显示/隐藏
  const handleAddRootClick = useCallback(() => {
    if (loading) return; // 如果 store 正在加载（比如正在添加节点），则不响应点击
    setShowAddRootInput(true);
    // Focus after state update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [loading]); // 依赖 loading 状态

  // 处理发送根节点问题
  const sendRootQuestion = useCallback(async () => {
    if (!newRootQuestion.trim() || loading) return; // 防止重复提交或空输入，检查 store 的 loading

    try {
      await addRootNodeWithQuestion(newRootQuestion); // 调用 store 中的 action
      setNewRootQuestion(''); // 清空输入
      setShowAddRootInput(false); // 隐藏输入框
    } catch (error) {
      console.error('[ERROR] 添加根节点失败:', error);
      alert(`添加根节点失败: ${error.message || '未知错误'}`);
    }
  }, [newRootQuestion, loading, addRootNodeWithQuestion]); // 依赖 loading 和 addRootNodeWithQuestion


  return (
    <div id="app">
      <header className="app-header">
        <h1>🧠 BrainTree</h1>
        <p>智能对话树 - 探索思维的无限可能</p>
      </header>

      <main className="app-main">
        <div className="tree-container">
          {rootNodes.map(rootNode => (
            <TreeNode
              key={rootNode.id}
              node={rootNode}
              depth={0}
            />
          ))}

          {rootNodes.length === 0 && (
            <div className="empty-state">
              <p>开始创建你的第一个对话分支吧！</p>
              {/* 显示输入框而不是按钮 */}
              {showAddRootInput ? (
                <div className="input-section">
                  <textarea
                    ref={inputRef}
                    value={newRootQuestion}
                    onChange={(e) => setNewRootQuestion(e.target.value)}
                    placeholder="请输入你的第一个问题..."
                    className="input-textarea"
                    rows="3"
                    // 修改 onKeyDown 逻辑：Enter 换行，Ctrl/Cmd+Enter 发送
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { // 按下 Ctrl+Enter 或 Cmd+Enter (Mac)
                        e.preventDefault(); // 防止换行
                        sendRootQuestion(); // 调用发送函数
                      }
                      if (e.key === 'Escape') {
                        if (!loading) { // 防止在加载时取消
                          setShowAddRootInput(false);
                          setNewRootQuestion(''); // Clear on cancel
                        }
                      }
                    }}
                    disabled={loading} // 禁用输入框，当 store 正在加载时
                  />
                  <div className="input-actions">
                    {/* 直接绑定 sendRootQuestion */}
                    <button
                      onClick={sendRootQuestion}
                      disabled={!newRootQuestion.trim() || loading}
                      className="send-btn"
                    >
                      {loading ? '发送中...' : '发送'}
                    </button>
                    <button
                      onClick={() => {
                        if (!loading) {
                          setShowAddRootInput(false);
                          setNewRootQuestion('');
                        }
                      }}
                      className="cancel-btn"
                      disabled={loading}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={handleAddRootClick} className="add-root-btn" disabled={loading}>
                  + 添加根节点 {loading && '(处理中...)'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h3>控制面板</h3>
            <button onClick={resetTree} className="reset-btn" disabled={loading}>
              重置对话树
            </button>
          </div>

          <div className="sidebar-section">
            <h3>统计信息</h3>
            <p>节点总数: {storeState.nodesCount}</p>
            <p>根节点数: {storeState.rootNodesCount}</p>
            <p>加载状态: {storeState.loading ? '是' : '否'}</p>

            {debugMode && (
              <div className="debug-info">
                <h4>调试信息</h4>
                <p>Store 状态: {JSON.stringify(storeState, null, 2)}</p>
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

export default App