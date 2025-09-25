// src/components/TreeNode.js
import React, { useState, useRef, useCallback } from 'react';
import MarkdownContent from './MarkdownContent';
import { useConversation } from '../stores/conversation'; // Import hook
import './TreeNode.css'; // Import CSS

const TreeNode = ({ node, depth }) => {
  const { addChildNode, deleteNode } = useConversation(); // Use hook
  const [showInput, setShowInput] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef(null);

  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = useCallback(() => {
    if (hasChildren) {
      setIsExpanded(prev => !prev);
    }
  }, [hasChildren]);

  const handleAddClick = useCallback(() => {
    setShowInput(true);
    // Focus after state update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  // 修改 sendQuestion 函数，使其可以从外部调用
  const sendQuestion = useCallback(async () => {
    if (!newQuestion.trim()) return;

    try {
      await addChildNode(node.id, newQuestion);
      setNewQuestion('');
      setShowInput(false);
      setIsExpanded(true); // Expand to show new child
    } catch (error) {
      console.error('[ERROR] 发送问题失败:', error);
      alert(`发送问题失败: ${error.message || '未知错误'}`);
    }
  }, [newQuestion, node.id, addChildNode]);

  const handleDeleteClick = useCallback(() => {
    if (window.confirm('确定要删除这个节点吗？此操作不可撤销。')) {
      console.log('[DEBUG] 删除节点:', node.id);
      deleteNode(node.id);
    }
  }, [node.id, deleteNode]);

  return (
    <div className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="node-header" onClick={toggleExpand}>
        {hasChildren ? (
          <div className="expand-icon" onClick={e => e.stopPropagation()}> {/* Stop propagation on icon click */}
            {isExpanded ? '▼' : '▶'}
          </div>
        ) : (
          <div className="expand-icon-placeholder"></div>
        )}
        <div className="node-content">
          {node.question && (
            <div className="question">
              <strong>Q:</strong>
              <div className="markdown-wrapper">
                <MarkdownContent content={node.question} />
              </div>
            </div>
          )}
          {node.answer && (
            <div className="answer">
              <strong>A:</strong>
              <div className="markdown-wrapper">
                <MarkdownContent content={node.answer} />
              </div>
            </div>
          )}
        </div>
        <div className="node-actions">
          <button
            className="add-btn"
            onClick={handleAddClick}
            title="添加子节点"
          >
            +
          </button>
          <button
            className="delete-btn"
            onClick={handleDeleteClick}
            title="删除节点"
          >
            ×
          </button>
        </div>
      </div>

      {showInput && (
        <div className="input-section">
          <textarea
            ref={inputRef}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="请输入你的问题..."
            className="input-textarea"
            rows="3"
            // 修改 onKeyDown 逻辑：Enter 换行，Ctrl/Cmd+Enter 发送
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { // 按下 Ctrl+Enter 或 Cmd+Enter (Mac)
                e.preventDefault(); // 防止换行
                sendQuestion(); // 调用发送函数
              }
              if (e.key === 'Escape') {
                setShowInput(false);
              }
            }}
          />
          <div className="input-actions">
            {/* 直接绑定 sendQuestion */}
            <button
              onClick={sendQuestion}
              disabled={!newQuestion.trim()}
              className="send-btn"
            >
              发送
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="cancel-btn"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isExpanded && hasChildren && (
        <div className="children">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;