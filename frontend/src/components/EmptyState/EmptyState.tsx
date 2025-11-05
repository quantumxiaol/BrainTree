import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  onCreateCanvas: () => void;
}

/**
 * 空状态组件 - 当没有活跃画布时显示
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateCanvas }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
            <path d="M40 50 L60 30 L80 50 M60 35 L60 70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="40" cy="70" r="8" fill="currentColor" opacity="0.6"/>
            <circle cx="60" cy="85" r="8" fill="currentColor" opacity="0.8"/>
            <circle cx="80" cy="70" r="8" fill="currentColor" opacity="0.6"/>
            <line x1="40" y1="70" x2="60" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
            <line x1="60" y1="85" x2="80" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
          </svg>
        </div>
        
        <h2 className="empty-state-title">开始您的对话之旅</h2>
        <p className="empty-state-description">
          创建一个对话空间，开启与AI的树形对话探索
        </p>
        
        <button className="create-canvas-btn" onClick={onCreateCanvas}>
          <span className="btn-icon">✨</span>
          <span className="btn-text">创建对话空间</span>
        </button>
        
        <div className="empty-state-hint">
          <p>💡 提示：每个对话空间都是独立的树形结构</p>
        </div>
      </div>
    </div>
  );
};

