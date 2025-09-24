<!-- frontend/src/App.vue -->
<template>
  <div id="app">
    <header class="app-header">
      <h1>🧠 BrainTree</h1>
      <p>智能对话树 - 探索思维的无限可能</p>
    </header>
    
    <main class="app-main">
      <div class="tree-container">
        <TreeNode 
          v-for="rootNode in conversationStore.rootNodes" 
          :key="rootNode.id"
          :node="rootNode"
          :depth="0"
        />
        
        <div v-if="conversationStore.rootNodes.length === 0" class="empty-state">
          <p>开始创建你的第一个对话分支吧！</p>
          <button @click="addRootNode" class="add-root-btn">
            + 添加根节点
          </button>
        </div>
      </div>
      
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>控制面板</h3>
          <button @click="resetTree" class="reset-btn">
            重置对话树
          </button>
          <button @click="addRootNode" class="add-root-btn">
            + 添加根节点
          </button>
        </div>
        
        <div class="sidebar-section">
          <h3>统计信息</h3>
          <p>节点总数: {{ conversationStore.nodes.length }}</p>
          <p>根节点数: {{ conversationStore.rootNodes.length }}</p>
          
          <!-- 调试信息 -->
          <div v-if="debugMode" class="debug-info">
            <h4>调试信息</h4>
            <p>Store 状态: {{ storeState }}</p>
            <p>根节点: {{ JSON.stringify(conversationStore.rootNodes, null, 2) }}</p>
          </div>
          <button @click="toggleDebug" class="debug-btn">
            {{ debugMode ? '隐藏' : '显示' }}调试信息
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import TreeNode from './components/TreeNode.vue'
import { useConversationStore } from './stores/conversation'

const conversationStore = useConversationStore()
const debugMode = ref(false)

const storeState = computed(() => ({
  nodesCount: conversationStore.nodes.length,
  rootNodesCount: conversationStore.rootNodes.length,
  loading: conversationStore.loading
}))

onMounted(() => {
  conversationStore.loadTree()
})

const resetTree = () => {
  if (confirm('确定要重置整个对话树吗？此操作不可撤销。')) {
    conversationStore.resetTree()
  }
}

const addRootNode = () => {
  conversationStore.addRootNode()
}

const toggleDebug = () => {
  debugMode.value = !debugMode.value
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.app-header p {
  opacity: 0.9;
}

.app-main {
  display: flex;
  min-height: calc(100vh - 200px);
}

.tree-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.sidebar {
  width: 300px;
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 2rem;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.reset-btn, .add-root-btn {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.reset-btn {
  background: #dc3545;
  color: white;
}

.add-root-btn {
  background: #28a745;
  color: white;
}

.reset-btn:hover, .add-root-btn:hover {
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.debug-btn {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
</style>