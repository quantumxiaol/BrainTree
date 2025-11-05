/**
 * AI响应模板系统
 * 用于标准化AI返回的数据格式，方便后续链接数据库
 */

/**
 * 基础响应模板接口
 */
export interface ResponseTemplate {
  id: string;
  name: string;
  description: string;
  schema: ResponseSchema;
  example: any;
}

/**
 * 响应数据结构定义
 */
export interface ResponseSchema {
  title: SchemaField;
  summary: SchemaField;
  answer: SchemaField;
  metadata?: Record<string, SchemaField>;
}

/**
 * 字段定义
 */
export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  minLength?: number;
  maxLength?: number;
  format?: string; // markdown, plain, html
  validation?: (value: any) => boolean;
}

/**
 * 预定义模板
 */

// 标准对话模板
export const STANDARD_DIALOGUE_TEMPLATE: ResponseTemplate = {
  id: 'standard-dialogue',
  name: '标准对话模板',
  description: '适用于一般性问答',
  schema: {
    title: {
      type: 'string',
      required: true,
      description: '对话主题（8-15字）',
      minLength: 8,
      maxLength: 15,
    },
    summary: {
      type: 'string',
      required: true,
      description: '对话概述（20-40字）',
      minLength: 20,
      maxLength: 40,
    },
    answer: {
      type: 'string',
      required: true,
      description: '完整回答（Markdown格式）',
      format: 'markdown',
    },
  },
  example: {
    title: 'React核心概念',
    summary: 'React的核心概念包括组件化、虚拟DOM、单向数据流等特性',
    answer: '# React核心概念\n\nReact是...',
  },
};

// 技术文档模板
export const TECHNICAL_DOC_TEMPLATE: ResponseTemplate = {
  id: 'technical-doc',
  name: '技术文档模板',
  description: '适用于技术文档、API说明等',
  schema: {
    title: {
      type: 'string',
      required: true,
      description: '文档标题',
      minLength: 5,
      maxLength: 50,
    },
    summary: {
      type: 'string',
      required: true,
      description: '文档摘要',
      minLength: 20,
      maxLength: 100,
    },
    answer: {
      type: 'string',
      required: true,
      description: '完整文档（Markdown格式，包含代码示例）',
      format: 'markdown',
    },
    metadata: {
      version: {
        type: 'string',
        required: false,
        description: '版本号',
      },
      tags: {
        type: 'array',
        required: false,
        description: '标签列表',
      },
    },
  },
  example: {
    title: 'useState Hook 使用指南',
    summary: 'useState是React最基础的Hook，用于在函数组件中添加状态管理功能',
    answer: '## 基本用法\n\n```jsx\nconst [count, setCount] = useState(0);\n```',
    metadata: {
      version: 'React 18',
      tags: ['hooks', 'state', 'react'],
    },
  },
};

// 代码示例模板
export const CODE_EXAMPLE_TEMPLATE: ResponseTemplate = {
  id: 'code-example',
  name: '代码示例模板',
  description: '适用于代码演示和讲解',
  schema: {
    title: {
      type: 'string',
      required: true,
      description: '示例标题',
      minLength: 5,
      maxLength: 30,
    },
    summary: {
      type: 'string',
      required: true,
      description: '示例说明',
      minLength: 20,
      maxLength: 60,
    },
    answer: {
      type: 'string',
      required: true,
      description: '代码和讲解（Markdown格式）',
      format: 'markdown',
    },
    metadata: {
      language: {
        type: 'string',
        required: true,
        description: '编程语言',
      },
      difficulty: {
        type: 'string',
        required: false,
        description: '难度等级（easy/medium/hard）',
      },
    },
  },
  example: {
    title: '实现防抖函数',
    summary: '使用闭包和定时器实现一个通用的防抖函数',
    answer: '```javascript\nfunction debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n```',
    metadata: {
      language: 'javascript',
      difficulty: 'medium',
    },
  },
};

// 学习笔记模板
export const LEARNING_NOTE_TEMPLATE: ResponseTemplate = {
  id: 'learning-note',
  name: '学习笔记模板',
  description: '适用于知识点整理和学习记录',
  schema: {
    title: {
      type: 'string',
      required: true,
      description: '知识点标题',
      minLength: 5,
      maxLength: 30,
    },
    summary: {
      type: 'string',
      required: true,
      description: '核心要点',
      minLength: 20,
      maxLength: 80,
    },
    answer: {
      type: 'string',
      required: true,
      description: '详细笔记（Markdown格式，支持列表、表格）',
      format: 'markdown',
    },
    metadata: {
      category: {
        type: 'string',
        required: false,
        description: '分类',
      },
      relatedTopics: {
        type: 'array',
        required: false,
        description: '相关主题',
      },
    },
  },
  example: {
    title: 'JavaScript闭包',
    summary: '闭包是函数和其词法环境的组合，允许内部函数访问外部函数的变量',
    answer: '## 什么是闭包\n\n闭包是...\n\n## 闭包的应用\n\n1. 数据私有化\n2. 函数工厂\n3. 模块化',
    metadata: {
      category: 'JavaScript基础',
      relatedTopics: ['作用域', '词法环境', '函数'],
    },
  },
};

// 问题解答模板
export const QA_TEMPLATE: ResponseTemplate = {
  id: 'qa-template',
  name: '问题解答模板',
  description: '适用于问答场景',
  schema: {
    title: {
      type: 'string',
      required: true,
      description: '问题主题',
      minLength: 5,
      maxLength: 30,
    },
    summary: {
      type: 'string',
      required: true,
      description: '简短答案',
      minLength: 15,
      maxLength: 50,
    },
    answer: {
      type: 'string',
      required: true,
      description: '详细解答（Markdown格式）',
      format: 'markdown',
    },
    metadata: {
      confidence: {
        type: 'number',
        required: false,
        description: '回答置信度（0-1）',
      },
      sources: {
        type: 'array',
        required: false,
        description: '参考来源',
      },
    },
  },
  example: {
    title: '如何优化React性能',
    summary: '通过memo、useMemo、useCallback等工具避免不必要的重渲染',
    answer: '## 性能优化方法\n\n### 1. 使用React.memo\n\n...',
    metadata: {
      confidence: 0.95,
      sources: ['React官方文档', 'Best Practices'],
    },
  },
};

/**
 * 模板注册表
 */
export const TEMPLATE_REGISTRY: Record<string, ResponseTemplate> = {
  [STANDARD_DIALOGUE_TEMPLATE.id]: STANDARD_DIALOGUE_TEMPLATE,
  [TECHNICAL_DOC_TEMPLATE.id]: TECHNICAL_DOC_TEMPLATE,
  [CODE_EXAMPLE_TEMPLATE.id]: CODE_EXAMPLE_TEMPLATE,
  [LEARNING_NOTE_TEMPLATE.id]: LEARNING_NOTE_TEMPLATE,
  [QA_TEMPLATE.id]: QA_TEMPLATE,
};

/**
 * 获取模板
 */
export function getTemplate(id: string): ResponseTemplate | undefined {
  return TEMPLATE_REGISTRY[id];
}

/**
 * 验证响应数据是否符合模板
 */
export function validateResponse(
  response: any,
  template: ResponseTemplate
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  for (const [fieldName, fieldSchema] of Object.entries(template.schema)) {
    if (fieldSchema.required && !response[fieldName]) {
      errors.push(`缺少必填字段: ${fieldName}`);
    }

    const value = response[fieldName];
    if (value) {
      // 验证类型
      if (fieldSchema.type === 'string' && typeof value !== 'string') {
        errors.push(`${fieldName}类型错误，应为string`);
      }

      // 验证长度
      if (typeof value === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`${fieldName}长度不足${fieldSchema.minLength}字符`);
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(`${fieldName}长度超过${fieldSchema.maxLength}字符`);
        }
      }

      // 自定义验证
      if (fieldSchema.validation && !fieldSchema.validation(value)) {
        errors.push(`${fieldName}未通过自定义验证`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 生成System Prompt（基于模板）
 */
export function generateSystemPrompt(template: ResponseTemplate): string {
  const fields = Object.entries(template.schema)
    .map(([name, schema]) => {
      const required = schema.required ? '(必填)' : '(可选)';
      const lengthInfo = schema.minLength && schema.maxLength 
        ? `(${schema.minLength}-${schema.maxLength}字)` 
        : '';
      return `  "${name}": "${schema.description} ${lengthInfo} ${required}"`;
    })
    .join(',\n');

  return `你是一个智能对话助手。请按照以下JSON格式回答用户的问题：

{
${fields}
}

要求：
1. 严格遵循字段长度要求
2. answer字段使用Markdown格式，支持代码块、列表、表格等
3. 代码块必须指定语言，如 \`\`\`javascript
4. 必须返回有效的JSON格式，不要添加任何其他文字
5. 确保JSON中的特殊字符正确转义

示例：
${JSON.stringify(template.example, null, 2)}`;
}

/**
 * 数据库Schema建议
 */
export const DATABASE_SCHEMA = `
-- 对话节点表
CREATE TABLE dialogue_nodes (
  id VARCHAR(50) PRIMARY KEY,
  canvas_id VARCHAR(50) NOT NULL,
  parent_id VARCHAR(50),
  type VARCHAR(20) NOT NULL,
  
  -- 基础信息
  question TEXT NOT NULL,
  title VARCHAR(50),
  summary VARCHAR(200),
  answer TEXT,
  
  -- 模板相关
  template_id VARCHAR(50),
  template_version VARCHAR(10),
  
  -- 元数据（JSON）
  metadata JSONB,
  
  -- 位置信息
  position_x FLOAT,
  position_y FLOAT,
  
  -- 状态
  is_loading BOOLEAN DEFAULT FALSE,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 索引
  INDEX idx_canvas_id (canvas_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_template_id (template_id),
  INDEX idx_created_at (created_at),
  
  -- 外键
  FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES dialogue_nodes(id) ON DELETE CASCADE
);

-- 画布表
CREATE TABLE canvases (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_created_at (created_at)
);

-- 消息历史表
CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  node_id VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  
  INDEX idx_node_id (node_id),
  INDEX idx_timestamp (timestamp),
  
  FOREIGN KEY (node_id) REFERENCES dialogue_nodes(id) ON DELETE CASCADE
);

-- 模板表
CREATE TABLE templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  example JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  version VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_is_active (is_active)
);
`;

