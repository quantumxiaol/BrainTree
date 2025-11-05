import React, { useState, useRef, useEffect } from 'react';
import type { TextNode } from '../../types/conversation';
import './TextCard.css';

interface TextCardProps {
  node: TextNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<TextNode>) => void;
  onSetDraggable?: (draggable: boolean) => void;
}

/**
 * Text 组件
 * 支持在画布上直接点击输入文字
 */
export const TextCard: React.FC<TextCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onSetDraggable,
}) => {
  const [isEditing, setIsEditing] = useState(!node.content); // 如果没有内容，默认进入编辑模式
  const [content, setContent] = useState(node.content);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleFocus = () => {
    // 输入框获得焦点时，禁用节点拖拽
    if (onSetDraggable) {
      onSetDraggable(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdate && content !== node.content) {
      onUpdate(node.id, { content });
    }
    // 输入框失去焦点时，恢复节点拖拽
    if (onSetDraggable) {
      onSetDraggable(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setContent(node.content); // 恢复原内容
      // 恢复拖拽
      if (onSetDraggable) {
        onSetDraggable(true);
      }
    }
  };

  return (
    <div
      className={`text-card ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
      onClick={() => onSelect(node.id)}
      onDoubleClick={handleDoubleClick}
      style={{
        fontSize: node.fontSize || 16,
        color: node.color || '#333',
      }}
    >
      {isEditing ? (
        <textarea
          ref={textAreaRef}
          className="text-card-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="输入文本..."
          style={{
            fontSize: node.fontSize || 16,
            color: node.color || '#333',
          }}
        />
      ) : (
        <div className="text-card-display">
          {content || '双击编辑文本'}
        </div>
      )}
      {isSelected && !isEditing && (
        <button
          className="text-card-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          title="删除"
        >
          ×
        </button>
      )}
    </div>
  );
};

