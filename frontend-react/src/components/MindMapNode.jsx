// src/components/MindMapNode.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';
import { Handle, Position } from 'reactflow';
import './MindMapNode.css';

const MindMapNode = ({ data }) => {
  const { node, loading, isRoot, onAddChild } = data;
  const [showInput, setShowInput] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const inputRef = useRef(null);

  // 当节点数据变化时，更新本地加载状态
  useEffect(() => {
    if (!loading) {
      setLocalLoading(false);
    }
  }, [loading]);

  const handleAddClick = useCallback(() => {
    setShowInput(true);
    // 延迟聚焦，确保DOM已更新
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  const sendQuestion = useCallback(async () => {
    if (!newQuestion.trim() || !onAddChild || localLoading) return;
    
    setLocalLoading(true); // 设置本地加载状态
    
    try {
      await onAddChild(node.id, newQuestion);
      setNewQuestion('');
      setShowInput(false);
    } catch (error) {
      console.error('[ERROR] 发送问题失败:', error);
      alert(`发送问题失败: ${error.message || '未知错误'}`);
    } finally {
      setLocalLoading(false); // 重置本地加载状态
    }
  }, [newQuestion, node.id, onAddChild, localLoading]);

  const handleDeleteClick = useCallback(() => {
    if (window.confirm('确定要删除这个节点吗？此操作不可撤销。')) {
      // 这里需要调用 store 的 deleteNode，但当前组件没有直接访问权限
      console.log('删除节点:', node.id);
    }
  }, [node.id]);

  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <div className="mind-map-node">
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
            disabled={localLoading}
          >
            +
          </button>
          {!isRoot && (
            <button
              className="delete-btn"
              onClick={handleDeleteClick}
              title="删除节点"
            >
              ×
            </button>
          )}
        </div>

        {showInput && (
          <div className="input-section">
            <textarea
              ref={inputRef}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="请输入您的想法/问题..."
              className="input-textarea"
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  sendQuestion();
                }
                if (e.key === 'Escape') {
                  setShowInput(false);
                }
              }}
              disabled={localLoading}
            />
            <div className="input-actions">
              <button
                onClick={sendQuestion}
                disabled={!newQuestion.trim() || localLoading}
                className="send-btn"
              >
                {localLoading ? '发送中...' : '发送'}
              </button>
              <button
                onClick={() => setShowInput(false)}
                className="cancel-btn"
                disabled={localLoading}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </>
  );
};

export default MindMapNode;