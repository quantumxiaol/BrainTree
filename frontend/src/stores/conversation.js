// frontend/src/stores/conversation.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    nodes: [],
    rootNodes: [],
    loading: false
  }),

  actions: {
    async loadTree() {
      try {
        console.log('[DEBUG] 开始加载树结构...')
        const savedData = localStorage.getItem('bratree-tree')
        if (savedData) {
          const data = JSON.parse(savedData)
          this.nodes = Array.isArray(data.nodes) ? data.nodes : []
          this.rootNodes = Array.isArray(data.root_nodes) ? data.root_nodes : []
          console.log('[DEBUG] 树结构加载完成:', { 
            nodes: this.nodes.length, 
            rootNodes: this.rootNodes.length 
          })
        } else {
          console.log('[DEBUG] 没有找到保存的树结构')
        }
      } catch (error) {
        console.error('[ERROR] 加载树结构失败:', error)
        this.nodes = []
        this.rootNodes = []
      }
    },

    async addChildNode(parentId, question) {
      console.log('[DEBUG] 添加子节点:', { parentId, question })
      try {
        this.loading = true
        
        // 从前端构建上下文 - 使用 this 调用 store 方法
        const context = this.buildContextFromFrontend(parentId)
        console.log('[DEBUG] 构建的上下文:', context)
        
        // 调用LLM获取回复
        console.log('[DEBUG] 发送API请求...')
        const response = await axios.post('/api/chat', {
          question,
          context
        })

        console.log('[DEBUG] API响应:', response.data)
        const answer = response.data.answer
        
        // 创建新节点
        const newNode = {
          id: Date.now().toString(),
          question,
          answer,
          children: [],
          parent_id: parentId,
          created_at: new Date().toISOString()
        }

        console.log('[DEBUG] 创建的新节点:', newNode)
        
        // 更新本地状态
        this.addNodeToTree(parentId, newNode)
        
        // 强制触发响应式更新 - 使用深拷贝
        this.rootNodes = JSON.parse(JSON.stringify(this.rootNodes))
        this.nodes = JSON.parse(JSON.stringify(this.nodes))
        
        // 保存到本地存储
        this.saveTreeToLocalStorage()
        console.log('[DEBUG] 节点已添加，当前状态:', { 
          totalNodes: this.nodes.length, 
          rootNodes: this.rootNodes.length 
        })
        
        return newNode
      } catch (error) {
        console.error('[ERROR] 添加子节点失败:', error)
        if (error.response) {
          console.error('[ERROR] API错误详情:', error.response.data)
          console.error('[ERROR] API错误状态:', error.response.status)
          console.error('[ERROR] API错误头:', error.response.headers)
        } else if (error.request) {
          console.error('[ERROR] 请求错误:', error.request)
        } else {
          console.error('[ERROR] 其他错误:', error.message)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async addRootNode() {
      console.log('[DEBUG] 开始添加根节点...')
      try {
        const question = prompt('请输入根节点问题:')
        if (!question) {
          console.log('[DEBUG] 用户取消了根节点创建')
          return
        }

        this.loading = true
        
        // 根节点没有上下文
        console.log('[DEBUG] 发送根节点API请求...')
        const response = await axios.post('/api/chat', {
          question,
          context: []
        })

        console.log('[DEBUG] 根节点API响应:', response.data)
        const answer = response.data.answer
        
        const newNode = {
          id: Date.now().toString(),
          question,
          answer,
          children: [],
          parent_id: null,
          created_at: new Date().toISOString()
        }

        console.log('[DEBUG] 创建的根节点:', newNode)
        
        // 添加到根节点和所有节点数组
        this.rootNodes.push(newNode)
        this.nodes.push(newNode)
        
        // 强制触发响应式更新
        this.rootNodes = JSON.parse(JSON.stringify(this.rootNodes))
        this.nodes = JSON.parse(JSON.stringify(this.nodes))
        
        // 保存到本地存储
        this.saveTreeToLocalStorage()
        console.log('[DEBUG] 根节点已添加，当前状态:', { 
          totalNodes: this.nodes.length, 
          rootNodes: this.rootNodes.length 
        })
        
        return newNode
      } catch (error) {
        console.error('[ERROR] 添加根节点失败:', error)
        if (error.response) {
          console.error('[ERROR] API错误详情:', error.response.data)
          console.error('[ERROR] API错误状态:', error.response.status)
        } else if (error.request) {
          console.error('[ERROR] 请求错误:', error.request)
        } else {
          console.error('[ERROR] 其他错误:', error.message)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    deleteNode(nodeId) {
      console.log('[DEBUG] 删除节点:', nodeId)
      const nodeToDelete = this.findNodeById(nodeId)
      if (!nodeToDelete) {
        console.warn('[WARN] 未找到要删除的节点:', nodeId)
        return
      }
      
      console.log('[DEBUG] 找到要删除的节点:', nodeToDelete)
      
      // 删除所有子节点
      this.deleteAllChildren(nodeToDelete)
      
      // 从父节点中移除
      if (nodeToDelete.parent_id !== null) {
        const parentNode = this.findNodeById(nodeToDelete.parent_id)
        if (parentNode && parentNode.children) {
          parentNode.children = parentNode.children.filter(child => child.id !== nodeId)
        }
      } else {
        // 如果是根节点，从根节点列表中移除
        this.rootNodes = this.rootNodes.filter(root => root.id !== nodeId)
      }
      
      // 从所有节点中移除
      this.nodes = this.nodes.filter(node => node.id !== nodeId)
      
      // 强制触发响应式更新
      this.rootNodes = JSON.parse(JSON.stringify(this.rootNodes))
      this.nodes = JSON.parse(JSON.stringify(this.nodes))
      
      // 保存到本地存储
      this.saveTreeToLocalStorage()
      console.log('[DEBUG] 节点删除成功，当前状态:', { 
        totalNodes: this.nodes.length, 
        rootNodes: this.rootNodes.length 
      })
    },

    deleteAllChildren(node) {
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          this.deleteAllChildren(child)
        }
      }
    },

    findNodeById(nodeId) {
      console.log('[DEBUG] 查找节点:', nodeId)
      const findInNodes = (nodes) => {
        for (const node of nodes) {
          if (node.id === nodeId) {
            console.log('[DEBUG] 找到节点:', node)
            return node
          }
          if (node.children && node.children.length > 0) {
            const found = findInNodes(node.children)
            if (found) return found
          }
        }
        return null
      }

      // 先在根节点中查找
      const inRootNodes = findInNodes(this.rootNodes)
      if (inRootNodes) return inRootNodes

      // 再在所有节点中查找
      return findInNodes(this.nodes)
    },

    // 构建上下文方法 - 确保在 actions 中
    buildContextFromFrontend(nodeId) {
      console.log('[DEBUG] 构建上下文，节点ID:', nodeId)
      const path = this.getPathToNode(nodeId)
      const context = path.map(node => ({
        question: node.question,
        answer: node.answer
      }))
      console.log('[DEBUG] 构建的上下文:', context)
      return context
    },

    getPathToNode(nodeId) {
      console.log('[DEBUG] 获取到节点的路径:', nodeId)
      const findPath = (nodes, targetId, currentPath = []) => {
        for (const node of nodes) {
          const newPath = [...currentPath, node]
          if (node.id === targetId) return newPath
          if (node.children && node.children.length > 0) {
            const result = findPath(node.children, targetId, newPath)
            if (result) return result
          }
        }
        return []
      }

      for (const rootNode of this.rootNodes) {
        const path = findPath([rootNode], nodeId)
        if (path.length > 0) {
          console.log('[DEBUG] 找到路径:', path)
          return path
        }
      }
      console.log('[DEBUG] 未找到路径')
      return []
    },

    addNodeToTree(parentId, newNode) {
      console.log('[DEBUG] 添加节点到树中:', { parentId, newNode })
      if (parentId === null) {
        // 添加根节点
        console.log('[DEBUG] 添加根节点')
        this.rootNodes.push(newNode)
      } else {
        // 添加子节点
        console.log('[DEBUG] 添加子节点到父节点:', parentId)
        const updateInTree = (nodes) => {
          for (const node of nodes) {
            if (node.id === parentId) {
              console.log('[DEBUG] 找到父节点，添加子节点:', node)
              if (!node.children) node.children = []
              node.children.push(newNode)
              return true
            }
            if (node.children && node.children.length > 0) {
              if (updateInTree(node.children)) return true
            }
          }
          return false
        }

        const updated = updateInTree(this.rootNodes)
        if (!updated) {
          console.warn('[WARN] 未在根节点中找到父节点，尝试在所有节点中查找')
          updateInTree(this.nodes)
        }
      }
      this.nodes.push(newNode)
    },

    saveTreeToLocalStorage() {
      const treeData = {
        nodes: this.nodes,
        root_nodes: this.rootNodes
      }
      localStorage.setItem('bratree-tree', JSON.stringify(treeData))
      console.log('[DEBUG] 树结构已保存到localStorage:', treeData)
    },

    async resetTree() {
      console.log('[DEBUG] 重置树结构')
      this.nodes = []
      this.rootNodes = []
      localStorage.removeItem('bratree-tree')
      console.log('[DEBUG] 树结构已重置')
      
      // 强制触发响应式更新
      this.rootNodes = JSON.parse(JSON.stringify(this.rootNodes))
      this.nodes = JSON.parse(JSON.stringify(this.nodes))
    }
  }
})