import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Markdown渲染器组件
 * 支持：
 * - GFM（GitHub Flavored Markdown）扩展
 * - 代码高亮
 * - LaTeX 数学公式（行内：$...$，块级：$$...$$）
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // 自定义代码块样式
          code(props) {
            const { node, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return !isInline ? (
              <div className="code-block">
                {match && (
                  <div className="code-language">{match[1]}</div>
                )}
                <code className={className} {...rest}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="inline-code" {...rest}>
                {children}
              </code>
            );
          },
          // 自定义表格样式
          table(props) {
            const { children } = props;
            return (
              <div className="table-wrapper">
                <table>{children}</table>
              </div>
            );
          },
          // 自定义链接样式
          a(props) {
            const { children, href } = props;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          // 自定义引用块样式
          blockquote(props) {
            const { children } = props;
            return <blockquote className="custom-blockquote">{children}</blockquote>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

