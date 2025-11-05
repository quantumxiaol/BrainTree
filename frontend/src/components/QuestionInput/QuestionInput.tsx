import React, { useState } from 'react';
import './QuestionInput.css';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  onCancel: () => void;
  parentQuestion?: string;
}

/**
 * 问题输入组件
 * 用户输入要提问的问题
 */
export const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  onCancel,
  parentQuestion,
}) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question.trim());
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
    <div className="question-input-overlay" onClick={onCancel}>
      <div className="question-input-container" onClick={(e) => e.stopPropagation()}>
        <div className="question-input-header">
          <h3>创建新对话</h3>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        {parentQuestion && (
          <div className="parent-question">
            <span className="parent-label">基于对话：</span>
            <p>{parentQuestion}</p>
          </div>
        )}

        <div className="question-input-body">
          <textarea
            className="question-textarea"
            placeholder="请输入你的问题..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={4}
          />
          <div className="input-hint">
            按 Cmd/Ctrl + Enter 提交
          </div>
        </div>

        <div className="question-input-footer">
          <button className="cancel-btn" onClick={onCancel}>
            取消
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!question.trim()}
          >
            创建对话
          </button>
        </div>
      </div>
    </div>
  );
};
