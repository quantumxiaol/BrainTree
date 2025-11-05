import React, { useState } from 'react';
import './DialogueInput.css';

interface DialogueInputProps {
  onSubmit: (question: string, connectLLM: boolean) => void;
  onCancel: () => void;
  parentQuestion?: string;
}

/**
 * 对话输入组件
 * 支持连接LLM或创建普通问题节点
 */
export const DialogueInput: React.FC<DialogueInputProps> = ({
  onSubmit,
  onCancel,
  parentQuestion,
}) => {
  const [question, setQuestion] = useState('');
  // 默认总是连接 LLM
  const connectLLM = true;

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question.trim(), connectLLM);
      setQuestion('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="dialogue-input-overlay" onClick={onCancel}>
      <div className="dialogue-input-container" onClick={(e) => e.stopPropagation()}>
        <div className="dialogue-input-header">
          <h3>创建LLM对话</h3>
        </div>

        {parentQuestion && (
          <div className="parent-question">
            <span className="parent-label">基于对话：</span>
            <p>{parentQuestion}</p>
          </div>
        )}

        <div className="dialogue-input-body">
          <textarea
            className="dialogue-textarea"
            placeholder="请输入你的问题，AI 将自动回答..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={4}
          />

          <div className="input-hint">
            ✨ AI 将自动生成回答 · 按 Cmd/Ctrl + Enter 提交
          </div>
        </div>

        <div className="dialogue-input-footer">
          <button className="cancel-btn" onClick={onCancel}>
            取消
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!question.trim()}
          >
            创建并询问AI
          </button>
        </div>
      </div>
    </div>
  );
};
