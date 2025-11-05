import React, { useRef, useState, useEffect } from 'react';
import type { DrawingNode } from '../../types/conversation';
import './DrawingCard.css';

interface DrawingCardProps {
  node: DrawingNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate?: (nodeId: string, updates: Partial<DrawingNode>) => void;
}

/**
 * Drawing 组件
 * 支持在画布上自由绘画
 */
export const DrawingCard: React.FC<DrawingCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<string>(node.paths || '');
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [strokeWidth, setStrokeWidth] = useState(node.strokeWidth || 3);
  const [color, setColor] = useState(node.color || '#000000');
  const [showToolbar, setShowToolbar] = useState(false);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 300;

  // 加载已保存的路径
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制已保存的路径
    if (paths) {
      const savedPath = new Path2D(paths);
      ctx.strokeStyle = node.color || '#000000';
      ctx.lineWidth = node.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(savedPath);
    }
  }, [paths, node.color, node.strokeWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 更新当前路径
    const newPath = [...currentPath, { x, y }];
    setCurrentPath(newPath);

    // 绘制当前笔画
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return;

    // 将当前路径转换为 SVG 路径字符串
    const pathString = currentPath.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${acc} L ${point.x} ${point.y}`;
    }, '');

    // 合并到已有路径
    const newPaths = paths ? `${paths} ${pathString}` : pathString;
    setPaths(newPaths);

    if (onUpdate) {
      onUpdate(node.id, { 
        paths: newPaths,
        color,
        strokeWidth,
      });
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setPaths('');

    if (onUpdate) {
      onUpdate(node.id, { paths: '' });
    }
  };

  return (
    <div
      className={`drawing-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {/* 工具栏 */}
      {(showToolbar || isSelected) && (
        <div className="drawing-toolbar">
          <div className="drawing-tools">
            {/* 颜色选择 */}
            <div className="drawing-tool">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="选择颜色"
                className="drawing-color-picker"
              />
            </div>

            {/* 笔触大小 */}
            <div className="drawing-tool">
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                title="笔触大小"
                className="drawing-stroke-slider"
              />
              <span className="drawing-stroke-value">{strokeWidth}px</span>
            </div>

            {/* 清空按钮 */}
            <button
              className="drawing-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                clearDrawing();
              }}
              title="清空画布"
            >
              🗑️
            </button>

            {/* 删除按钮 */}
            <button
              className="drawing-delete-btn"
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
      )}
    </div>
  );
};

