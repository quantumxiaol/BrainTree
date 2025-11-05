import React from 'react';
import type { DialogueNode, QuestionNode } from '../../types/conversation';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import './DialogueViewer.css';

interface DialogueViewerProps {
  node: DialogueNode | QuestionNode;
  onClose: () => void;
}

/**
 * 对话查看器
 * 模态框显示对话内容，支持流式响应
 */
export const DialogueViewer: React.FC<DialogueViewerProps> = ({
  node,
  onClose,
}) => {
  const isLoading = node.type === 'dialogue' && node.isLoading;

  return (
    <div className="dialogue-viewer-overlay" onClick={onClose}>
      <div 
        className="dialogue-viewer-container" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dialogue-viewer-close" onClick={onClose}>
          ✕
        </button>

        <div className="dialogue-viewer-content">
          {/* 问题部分 */}
          <div className="viewer-question-section">
            <div className="viewer-label">问题</div>
            <div className="viewer-question-text">
              {node.question}
            </div>
          </div>

          {/* 答案部分 */}
          <div className="viewer-answer-section">
            <div className="viewer-label">
              {isLoading ? (
                <>
                  <span className="loading-spinner">⟳</span>
                  AI正在思考...
                </>
              ) : (
                '回答'
              )}
            </div>
            <div className="viewer-answer-text">
              {isLoading ? (
                <div className="loading-placeholder">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : node.answer ? (
                <MarkdownRenderer content={node.answer} />
              ) : (
                <div className="no-answer">暂无回答</div>
              )}
            </div>
          </div>

          {/* 底部信息 */}
          <div className="viewer-footer">
            <span className="viewer-time">
              {new Date(node.createdAt).toLocaleString('zh-CN')}
            </span>
            {node.type === 'dialogue' && (
              <span className="viewer-type">🤖 AI对话</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
