import React, { useState } from 'react';
import type { ShapeNode } from '../../types/conversation';
import './ShapeCard.css';

interface ShapeCardProps {
  node: ShapeNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<ShapeNode>) => void;
}

/**
 * Shape 组件
 * 支持插入各种基本图形
 */
export const ShapeCard: React.FC<ShapeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const handleColorChange = (color: string) => {
    if (onUpdate) {
      onUpdate(node.id, { color });
    }
  };

  const renderShape = () => {
    const color = node.color || '#667eea';
    const { width, height } = node;

    switch (node.shapeType) {
      case 'rectangle':
        return (
          <div
            className="shape-rectangle"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: color,
            }}
          />
        );

      case 'circle':
        return (
          <div
            className="shape-circle"
            style={{
              width: `${width}px`,
              height: `${width}px`, // 圆形使用相同的宽高
              backgroundColor: color,
            }}
          />
        );

      case 'triangle':
        return (
          <svg
            className="shape-triangle"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            <polygon
              points={`${width / 2},0 ${width},${height} 0,${height}`}
              fill={color}
            />
          </svg>
        );

      case 'arrow':
        return (
          <svg
            className="shape-arrow"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            <path
              d={`M 0,${height / 2} L ${width * 0.7},${height / 2} L ${width * 0.7},0 L ${width},${height / 2} L ${width * 0.7},${height} L ${width * 0.7},${height / 2} Z`}
              fill={color}
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`shape-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {renderShape()}

      {/* 工具栏 */}
      {(showToolbar || isSelected) && (
        <div className="shape-toolbar">
          <input
            type="color"
            value={node.color || '#667eea'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="shape-color-picker"
            title="更改颜色"
          />
          <button
            className="shape-delete-btn"
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
    </div>
  );
};

