/**
 * 上下文构建工具
 * 用于管理对话树的上下文传递
 */

import type { AnyCanvasNode, Message } from '../types/conversation';

/**
 * 构建完整的上下文路径
 * 从根节点到当前节点的所有消息
 */
export function buildContextPath(
  currentNodeId: string,
  allNodes: AnyCanvasNode[]
): Message[] {
  const contextMessages: Message[] = [];
  const nodePath: AnyCanvasNode[] = [];

  // 1. 找到从根到当前节点的路径
  const findPath = (nodeId: string): boolean => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return false;

    nodePath.unshift(node); // 添加到路径开头

    if (node.parentId) {
      return findPath(node.parentId);
    }
    return true;
  };

  findPath(currentNodeId);

  // 2. 按路径顺序收集消息
  nodePath.forEach(node => {
    if ('messages' in node && node.messages && Array.isArray(node.messages)) {
      contextMessages.push(...node.messages);
    }
  });

  return contextMessages;
}

/**
 * 获取节点的深度（从根节点算起）
 */
export function getNodeDepth(nodeId: string, allNodes: AnyCanvasNode[]): number {
  let depth = 0;
  let currentId: string | undefined = nodeId;

  while (currentId) {
    const node = allNodes.find(n => n.id === currentId);
    if (!node) break;
    
    if (node.parentId) {
      depth++;
      currentId = node.parentId;
    } else {
      break;
    }
  }

  return depth;
}

/**
 * 获取节点的所有祖先
 */
export function getAncestors(nodeId: string, allNodes: AnyCanvasNode[]): AnyCanvasNode[] {
  const ancestors: AnyCanvasNode[] = [];
  let currentId: string | undefined = nodeId;

  while (currentId) {
    const node = allNodes.find(n => n.id === currentId);
    if (!node) break;

    if (node.parentId) {
      const parent = allNodes.find(n => n.id === node.parentId);
      if (parent) {
        ancestors.push(parent);
        currentId = parent.id;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * 获取节点的所有后代
 */
export function getDescendants(nodeId: string, allNodes: AnyCanvasNode[]): AnyCanvasNode[] {
  const descendants: AnyCanvasNode[] = [];
  const children = allNodes.filter(n => n.parentId === nodeId);

  children.forEach(child => {
    descendants.push(child);
    descendants.push(...getDescendants(child.id, allNodes));
  });

  return descendants;
}

/**
 * 检查节点是否有循环依赖
 */
export function hasCircularDependency(
  nodeId: string,
  parentId: string,
  allNodes: AnyCanvasNode[]
): boolean {
  const visited = new Set<string>();
  let currentId: string | undefined = parentId;

  while (currentId) {
    if (visited.has(currentId)) return true; // 发现循环
    if (currentId === nodeId) return true; // 不能设置自己为父节点

    visited.add(currentId);
    const node = allNodes.find(n => n.id === currentId);
    currentId = node?.parentId;
  }

  return false;
}

/**
 * 格式化上下文摘要
 * 用于在UI上显示上下文链路
 */
export function formatContextSummary(
  nodeId: string,
  allNodes: AnyCanvasNode[]
): string {
  const ancestors = getAncestors(nodeId, allNodes);
  
  if (ancestors.length === 0) {
    return '根对话';
  }

  const titles = ancestors
    .reverse()
    .map(node => {
      if ('title' in node && node.title) {
        return node.title;
      }
      if ('question' in node) {
        return node.question.slice(0, 15) + '...';
      }
      return '未知节点';
    })
    .join(' → ');

  return `基于：${titles}`;
}

/**
 * 计算上下文令牌数（估算）
 */
export function estimateContextTokens(messages: Message[]): number {
  // 简单估算：中文1字约等于1.5个token，英文1词约等于1个token
  const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  return Math.ceil(totalChars * 1.5);
}

