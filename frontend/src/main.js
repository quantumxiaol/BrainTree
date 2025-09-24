// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

// 创建 markdown-it 实例并配置
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 将实例挂载到全局
window.markdownit = md
window.DOMPurify = DOMPurify

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')