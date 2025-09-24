<!-- frontend/src/components/MarkdownContent.vue -->
<template>
  <div class="markdown-content" v-html="parsedContent"></div>
</template>

<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const parsedContent = computed(() => {
  if (!props.content) return ''
  
  const sanitized = DOMPurify.sanitize(props.content)
  return window.markdownit.render(sanitized)
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  font-size: 0.95rem;
  word-wrap: break-word;
}

/* 确保标题前后有适当的间距 */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 1rem 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: bold;
  display: block;
  clear: both;
  padding: 0;
}

.markdown-content p {
  margin: 0.5rem 0;
  line-height: 1.4;
  display: block;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.75rem 0;
  padding-left: 2rem;
  list-style-position: outside;
}

.markdown-content li {
  margin: 0.25rem 0;
  line-height: 1.4;
  padding-left: 0.5rem;
  display: list-item;
}

.markdown-content pre {
  background: #f6f8fa;
  border-radius: 4px;
  padding: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  display: block;
}

.markdown-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85em;
  background: #f1f1f1;
  padding: 0.1rem 0.2rem;
  border-radius: 3px;
  word-wrap: break-word;
}

.markdown-content pre code {
  background: none;
  padding: 0;
  border: none;
  white-space: pre-wrap;
}

.markdown-content blockquote {
  border-left: 3px solid #ddd;
  padding-left: 0.75rem;
  margin: 0.75rem 0;
  color: #666;
  font-style: italic;
  border-radius: 4px;
  background: #f8f9fa;
  display: block;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75rem 0;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  display: table;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #ddd;
  padding: 0.25rem 0.5rem;
  text-align: left;
}

.markdown-content th {
  background: #f8f9fa;
  font-weight: bold;
}

.markdown-content strong {
  font-weight: bold;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 0.75rem 0;
  display: block;
}

/* 确保所有块级元素都有适当的显示属性 */
.markdown-content div,
.markdown-content section,
.markdown-content article,
.markdown-content aside,
.markdown-content header,
.markdown-content footer {
  display: block;
}

/* 修复列表项的缩进问题 */
.markdown-content ol li {
  counter-increment: item;
  position: relative;
}

.markdown-content ol li:before {
  content: counters(item, ".") ". ";
  position: absolute;
  left: -2rem;
  width: 2rem;
  text-align: right;
}

.markdown-content ul li {
  position: relative;
  padding-left: 1rem;
}

.markdown-content ul li:before {
  content: "•";
  position: absolute;
  left: 0;
  width: 1rem;
  text-align: center;
}

/* 修复嵌套列表的缩进 */
.markdown-content ul ul,
.markdown-content ol ol,
.markdown-content ul ol,
.markdown-content ol ul {
  margin: 0.25rem 0;
  padding-left: 1.5rem;
}

/* 修复代码块的换行 */
.markdown-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 修复图片的显示 */
.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
  margin: 0.5rem 0;
}

/* 修复链接的样式 */
.markdown-content a {
  color: #007bff;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* 确保行内元素不会影响布局 */
.markdown-content strong,
.markdown-content em,
.markdown-content code {
  display: inline;
  line-height: inherit;
}
</style>