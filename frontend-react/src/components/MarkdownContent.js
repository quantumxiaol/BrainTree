// src/components/MarkdownContent.js
import React from 'react';
import DOMPurify from 'dompurify';
// 确保这行是正确的 .css 扩展名
import './MarkdownContent.css'; // 必须是 .css

const MarkdownContent = ({ content }) => {
  if (!content) return null;

  // 确保 markdown-it 和 dompurify 已经初始化
  if (!window.markdownit || !window.DOMPurify) {
    console.error("MarkdownIt or DOMPurify not initialized on window.");
    return <div>Error: Markdown renderer not available.</div>;
  }

  const sanitizedContent = window.DOMPurify.sanitize(content);
  const htmlContent = window.markdownit.render(sanitizedContent);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownContent;