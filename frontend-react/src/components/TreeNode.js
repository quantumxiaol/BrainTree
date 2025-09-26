// src/components/TreeNode.js
import React, { useState, useRef, useCallback } from 'react';
import MarkdownContent from './MarkdownContent';
import { useConversation } from '../stores/conversation';
import './TreeNode.css';

const TreeNode = ({ node, depth, isRoot = false }) => {
  const { addChildNode, deleteNode } = useConversation();
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
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  const sendQuestion = useCallback(async () => {
    if (!newQuestion.trim()) return;

    try {
      await addChildNode(node.id, newQuestion);
      setNewQuestion('');
      setShowInput(false);
      setIsExpanded(true);
    } catch (error) {
      console.error('[ERROR] 发送问题失败:', error);
      alert(`发送问题失败: ${error.message || '未知错误'}`);
    }
  }, [newQuestion, node.id, addChildNode]);

  const handleDeleteClick = useCallback(() => {
    if (window.confirm('确定要删除这个节点吗？此操作不可撤销。')) {
      deleteNode(node.id);
    }
  }, [node.id, deleteNode]);

  // 计算节点位置偏移
  const marginLeft = depth * 40; // 增加缩进以适应思维导图布局

  return (
    <div className={`tree-node depth-${depth}`} style={{ marginLeft }}>
      <div className="node-header" onClick={toggleExpand}>
        <div className="node-content">
          {(node.question || node.answer) && (
            <div className="node-body">
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
          )}
        </div>
        
        <div className="node-actions">
          <button
            className="add-btn"
            onClick={handleAddClick}
            title="添加子主题"
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
          />
          <div className="input-actions">
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
              isRoot={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;