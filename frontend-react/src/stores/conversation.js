// src/stores/conversation.js
import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// --- 1. 定义初始状态 ---
const initialState = {
  nodes: [],
  rootNodes: [],
  loading: false
};

// --- 2. 定义 Action Types ---
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_NODES: 'SET_NODES',
  SET_ROOT_NODES: 'SET_ROOT_NODES',
  ADD_NODE: 'ADD_NODE',
  ADD_ROOT_NODE: 'ADD_ROOT_NODE',
  DELETE_NODE: 'DELETE_NODE',
  RESET_TREE: 'RESET_TREE',
  // ... 其他 action types
};

// --- 3. 定义 Reducer ---
const conversationReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_NODES:
      return { ...state, nodes: action.payload };
    case actionTypes.SET_ROOT_NODES:
      return { ...state, rootNodes: action.payload };
    case actionTypes.ADD_NODE:
      const { node, parentId } = action.payload;

      // --- 修正逻辑：确保不可变性 ---
      const addNodeToTree = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          const current = nodes[i];
          if (current.id === parentId) {
            // 找到父节点，创建父节点的副本，并更新其 children
            const updatedParent = {
              ...current,
              children: [...(current.children || []), node] // 创建新 children 数组
            };
            // 返回新数组，其中父节点被替换为更新后的副本
            return [...nodes.slice(0, i), updatedParent, ...nodes.slice(i + 1)];
          }
          if (current.children) {
            // 递归处理子节点
            const updatedChildren = addNodeToTree(current.children);
            if (updatedChildren) {
              // 如果子树中有节点被更新，则创建当前节点的副本
              const updatedCurrent = {
                ...current,
                children: updatedChildren
              };
              // 返回新数组，其中当前节点被替换为更新后的副本
              return [...nodes.slice(0, i), updatedCurrent, ...nodes.slice(i + 1)];
            }
          }
        }
        return null; // 未找到
      };

      let newRootNodes = [...state.rootNodes];
      let newNodes = [...state.nodes, node];

      if (parentId === null) {
        newRootNodes = [...newRootNodes, node]; // 添加根节点
      } else {
        const updatedRootNodes = addNodeToTree(newRootNodes);
        if (updatedRootNodes) {
          newRootNodes = updatedRootNodes;
        } else {
          // 如果在 rootNodes 中没找到，尝试在所有 nodes 中找（处理孤儿节点情况）
          const updatedAllNodes = addNodeToTree(newNodes);
          if (updatedAllNodes) {
            newNodes = updatedAllNodes;
          } else {
            console.warn('[WARN] Parent node not found in tree structure, adding to all nodes.');
            newNodes = [...newNodes, node]; // 再次添加，虽然上面已经添加过了，但为了逻辑完整性
          }
        }
      }

      return { ...state, nodes: newNodes, rootNodes: newRootNodes };
    case actionTypes.ADD_ROOT_NODE:
      return {
        ...state,
        rootNodes: [...state.rootNodes, action.payload],
        nodes: [...state.nodes, action.payload]
      };
    case actionTypes.DELETE_NODE:
      const { nodeId } = action.payload;
      const nodeToDelete = state.nodes.find(n => n.id === nodeId);
      if (!nodeToDelete) return state; // Node not found, return current state

      const deleteAllChildren = (n) => {
        if (n.children) {
          n.children.forEach(child => deleteAllChildren(child));
        }
      };

      let updatedNodes = state.nodes.filter(n => n.id !== nodeId);
      deleteAllChildren(nodeToDelete);

      // --- 修正删除逻辑：确保不可变性 ---
      const removeFromParent = (nodes) => {
        let foundAndRemoved = false;
        const newNodesArray = nodes.map(node => {
          if (node.children) {
            const newChildren = node.children.filter(child => child.id !== nodeId);
            if (newChildren.length !== node.children.length) {
              foundAndRemoved = true; // 标记找到了并移除了
              return { ...node, children: newChildren }; // 返回更新后的节点副本
            }
            // 递归处理子节点
            const updatedChildren = removeFromParent(node.children);
            if (updatedChildren) {
              foundAndRemoved = true; // 标记找到了并移除了
              return { ...node, children: updatedChildren }; // 返回更新后的节点副本
            }
          }
          return node; // 返回原节点
        });
        // 只有在确实移除了节点时才返回新数组
        return foundAndRemoved ? newNodesArray : null;
      };

      let updatedRootNodes = state.rootNodes.filter(root => root.id !== nodeId);
      const updatedRootNodesResult = removeFromParent(updatedRootNodes);
      if (updatedRootNodesResult) {
        updatedRootNodes = updatedRootNodesResult;
      }

      return { ...state, nodes: updatedNodes, rootNodes: updatedRootNodes };
    case actionTypes.RESET_TREE:
      return { ...initialState };
    default:
      return state;
  }
};

// --- 4. 创建 Context ---
const ConversationContext = createContext();

// --- 5. 创建 Provider 组件 ---
export const ConversationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  // --- 6. 定义 Actions (业务逻辑) ---
  const loadTree = async () => {
    try {
      console.log('[DEBUG] 开始加载树结构...');
      const savedData = localStorage.getItem('bratree-tree');
      if (savedData) {
        const data = JSON.parse(savedData);
        dispatch({ type: actionTypes.SET_NODES, payload: Array.isArray(data.nodes) ? data.nodes : [] });
        dispatch({ type: actionTypes.SET_ROOT_NODES, payload: Array.isArray(data.root_nodes) ? data.root_nodes : [] });
        console.log('[DEBUG] 树结构加载完成:', { nodes: data.nodes?.length, rootNodes: data.root_nodes?.length });
      } else {
        console.log('[DEBUG] 没有找到保存的树结构');
      }
    } catch (error) {
      console.error('[ERROR] 加载树结构失败:', error);
      dispatch({ type: actionTypes.SET_NODES, payload: [] });
      dispatch({ type: actionTypes.SET_ROOT_NODES, payload: [] });
    }
  };

  const addChildNode = async (parentId, question) => {
    console.log('[DEBUG] 添加子节点:', { parentId, question });
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    try {
      const context = buildContextFromFrontend(state.nodes, parentId); // Pass nodes as argument
      console.log('[DEBUG] 构建的上下文:', context);

      const response = await axios.post('/api/chat', {
        question,
        context
      });
      console.log('[DEBUG] API响应:', response.data);

      const answer = response.data.answer;
      const newNode = {
        id: Date.now().toString(),
        question,
        answer,
        children: [],
        parent_id: parentId,
        created_at: new Date().toISOString()
      };

      console.log('[DEBUG] 创建的新节点:', newNode);
      dispatch({ type: actionTypes.ADD_NODE, payload: { node: newNode, parentId } });
      saveTreeToLocalStorage(state.nodes, state.rootNodes); // Pass state to save function

    } catch (error) {
      console.error('[ERROR] 添加子节点失败:', error);
      if (error.response) {
        console.error('[ERROR] API错误详情:', error.response.data);
        console.error('[ERROR] API错误状态:', error.response.status);
      } else if (error.request) {
        console.error('[ERROR] 请求错误:', error.request);
      } else {
        console.error('[ERROR] 其他错误:', error.message);
      }
      throw error; // Re-throw to handle in component
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const addRootNode = async () => {
     console.log('[DEBUG] 开始添加根节点...');
     const question = prompt('请输入根节点问题:'); // 保留原始的 prompt 版本
     if (!question) {
       console.log('[DEBUG] 用户取消了根节点创建');
       return;
     }

     dispatch({ type: actionTypes.SET_LOADING, payload: true });
     try {
       console.log('[DEBUG] 发送根节点API请求...');
       const response = await axios.post('/api/chat', {
         question,
         context: []
       });
       console.log('[DEBUG] 根节点API响应:', response.data);

       const answer = response.data.answer;
       const newNode = {
         id: Date.now().toString(),
         question,
         answer,
         children: [],
         parent_id: null,
         created_at: new Date().toISOString()
       };

       console.log('[DEBUG] 创建的根节点:', newNode);
       dispatch({ type: actionTypes.ADD_ROOT_NODE, payload: newNode });
       saveTreeToLocalStorage(state.nodes, state.rootNodes);

     } catch (error) {
       console.error('[ERROR] 添加根节点失败:', error);
       if (error.response) {
         console.error('[ERROR] API错误详情:', error.response.data);
         console.error('[ERROR] API错误状态:', error.response.status);
       } else if (error.request) {
         console.error('[ERROR] 请求错误:', error.request);
       } else {
         console.error('[ERROR] 其他错误:', error.message);
       }
       throw error; // Re-throw to handle in component
     } finally {
       dispatch({ type: actionTypes.SET_LOADING, payload: false });
     }
  };

  // --- 添加新的 Action: addRootNodeWithQuestion ---
  const addRootNodeWithQuestion = async (question) => {
     console.log('[DEBUG] 开始添加根节点 with question:', question);
     if (!question) {
       console.log('[DEBUG] 问题为空，取消根节点创建');
       return;
     }

     dispatch({ type: actionTypes.SET_LOADING, payload: true });
     try {
       console.log('[DEBUG] 发送根节点API请求...');
       const response = await axios.post('/api/chat', {
         question, // 使用传入的 question
         context: []
       });
       console.log('[DEBUG] 根节点API响应:', response.data);

       const answer = response.data.answer;
       const newNode = {
         id: Date.now().toString(),
         question,
         answer,
         children: [],
         parent_id: null,
         created_at: new Date().toISOString()
       };

       console.log('[DEBUG] 创建的根节点:', newNode);
       dispatch({ type: actionTypes.ADD_ROOT_NODE, payload: newNode });
       saveTreeToLocalStorage(state.nodes, state.rootNodes);

     } catch (error) {
       console.error('[ERROR] 添加根节点失败:', error);
       if (error.response) {
         console.error('[ERROR] API错误详情:', error.response.data);
         console.error('[ERROR] API错误状态:', error.response.status);
       } else if (error.request) {
         console.error('[ERROR] 请求错误:', error.request);
       } else {
         console.error('[ERROR] 其他错误:', error.message);
       }
       throw error; // Re-throw to handle in component
     } finally {
       dispatch({ type: actionTypes.SET_LOADING, payload: false });
     }
  };

  const deleteNode = (nodeId) => {
    console.log('[DEBUG] 删除节点:', nodeId);
    dispatch({ type: actionTypes.DELETE_NODE, payload: { nodeId } });
    saveTreeToLocalStorage(state.nodes, state.rootNodes);
  };

  const resetTree = () => {
    console.log('[DEBUG] 重置树结构');
    dispatch({ type: actionTypes.RESET_TREE });
    localStorage.removeItem('bratree-tree');
  };

  // Helper functions (same logic as Vue, just adapted)
  const buildContextFromFrontend = (allNodes, nodeId) => { // Take nodes as argument
    console.log('[DEBUG] 构建上下文，节点ID:', nodeId);
    const path = getPathToNode(allNodes, nodeId); // Pass nodes to helper
    const context = path.map(node => ({
      question: node.question,
      answer: node.answer
    }));
    console.log('[DEBUG] 构建的上下文:', context);
    return context;
  };

  const getPathToNode = (allNodes, nodeId) => { // Take nodes as argument
    console.log('[DEBUG] 获取到节点的路径:', nodeId);
    const findPath = (nodes, targetId, currentPath = []) => {
      for (const node of nodes) {
        const newPath = [...currentPath, node];
        if (node.id === targetId) return newPath;
        if (node.children && node.children.length > 0) {
          const result = findPath(node.children, targetId, newPath);
          if (result) return result;
        }
      }
      return [];
    };

    for (const rootNode of state.rootNodes) { // Use state.rootNodes here to start search
      const path = findPath([rootNode], nodeId);
      if (path.length > 0) {
        console.log('[DEBUG] 找到路径:', path);
        return path;
      }
    }
    console.log('[DEBUG] 未找到路径');
    return [];
  };

  const saveTreeToLocalStorage = (nodes, rootNodes) => { // Take state as argument
    const treeData = {
      nodes: nodes,
      root_nodes: rootNodes
    };
    localStorage.setItem('bratree-tree', JSON.stringify(treeData));
    console.log('[DEBUG] 树结构已保存到localStorage');
  };

  useEffect(() => {
    loadTree();
  }, []); // Load tree on component mount

  const value = {
    ...state, // Expose state
    // Expose actions
    addChildNode,
    addRootNode,
    addRootNodeWithQuestion, // 暴露新的 action
    deleteNode,
    resetTree,
    loadTree // Might be useful for manual reload
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

// --- 7. 创建 Hook 以方便使用 ---
export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};