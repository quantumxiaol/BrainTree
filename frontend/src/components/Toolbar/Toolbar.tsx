import React, { useState, useRef } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  onAddNode: () => void;
  onAddSection?: (position?: { x: number; y: number }) => void;
  onAddText?: (position?: { x: number; y: number }) => void;
  onAddComment?: (position?: { x: number; y: number }) => void;
  onAddNote?: (position?: { x: number; y: number }) => void;
  onAddDrawing?: (position?: { x: number; y: number }) => void;
  onAddShape?: (shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow', position?: { x: number; y: number }) => void;
  onAddMedia?: (file: File, position?: { x: number; y: number }) => void;
  onArrange?: () => void; // 整理节点布局
  nodeCount: number;
}

interface ToolItem {
  id: string;
  icon: string;
  label: string;
  onClick?: () => void;
  draggable?: boolean;
}

/**
 * 工具栏组件
 * 位于屏幕底部中心，提供模块化工具集
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onAddSection,
  onAddText,
  onAddComment,
  onAddNote,
  onAddDrawing,
  onAddShape,
  onAddMedia,
  onArrange,
}) => {
  const [showGraphicPicker, setShowGraphicPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSection = () => {
    if (onAddSection) {
      onAddSection();
    } else {
      console.log('Add section');
    }
  };

  const handleAddText = () => {
    if (onAddText) {
      onAddText();
    } else {
      console.log('Insert text');
    }
  };

  const handleAddComment = () => {
    if (onAddComment) {
      onAddComment();
    } else {
      console.log('Add comment');
    }
  };

  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote();
    } else {
      console.log('Add note');
    }
  };

  const handleAddDrawing = () => {
    if (onAddDrawing) {
      onAddDrawing();
    } else {
      console.log('Draw');
    }
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow') => {
    if (onAddShape) {
      onAddShape(shapeType);
    }
    setShowGraphicPicker(false);
  };

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddMedia) {
      onAddMedia(file);
    }
    // 清空输入，以便可以重复选择相同文件
    if (e.target) {
      e.target.value = '';
    }
  };

  const tools: ToolItem[] = [
    { id: 'dialogue', icon: '💬', label: 'Dialogue', onClick: onAddNode, draggable: true },
    { id: 'section', icon: '📦', label: 'Section', onClick: handleAddSection, draggable: true },
    { id: 'text', icon: '📝', label: 'Text', onClick: handleAddText, draggable: true },
    { id: 'comment', icon: '💭', label: 'Comment', onClick: handleAddComment, draggable: true },
    { id: 'pencil', icon: '✏️', label: 'Pencil', onClick: handleAddDrawing, draggable: true },
    { id: 'note', icon: '📌', label: 'Note', onClick: handleAddNote, draggable: true },
  ];

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/reactflow', toolId);
    e.dataTransfer.setData('tool-type', toolId);
  };

  return (
    <div className="toolbar-wrapper">
      <div className="toolbar-container">
        <div className="toolbar-section">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-btn ${tool.draggable ? 'draggable' : ''}`}
              onClick={tool.onClick}
              title={tool.draggable ? `${tool.label} (可拖拽到画布)` : tool.label}
              draggable={tool.draggable}
              onDragStart={(e) => tool.draggable && handleDragStart(e, tool.id)}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          {/* Graphic 工具 - 悬浮显示图形选择器 */}
          <div 
            className="tool-btn-wrapper"
            onMouseEnter={() => setShowGraphicPicker(true)}
            onMouseLeave={() => setShowGraphicPicker(false)}
          >
            <button
              className="tool-btn"
              title="Graphic"
            >
              <span className="tool-icon">🖼️</span>
              <span className="tool-label">Graphic</span>
            </button>
            
            {showGraphicPicker && (
              <div className="graphic-picker">
                <button
                  className="graphic-option"
                  onClick={() => handleAddShape('rectangle')}
                  title="矩形"
                >
                  <div className="graphic-preview rectangle">⬜</div>
                  <span>Rectangle</span>
                </button>
                <button
                  className="graphic-option"
                  onClick={() => handleAddShape('circle')}
                  title="圆形"
                >
                  <div className="graphic-preview circle">⭕</div>
                  <span>Circle</span>
                </button>
                <button
                  className="graphic-option"
                  onClick={() => handleAddShape('triangle')}
                  title="三角形"
                >
                  <div className="graphic-preview triangle">🔺</div>
                  <span>Triangle</span>
                </button>
                <button
                  className="graphic-option"
                  onClick={() => handleAddShape('arrow')}
                  title="箭头"
                >
                  <div className="graphic-preview arrow">➡️</div>
                  <span>Arrow</span>
                </button>
              </div>
            )}
          </div>

          {/* Media 工具 */}
          <button
            className="tool-btn"
            onClick={handleMediaClick}
            title="Media"
          >
            <span className="tool-icon">🎬</span>
            <span className="tool-label">Media</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* 整理功能 */}
        {onArrange && (
          <>
            <div className="toolbar-divider"></div>
            <div className="toolbar-section">
              <button
                className="tool-btn arrange-btn"
                onClick={onArrange}
                title="自动整理节点布局"
              >
                <span className="tool-icon">✨</span>
                <span className="tool-label">整理</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
