import React, { useState, useEffect, useRef } from 'react';
import type { CommentNode } from '../../types/conversation';
import './CommentCard.css';

interface CommentCardProps {
  node: CommentNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<CommentNode>) => void;
  onSetDraggable?: (draggable: boolean) => void;
}

/**
 * Comment 组件
 * 类似 Figma 的评论，平时折叠显示 logo，点击展开显示内容
 */
export const CommentCard: React.FC<CommentCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onSetDraggable,
}) => {
  const [isEditing, setIsEditing] = useState(!node.content);
  const [content, setContent] = useState(node.content);
  const prevIsSelectedRef = useRef(isSelected);

  // 展开状态由isSelected控制
  const isExpanded = isSelected;

  // 当卡片被取消选中时，退出编辑状态并恢复拖拽
  useEffect(() => {
    // 只在 isSelected 从 true 变为 false 时触发
    if (prevIsSelectedRef.current && !isSelected) {
      setIsEditing(false);
      setContent(node.content); // 恢复原内容
      // 恢复拖拽
      if (onSetDraggable) {
        onSetDraggable(true);
      }
    }
    prevIsSelectedRef.current = isSelected;
  }, [isSelected, node.content, onSetDraggable]);

  const handleToggle = () => {
    onSelect(node.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleFocus = () => {
    // 输入框获得焦点时，禁用节点拖拽
    if (onSetDraggable) {
      onSetDraggable(false);
    }
  };

  const handleBlur = () => {
    // 失去焦点时自动保存
    setIsEditing(false);
    if (onUpdate && content !== node.content) {
      onUpdate(node.id, { content });
    }
    // 恢复拖拽
    if (onSetDraggable) {
      onSetDraggable(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    // 实时保存
    if (onUpdate && newContent !== node.content) {
      onUpdate(node.id, { content: newContent });
    }
  };

  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(node.id, { resolved: !node.resolved });
    }
  };

  return (
    <div className={`comment-card ${isSelected ? 'selected' : ''}`}>
      {/* 折叠状态 - 只显示图标 */}
      {!isExpanded && (
        <div
          className={`comment-icon ${node.resolved ? 'resolved' : ''}`}
          onClick={handleToggle}
          title="点击查看评论"
        >
          💭
          {node.resolved && <span className="resolved-badge">✓</span>}
        </div>
      )}

      {/* 展开状态 - 显示完整内容 */}
      {isExpanded && (
        <div className="comment-content-wrapper">
          <div className="comment-header">
            <div className="comment-author">
              💭 {node.author || '匿名'}
            </div>
            <div className="comment-actions">
              <button
                className="comment-action-btn"
                onClick={handleResolve}
                title={node.resolved ? '标记为未解决' : '标记为已解决'}
              >
                {node.resolved ? '✓' : '○'}
              </button>
              <button
                className="comment-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                title="删除"
              >
                ×
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="comment-edit">
              <textarea
                className="comment-textarea"
                value={content}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="输入评论内容..."
                autoFocus
              />
            </div>
          ) : (
            <div className="comment-display" onClick={handleEdit}>
              {content || '点击编辑评论...'}
            </div>
          )}

          {node.resolved && (
            <div className="comment-resolved-tag">已解决</div>
          )}
        </div>
      )}
    </div>
  );
};

