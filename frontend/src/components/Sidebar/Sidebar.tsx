import React, { useState } from 'react';
import type { ConversationCanvas } from '../../types/conversation';
import './Sidebar.css';

interface SidebarProps {
  canvases: ConversationCanvas[];
  activeCanvasId: string | null;
  onCanvasSelect: (canvasId: string) => void;
  onCanvasDelete: (canvasId: string) => void;
  onCanvasAdd: () => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
}

/**
 * 侧边栏组件
 * 显示画布列表，每个画布是一个独立的对话空间
 */
export const Sidebar: React.FC<SidebarProps> = ({
  canvases,
  activeCanvasId,
  onCanvasSelect,
  onCanvasDelete,
  onCanvasAdd,
  onExportData,
  onImportData,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // 按创建时间倒序排列
  const sortedCanvases = [...canvases].sort((a, b) => b.createdAt - a.createdAt);

  const handleCanvasClick = (canvasId: string) => {
    onCanvasSelect(canvasId);
  };

  const handleDeleteClick = (e: React.MouseEvent, canvasId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个对话空间吗？')) {
      onCanvasDelete(canvasId);
    }
  };

  const handleExportClick = () => {
    if (onExportData) {
      onExportData();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportData) {
      onImportData(file);
    }
    // 清空输入，以便可以重复选择相同文件
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div 
      className={`sidebar-container ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* 触发器标签 */}
      <div className="sidebar-trigger">
        <div className="trigger-icon">
          <span>📋</span>
          <span className="trigger-text">画布列表</span>
        </div>
        <div className="trigger-count">{canvases.length}</div>
      </div>

      {/* 侧边栏主体 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>对话空间</h3>
          <span className="node-count">{canvases.length}</span>
        </div>

        <div className="sidebar-content">
          {sortedCanvases.length === 0 ? (
            <div className="empty-state">
              <p>暂无对话空间</p>
              <span>点击下方按钮创建</span>
            </div>
          ) : (
            <ul className="node-list">
              {sortedCanvases.map((canvas) => {
                const isActive = activeCanvasId === canvas.id;
                
                return (
                  <li
                    key={canvas.id}
                    className={`canvas-item ${isActive ? 'selected' : ''}`}
                    onClick={() => handleCanvasClick(canvas.id)}
                  >
                    <div className="canvas-item-content">
                      <div className="canvas-item-header">
                        <span className="canvas-title">
                          {canvas.title}
                        </span>
                        <button
                          className="delete-canvas-btn"
                          onClick={(e) => handleDeleteClick(e, canvas.id)}
                          title="删除画布"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="canvas-item-meta">
                        <span className="canvas-nodes-count">
                          {canvas.nodes.length} 个对话节点
                        </span>
                        <span className="canvas-time">
                          {new Date(canvas.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sidebar-footer">
          <button 
            className="add-conversation-btn"
            onClick={onCanvasAdd}
          >
            <span>➕</span>
            <span>新建对话空间</span>
          </button>
          
          {/* 数据导入/导出 */}
          {(onExportData || onImportData) && (
            <div className="sidebar-actions">
              {onExportData && (
                <button 
                  className="sidebar-action-btn"
                  onClick={handleExportClick}
                  title="导出所有画布数据"
                >
                  <span>💾</span>
                  <span>导出</span>
                </button>
              )}
              {onImportData && (
                <>
                  <button 
                    className="sidebar-action-btn"
                    onClick={handleImportClick}
                    title="导入画布数据"
                  >
                    <span>📂</span>
                    <span>导入</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
