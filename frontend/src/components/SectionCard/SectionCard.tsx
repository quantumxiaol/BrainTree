import React, { useState } from 'react';
import type { SectionNode } from '../../types/conversation';
import './SectionCard.css';

interface SectionCardProps {
  node: SectionNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<SectionNode>) => void;
  onSetDraggable?: (draggable: boolean) => void;
}

/**
 * Section 组件
 * 类似 Figma 的框，可以用来组织和框选内容
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onSetDraggable,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0,
    posX: 0,
    posY: 0 
  });

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
    if (onUpdate && title !== node.title) {
      onUpdate(node.id, { title });
    }
    // 输入框失去焦点时，恢复节点拖拽
    if (onSetDraggable) {
      onSetDraggable(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onUpdate && title !== node.title) {
        onUpdate(node.id, { title });
      }
      // 恢复拖拽
      if (onSetDraggable) {
        onSetDraggable(true);
      }
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault(); // 阻止默认行为，防止触发节点拖拽
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = node.width || 300;
    const startHeight = node.height || 200;
    const startPosX = node.position.x;
    const startPosY = node.position.y;
    
    setResizeStart({
      x: startX,
      y: startY,
      width: startWidth,
      height: startHeight,
      posX: startPosX,
      posY: startPosY,
    });
    
    // 禁用拖拽
    if (onSetDraggable) {
      onSetDraggable(false);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      // 根据拖拽方向调整位置和大小
      if (direction.includes('e')) {
        // 向右拖拽：固定左边，增加宽度
        newWidth = Math.max(300, startWidth + deltaX);
      }
      
      if (direction.includes('w')) {
        // 向左拖拽：固定右边，改变左边位置和宽度
        const potentialWidth = startWidth - deltaX;
        if (potentialWidth >= 300) {
          newWidth = potentialWidth;
          newPosX = startPosX + deltaX;
        } else {
          newWidth = 300;
          newPosX = startPosX + startWidth - 300;
        }
      }
      
      if (direction.includes('s')) {
        // 向下拖拽：固定上边，增加高度
        newHeight = Math.max(200, startHeight + deltaY);
      }
      
      if (direction.includes('n')) {
        // 向上拖拽：固定下边，改变上边位置和高度
        const potentialHeight = startHeight - deltaY;
        if (potentialHeight >= 200) {
          newHeight = potentialHeight;
          newPosY = startPosY + deltaY;
        } else {
          newHeight = 200;
          newPosY = startPosY + startHeight - 200;
        }
      }

      if (onUpdate) {
        onUpdate(node.id, { 
          width: newWidth, 
          height: newHeight,
          position: { x: newPosX, y: newPosY }
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // 恢复拖拽
      if (onSetDraggable) {
        onSetDraggable(true);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`section-card ${isSelected ? 'selected' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        width: node.width,
        height: node.height,
        backgroundColor: node.color || 'rgba(102, 126, 234, 0.05)',
        borderColor: node.color || '#667eea',
      }}
      onClick={() => onSelect(node.id)}
    >
      <div className="section-header">
        {isEditing ? (
          <input
            type="text"
            className="section-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <h3
            className="section-title"
            onDoubleClick={handleDoubleClick}
          >
            {title}
          </h3>
        )}
        <button
          className="section-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          title="删除"
        >
          ×
        </button>
      </div>
      
      {/* 调整大小的手柄 */}
      <div className="resize-handle resize-e nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'e')} />
      <div className="resize-handle resize-s nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className="resize-handle resize-w nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'w')} />
      <div className="resize-handle resize-n nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'n')} />
      <div className="resize-handle resize-se nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'se')} />
      <div className="resize-handle resize-sw nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      <div className="resize-handle resize-ne nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
      <div className="resize-handle resize-nw nopan nodrag" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
    </div>
  );
};

