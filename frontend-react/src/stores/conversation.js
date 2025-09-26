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

      const addNodeToTree = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          const current = nodes[i];
          if (current.id === parentId) {
            const updatedParent = {
              ...current,
              children: [...(current.children || []), node]
            };
            return [...nodes.slice(0, i), updatedParent, ...nodes.slice(i + 1)];
          }
          if (current.children) {
            const updatedChildren = addNodeToTree(current.children);
            if (updatedChildren) {
              const updatedCurrent = {
                ...current,
                children: updatedChildren
              };
              return [...nodes.slice(0, i), updatedCurrent, ...nodes.slice(i + 1)];
            }
          }
        }
        return null;
      };

      let newRootNodes = [...state.rootNodes];
      let newNodes = [...state.nodes, node];

      if (parentId === null) {
        newRootNodes = [...newRootNodes, node];
      } else {
        const updatedRootNodes = addNodeToTree(newRootNodes);
        if (updatedRootNodes) {
          newRootNodes = updatedRootNodes;
        } else {
          const updatedAllNodes = addNodeToTree(newNodes);
          if (updatedAllNodes) {
            newNodes = updatedAllNodes;
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
      if (!nodeToDelete) return state;

      const deleteAllChildren = (n) => {
        if (n.children) {
          n.children.forEach(child => deleteAllChildren(child));
        }
      };

      let updatedNodes = state.nodes.filter(n => n.id !== nodeId);
      deleteAllChildren(nodeToDelete);

      const removeFromParent = (nodes) => {
        let foundAndRemoved = false;
        const newNodesArray = nodes.map(node => {
          if (node.children) {
            const newChildren = node.children.filter(child => child.id !== nodeId);
            if (newChildren.length !== node.children.length) {
              foundAndRemoved = true;
              return { ...node, children: newChildren };
            }
            const updatedChildren = removeFromParent(node.children);
            if (updatedChildren) {
              foundAndRemoved = true;
              return { ...node, children: updatedChildren };
            }
          }
          return node;
        });
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
      const context = buildContextFromFrontend(state.nodes, parentId);
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
      saveTreeToLocalStorage(state.nodes, state.rootNodes);

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
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

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
      throw error;
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

  const buildContextFromFrontend = (allNodes, nodeId) => {
    console.log('[DEBUG] 构建上下文，节点ID:', nodeId);
    const path = getPathToNode(allNodes, nodeId);
    const context = path.map(node => ({
      question: node.question,
      answer: node.answer
    }));
    console.log('[DEBUG] 构建的上下文:', context);
    return context;
  };

  const getPathToNode = (allNodes, nodeId) => {
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

    for (const rootNode of state.rootNodes) {
      const path = findPath([rootNode], nodeId);
      if (path.length > 0) {
        console.log('[DEBUG] 找到路径:', path);
        return path;
      }
    }
    console.log('[DEBUG] 未找到路径');
    return [];
  };

  const saveTreeToLocalStorage = (nodes, rootNodes) => {
    const treeData = {
      nodes: nodes,
      root_nodes: rootNodes
    };
    localStorage.setItem('bratree-tree', JSON.stringify(treeData));
    console.log('[DEBUG] 树结构已保存到localStorage');
  };

  useEffect(() => {
    loadTree();
  }, []);

  const value = {
    ...state,
    addChildNode,
    addRootNodeWithQuestion,
    deleteNode,
    resetTree,
    loadTree
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