<!-- components/TreeNode.vue -->
<template>
  <div class="tree-node" :style="{ marginLeft: depth * 20 + 'px' }">
    <!-- 节点头部 -->
    <div class="node-header" @click="toggleExpand">
      <!-- 展开/折叠图标 -->
      <div class="expand-icon" v-if="hasChildren">
        <span v-if="isExpanded">▼</span>
        <span v-else>▶</span>
      </div>
      <div v-else class="expand-icon-placeholder"></div>
      
      <!-- 节点内容 -->
      <div class="node-content">
        <div class="question" v-if="node.question">
          <strong>Q:</strong>
          <div class="markdown-wrapper">
            <MarkdownContent :content="node.question" />
          </div>
        </div>
        <div class="answer" v-if="node.answer">
          <strong>A:</strong>
          <div class="markdown-wrapper">
            <MarkdownContent :content="node.answer" />
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="node-actions">
        <button 
          class="add-btn" 
          @click.stop="showInput = true;
                      $nextTick(() => {
                        if (inputRef) inputRef.focus();
                      })"
          title="添加子节点"
        >
          +
        </button>
        <button 
          class="delete-btn" 
          @click.stop="deleteNode"
          title="删除节点"
        >
          ×
        </button>
      </div>
    </div>
    
    <!-- 输入框 -->
    <div v-if="showInput" class="input-section">
      <textarea 
        ref="inputRef"
        v-model="newQuestion" 
        placeholder="请输入你的问题..."
        class="input-textarea"
        rows="3"
        @keydown.enter.prevent="sendQuestion"
        @keydown.esc="showInput = false"
      ></textarea>
      <div class="input-actions">
        <button 
          @click="sendQuestion" 
          :disabled="!newQuestion.trim() || loading"
          class="send-btn"
        >
          {{ loading ? '发送中...' : '发送' }}
        </button>
        <button @click="showInput = false" class="cancel-btn" :disabled="loading">
          取消
        </button>
      </div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="isExpanded && hasChildren" class="children">
      <TreeNode 
        v-for="child in node.children" 
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConversationStore } from '@/stores/conversation'
import MarkdownContent from './MarkdownContent.vue'

const props = defineProps({
  node: Object,
  depth: {
    type: Number,
    default: 0
  }
})

const conversationStore = useConversationStore()
const showInput = ref(false)
const newQuestion = ref('')
const loading = ref(false)
const isExpanded = ref(true)
const inputRef = ref(null)

// 判断是否有子节点
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const toggleExpand = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
}

const sendQuestion = async () => {
  if (!newQuestion.value.trim() || loading.value) return
  
  console.log('[DEBUG] 发送问题:', newQuestion.value)
  loading.value = true
  try {
    await conversationStore.addChildNode(props.node.id, newQuestion.value)
    newQuestion.value = ''
    showInput.value = false
    isExpanded.value = true
    console.log('[DEBUG] 问题发送成功')
  } catch (error) {
    console.error('[ERROR] 发送问题失败:', error)
    alert(`发送问题失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

const deleteNode = () => {
  if (confirm('确定要删除这个节点吗？此操作不可撤销。')) {
    console.log('[DEBUG] 删除节点:', props.node.id)
    conversationStore.deleteNode(props.node.id)
  }
}
</script>

<style scoped>
.tree-node {
  margin: 0.5rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: box-shadow 0.2s;
  position: relative;
}

.tree-node:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.node-header {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.expand-icon {
  color: #666;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  min-width: 1.5rem;
  text-align: center;
}

.expand-icon-placeholder {
  min-width: 1.5rem;
  margin-right: 0.5rem;
}

.node-content {
  flex: 1;
  margin-right: 0.5rem;
}

.question, .answer {
  margin: 0.25rem 0;
  line-height: 1.5;
  word-wrap: break-word;
  padding: 0.25rem 0;
  display: flex;
  align-items: flex-start;
}

.question strong, .answer strong {
  color: #2c3e50;
  margin-right: 0.5rem;
  display: inline-block;
  min-width: 2rem;
  vertical-align: top;
  flex-shrink: 0;
}

/* 修复 Markdown 内容的对齐问题 */
.markdown-wrapper {
  flex: 1;
  min-width: 0; /* 允许收缩 */
}

.question .markdown-wrapper,
.answer .markdown-wrapper {
  display: block;
}

.node-actions {
  display: flex;
  gap: 0.25rem;
}

.add-btn, .delete-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.add-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.add-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.delete-btn:hover {
  background: #c82333;
}

.input-section {
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.input-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.input-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.input-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.send-btn, .cancel-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.send-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.send-btn:hover:not(:disabled), .cancel-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled, .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.children {
  padding-left: 1rem;
  border-left: 2px solid #e0e0e0;
  margin-left: 0.5rem;
}

.children::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  border-left: 2px solid #e0e0e0;
  pointer-events: none;
}

.tree-node:first-child {
  margin-top: 0;
}

.tree-node:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .tree-node {
    margin: 0.25rem 0;
  }
  
  .node-header {
    padding: 0.5rem 0.75rem;
  }
  
  .input-section {
    padding: 0.5rem 0.75rem;
  }
}
</style>