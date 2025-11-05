import type { AnyCanvasNode } from '../types/conversation';

/**
 * 自动布局配置
 */
interface LayoutConfig {
  horizontalSpacing: number; // 层级之间的水平间距（左右）
  verticalSpacing: number;   // 同级节点之间的垂直间距（上下）
  startX: number;            // 起始X坐标
  startY: number;            // 起始Y坐标
}

const DEFAULT_CONFIG: LayoutConfig = {
  horizontalSpacing: 400,  // 层级间距
  verticalSpacing: 150,    // 同级间距
  startX: 100,
  startY: 100,
};

/**
 * 树节点结构（用于布局计算）
 */
interface TreeNode {
  node: AnyCanvasNode;
  children: TreeNode[];
  x: number;
  y: number;
  height: number; // 子树的垂直高度
}

/**
 * 构建树结构
 */
function buildTree(nodes: AnyCanvasNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // 创建所有节点的TreeNode
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      node,
      children: [],
      x: 0,
      y: 0,
      height: 0,
    });
  });

  // 建立父子关系
  nodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!;
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(treeNode);
      } else {
        // 父节点不存在，当作根节点
        roots.push(treeNode);
      }
    } else {
      // 没有父节点，是根节点
      roots.push(treeNode);
    }
  });

  return roots;
}

/**
 * 计算子树的高度（递归）
 */
function calculateTreeHeight(treeNode: TreeNode, config: LayoutConfig): number {
  if (treeNode.children.length === 0) {
    treeNode.height = 1;
    return config.verticalSpacing;
  }

  let totalHeight = 0;
  treeNode.children.forEach(child => {
    totalHeight += calculateTreeHeight(child, config);
  });

  treeNode.height = Math.max(1, treeNode.children.length);
  return totalHeight;
}

/**
 * 布局树节点（递归）- 从左到右
 */
function layoutTree(
  treeNode: TreeNode,
  x: number,
  y: number,
  config: LayoutConfig
): void {
  treeNode.x = x;
  treeNode.y = y;

  if (treeNode.children.length === 0) {
    return;
  }

  // 计算所有子节点的总高度
  const childrenHeights = treeNode.children.map(child => 
    child.children.length === 0 ? config.verticalSpacing : calculateTreeHeight(child, config)
  );
  const totalHeight = childrenHeights.reduce((sum, h) => sum + h, 0);

  // 子节点的X坐标（向右延伸）
  const childX = x + config.horizontalSpacing;
  // 子节点的起始Y坐标（垂直居中对齐）
  let childY = y - totalHeight / 2;

  // 递归布局子节点
  treeNode.children.forEach((child, index) => {
    const childHeight = childrenHeights[index];
    layoutTree(child, childX, childY + childHeight / 2, config);
    childY += childHeight;
  });
}

/**
 * 收集所有节点的新位置
 */
function collectPositions(treeNode: TreeNode): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  
  const traverse = (node: TreeNode) => {
    positions.set(node.node.id, { x: node.x, y: node.y });
    node.children.forEach(traverse);
  };
  
  traverse(treeNode);
  return positions;
}

/**
 * 自动整理节点布局（从左到右）
 * 将节点按照思维导图的树状结构进行排列
 * 
 * @param nodes 所有节点
 * @param config 布局配置（可选）
 * @returns 新的节点位置映射 { nodeId: { x, y } }
 */
export function autoLayoutNodes(
  nodes: AnyCanvasNode[],
  config: Partial<LayoutConfig> = {}
): Map<string, { x: number; y: number }> {
  const layoutConfig: LayoutConfig = { ...DEFAULT_CONFIG, ...config };
  const allPositions = new Map<string, { x: number; y: number }>();

  // 分离出有父子关系的节点和独立节点
  const connectedNodes = nodes.filter(node => 
    node.parentId || nodes.some(n => n.parentId === node.id)
  );
  const isolatedNodes = nodes.filter(node => 
    !node.parentId && !nodes.some(n => n.parentId === node.id)
  );

  // 构建树结构
  const roots = buildTree(connectedNodes);

  // 计算每棵树的高度
  roots.forEach(root => calculateTreeHeight(root, layoutConfig));

  // 布局每棵树（垂直排列多棵树）
  let currentY = layoutConfig.startY;
  roots.forEach(root => {
    const treeHeight = calculateTreeHeight(root, layoutConfig);
    layoutTree(root, layoutConfig.startX, currentY + treeHeight / 2, layoutConfig);
    
    // 收集这棵树的所有节点位置
    const treePositions = collectPositions(root);
    treePositions.forEach((pos, id) => allPositions.set(id, pos));
    
    // 移动到下一棵树的起始位置
    currentY += treeHeight + layoutConfig.verticalSpacing * 2;
  });

  // 布局独立节点（在树的下方纵向排列）
  isolatedNodes.forEach(node => {
    allPositions.set(node.id, {
      x: layoutConfig.startX,
      y: currentY,
    });
    currentY += layoutConfig.verticalSpacing;
  });

  return allPositions;
}

/**
 * 智能布局：根据节点类型和关系自动选择最佳布局
 */
export function smartLayoutNodes(nodes: AnyCanvasNode[]): Map<string, { x: number; y: number }> {
  // 目前使用树状布局，未来可以扩展其他布局算法
  return autoLayoutNodes(nodes);
}

