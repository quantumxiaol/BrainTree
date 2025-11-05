import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import type { AnyCanvasNode } from '../../types/conversation';
import './ConversationCard.css';

interface ConversationCardProps {
  node: AnyCanvasNode;
  isSelected?: boolean;
  onSelect: () => void;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
}

/**
 * 对话卡片组件
 * 展示对话节点，悬停显示操作按钮
 */
export const ConversationCard: React.FC<ConversationCardProps> = ({
  node,
  isSelected = false,
  onSelect,
  onAddChild,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    // 清除任何待执行的隐藏定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // 延迟500ms后隐藏按钮，给用户更多时间移动鼠标
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverTimeoutRef.current = null;
    }, 500);
  }, []);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild(node.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个对话节点吗？')) {
      onDelete(node.id);
    }
  };

  return (
    <div
      className={`conversation-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ReactFlow连接点 - 输入端（只接收连线） */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="custom-handle custom-handle-input"
        isConnectable={true}
      />
      
      {/* ReactFlow连接点 - 输出端（拖拽创建或连接） */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="custom-handle custom-handle-output"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isConnectable={true}
      >
        <div className="handle-icon">⋮⋮</div>
        <div className="handle-tooltip">拖拽创建</div>
      </Handle>

      {/* 额外的创建子节点按钮 */}
      {isHovered && (
        <button
          className="card-add-child-btn"
          onClick={handleAddClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="创建"
        >
          +
        </button>
      )}

      {/* 悬停时显示删除按钮 */}
      {isHovered && (
        <button
          className="card-delete-btn"
          onClick={handleDeleteClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="删除"
        >
          ✕
        </button>
      )}

      <div className="card-content">
        {/* 对话节点 - 显示主题和概述 */}
        {node.type === 'dialogue' && (
          <>
            {node.status === 'pending' && (
              <div className="card-pending">
                <span className="pending-icon">✏️</span>
                <p>待输入问题...</p>
              </div>
            )}
            {node.status !== 'pending' && (
              <>
                {node.title && (
                  <div className="card-title">
                    <h3>{node.title}</h3>
                  </div>
                )}
                {node.summary && (
                  <div className="card-summary">
                    <p>{node.summary}</p>
                  </div>
                )}
                {node.isLoading && (
                  <div className="card-loading">
                    <span>AI正在思考...</span>
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* 普通问题节点 - 显示问题和答案 */}
        {node.type === 'question' && (
          <>
            <div className="card-question">
              <span className="question-label">问：</span>
              <p className="question-text">{node.question}</p>
            </div>
            {node.answer && (
              <div className="card-answer">
                <span className="answer-label">答：</span>
                <p className="answer-text">{node.answer}</p>
              </div>
            )}
          </>
        )}

        {/* 其他类型节点的展示逻辑将在后续实现 */}

        <div className="card-footer">
          <span className="card-time">
            {new Date(node.createdAt).toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {node.type === 'dialogue' && (
            <span className="card-type-badge">💬 AI对话</span>
          )}
        </div>
      </div>
    </div>
  );
};
