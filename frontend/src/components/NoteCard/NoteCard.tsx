import React, { useState, useRef, useEffect } from 'react';
import type { NoteNode } from '../../types/conversation';
import './NoteCard.css';

interface NoteCardProps {
  node: NoteNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<NoteNode>) => void;
  onSetDraggable?: (draggable: boolean) => void;
}

const NOTE_COLORS = [
  { name: '黄色', value: '#fef3c7' },
  { name: '粉色', value: '#fce7f3' },
  { name: '蓝色', value: '#dbeafe' },
  { name: '绿色', value: '#d1fae5' },
  { name: '紫色', value: '#e9d5ff' },
  { name: '橙色', value: '#fed7aa' },
];

/**
 * Note 组件
 * 便利贴，支持编辑内容和选择颜色
 */
export const NoteCard: React.FC<NoteCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onSetDraggable,
}) => {
  const [content, setContent] = useState(node.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // 自动调整高度
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleFocus = () => {
    // 输入框获得焦点时，禁用节点拖拽
    if (onSetDraggable) {
      onSetDraggable(false);
    }
  };

  const handleBlur = () => {
    if (onUpdate && content !== node.content) {
      onUpdate(node.id, { content });
    }
    // 输入框失去焦点时，恢复节点拖拽
    if (onSetDraggable) {
      onSetDraggable(true);
    }
  };

  const handleColorChange = (color: string) => {
    if (onUpdate) {
      onUpdate(node.id, { color });
    }
    setShowColorPicker(false);
  };

  const backgroundColor = node.color || NOTE_COLORS[0].value;

  return (
    <div
      className={`note-card ${isSelected ? 'selected' : ''}`}
      style={{ backgroundColor }}
      onClick={() => onSelect(node.id)}
    >
      {/* 便利贴顶部装饰 */}
      <div className="note-top-decoration" />

      {/* 内容区域 */}
      <textarea
        ref={textAreaRef}
        className="note-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="在这里写点什么..."
        style={{ backgroundColor }}
      />

      {/* 工具栏 */}
      {isSelected && (
        <div className="note-toolbar">
          <button
            className="note-color-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title="更改颜色"
          >
            🎨
          </button>
          <button
            className="note-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            title="删除"
          >
            ×
          </button>
        </div>
      )}

      {/* 颜色选择器 */}
      {showColorPicker && (
        <div className="note-color-picker">
          {NOTE_COLORS.map((color) => (
            <button
              key={color.value}
              className="note-color-option"
              style={{ backgroundColor: color.value }}
              onClick={(e) => {
                e.stopPropagation();
                handleColorChange(color.value);
              }}
              title={color.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

