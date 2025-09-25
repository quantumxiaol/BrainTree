// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConversationProvider } from './stores/conversation' // Import Provider
import App from './App' // Import App component
// 不再需要在这里导入 markdown-it 和 dompurify
// import MarkdownIt from 'markdown-it';
// import DOMPurify from 'dompurify';

// 在 main.jsx 中初始化 markdown-it 和 dompurify，并挂载到 window
// 这样其他组件就可以通过 window.markdownit 和 window.DOMPurify 访问
if (typeof window !== 'undefined') { // 确保只在浏览器环境执行
  // 动态导入，避免在服务端 (SSR) 执行
  import('markdown-it').then((MarkdownItModule) => {
    const MarkdownIt = MarkdownItModule.default || MarkdownItModule;
    window.markdownit = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    });
  }).catch(err => {
    console.error("Failed to load markdown-it:", err);
  });

  import('dompurify').then((DOMPurifyModule) => {
    const DOMPurify = DOMPurifyModule.default || DOMPurifyModule;
    window.DOMPurify = DOMPurify;
  }).catch(err => {
    console.error("Failed to load dompurify:", err);
  });
}


// Wrap App with Provider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConversationProvider>
      <App />
    </ConversationProvider>
  </React.StrictMode>,
)