/**
 * 画布节点类型定义
 */

// 节点类型
export type NodeType = 
  | 'dialogue'      // 对话节点（连接LLM）
  | 'question'      // 普通问题节点（不连接LLM）
  | 'section'       // 分组框
  | 'text'          // 文本
  | 'comment'       // 评论
  | 'note'          // 便利贴
  | 'drawing'       // 绘画
  | 'shape'         // 图形
  | 'media';        // 媒体文件

// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 单条消息
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// 基础节点
export interface BaseNode {
  id: string;
  type: NodeType;
  parentId?: string; // 父节点ID
  position: {
    x: number;
    y: number;
  };
  createdAt: number;
  updatedAt: number;
}

// 对话状态
export type DialogueStatus = 'pending' | 'loading' | 'completed';

// 对话节点（连接LLM）
export interface DialogueNode extends BaseNode {
  type: 'dialogue';
  question: string;
  title?: string; // 对话主题
  summary?: string; // 对话内容概述
  answer?: string;
  messages: Message[];
  isLoading?: boolean; // LLM生成中
  status?: DialogueStatus; // 对话状态：pending-待输入，loading-生成中，completed-已完成
}

// 普通问题节点（不连接LLM）
export interface QuestionNode extends BaseNode {
  type: 'question';
  question: string;
  answer?: string;
  messages: Message[];
}

// 分组框节点
export interface SectionNode extends BaseNode {
  type: 'section';
  title: string;
  width: number;
  height: number;
  color?: string;
}

// 文本节点
export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
  fontSize?: number;
  color?: string;
}

// 评论节点
export interface CommentNode extends BaseNode {
  type: 'comment';
  content: string;
  author?: string;
  resolved?: boolean;
}

// 便利贴节点
export interface NoteNode extends BaseNode {
  type: 'note';
  content: string;
  color?: string;
}

// 绘画节点
export interface DrawingNode extends BaseNode {
  type: 'drawing';
  paths: string; // SVG路径
  color?: string;
  strokeWidth?: number;
}

// 图形节点
export interface ShapeNode extends BaseNode {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow';
  width: number;
  height: number;
  color?: string;
}

// 媒体节点
export interface MediaNode extends BaseNode {
  type: 'media';
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  filename: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

// 联合类型 - 所有节点类型
export type AnyCanvasNode = 
  | DialogueNode 
  | QuestionNode 
  | SectionNode 
  | TextNode 
  | CommentNode 
  | NoteNode 
  | DrawingNode 
  | ShapeNode 
  | MediaNode;

// 向后兼容：ConversationNode 类型别名
export type ConversationNode = QuestionNode;

// 画布（Canvas）- 一个独立的对话空间
export interface ConversationCanvas {
  id: string;
  title: string; // 画布标题
  nodes: AnyCanvasNode[]; // 画布内的所有节点
  createdAt: number;
  updatedAt: number;
}

// ReactFlow节点数据（用于react-flow）
export interface ReactFlowNodeData {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    node: AnyCanvasNode;
    onSelect: (nodeId: string) => void;
    onAddChild: (parentId: string) => void;
    onDelete: (nodeId: string) => void;
  };
}

// ReactFlow边数据（用于react-flow）
export interface ReactFlowEdgeData {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}
