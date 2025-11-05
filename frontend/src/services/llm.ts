/**
 * LLM服务
 * 处理与大语言模型的API通信
 */

import type { Message } from '../types/conversation';

// 默认配置（如果没有config.ts文件）
const defaultConfig = {
  provider: 'openai' as const,
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
};

// 动态加载配置
let userConfig = defaultConfig;
let configLoaded = false;

async function loadConfig() {
  if (configLoaded) return;
  
  try {
    // 使用字符串路径避免TypeScript编译检查
    const configPath = '/config.ts';
    const imported = await import(/* @vite-ignore */ `../..${configPath}`);
    userConfig = imported.config || imported.default || defaultConfig;
    configLoaded = true;
  } catch (e) {
    console.warn('未找到config.ts，使用默认配置。请复制config.example.ts为config.ts并填入API密钥。');
    configLoaded = true;
  }
}

export interface LLMResponse {
  content: string;
  title?: string; // 对话主题
  summary?: string; // 对话概述
  tokensUsed?: number;
  finishReason?: string;
}

export interface LLMError {
  message: string;
  code?: string;
}

/**
 * System Prompt - 用于引导AI生成结构化响应
 */
const SYSTEM_PROMPT = `你是一个智能对话助手。请按照以下JSON格式回答用户的问题：

{
  "title": "对话主题（8-15个字的简洁标题）",
  "summary": "对话概述（20-40字的简短摘要，概括核心内容）",
  "answer": "完整的详细回答（使用Markdown格式）"
}

要求：
1. title要简洁有力，准确概括问题的核心主题
2. summary要提炼关键信息，让用户一眼了解答案要点
3. answer要详细完整，使用Markdown格式回答：
   - 使用标题（#、##、###）组织结构
   - 使用代码块（\`\`\`language）展示代码
   - 使用列表（-、1.）列举要点
   - 使用**粗体**强调重点
   - 使用表格展示对比数据
   - 使用引用块（>）标注重要信息
4. 代码块必须指定语言，如 \`\`\`javascript、\`\`\`python、\`\`\`typescript
5. 必须返回有效的JSON格式，不要添加任何其他文字
6. 确保JSON中的特殊字符正确转义（特别是换行符\\n、引号\\"）

示例：
{
  "title": "React Hooks使用指南",
  "summary": "React Hooks是React 16.8引入的新特性，允许在函数组件中使用状态和生命周期功能",
  "answer": "# React Hooks\\n\\n## 什么是Hooks\\n\\nHooks是...\\n\\n## 常用Hooks\\n\\n### useState\\n\\n\`\`\`javascript\\nconst [count, setCount] = useState(0);\\n\`\`\`\\n\\n### useEffect\\n\\n\`\`\`javascript\\nuseEffect(() => {\\n  // 副作用代码\\n}, [dependencies]);\\n\`\`\`"
}`;

/**
 * 调用OpenAI API
 */
async function callOpenAI(messages: Message[]): Promise<LLMResponse> {
  if (!userConfig.apiKey) {
    throw new Error('未配置API密钥。请在config.ts中设置apiKey。');
  }

  // 添加system prompt
  const apiMessages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch(`${userConfig.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: userConfig.model,
      messages: apiMessages,
      temperature: userConfig.temperature,
      max_tokens: userConfig.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || '请求失败');
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content || '';
  
  // 尝试解析JSON响应
  try {
    const parsed = JSON.parse(rawContent);
    return {
      content: parsed.answer || rawContent,
      title: parsed.title,
      summary: parsed.summary,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices[0]?.finish_reason,
    };
  } catch (e) {
    // 如果解析失败，返回原始内容
    console.warn('AI返回的不是有效JSON，使用原始内容');
    return {
      content: rawContent,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices[0]?.finish_reason,
    };
  }
}

/**
 * 调用Anthropic API
 */
async function callAnthropic(messages: Message[]): Promise<LLMResponse> {
  if (!userConfig.apiKey) {
    throw new Error('未配置API密钥。请在config.ts中设置apiKey。');
  }

  const apiUrl = userConfig.apiUrl || 'https://api.anthropic.com/v1';
  
  // Anthropic使用system参数而不是system message
  const response = await fetch(`${apiUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': userConfig.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: userConfig.model || 'claude-3-opus-20240229',
      system: SYSTEM_PROMPT,
      messages: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: userConfig.maxTokens,
      temperature: userConfig.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || '请求失败');
  }

  const data = await response.json();
  const rawContent = data.content[0]?.text || '';
  
  // 尝试解析JSON响应
  try {
    const parsed = JSON.parse(rawContent);
    return {
      content: parsed.answer || rawContent,
      title: parsed.title,
      summary: parsed.summary,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.stop_reason,
    };
  } catch (e) {
    console.warn('AI返回的不是有效JSON，使用原始内容');
    return {
      content: rawContent,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.stop_reason,
    };
  }
}

/**
 * 主调用函数
 */
export async function callLLM(messages: Message[]): Promise<LLMResponse> {
  // 确保配置已加载
  await loadConfig();
  
  try {
    const provider = userConfig.provider;
    if (provider === 'openai') {
      return await callOpenAI(messages);
    } else if (provider === 'anthropic') {
      return await callAnthropic(messages);
    } else if (provider === 'custom') {
      // 自定义provider可以在这里实现
      throw new Error('自定义provider未实现');
    } else {
      throw new Error(`不支持的provider: ${provider}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('未知错误');
  }
}

/**
 * 流式调用（未来可实现）
 */
export async function* streamLLM(messages: Message[]): AsyncGenerator<string, void, unknown> {
  // 流式响应实现
  const response = await callLLM(messages);
  yield response.content;
}

/**
 * 检查配置是否有效
 */
export async function isConfigured(): Promise<boolean> {
  await loadConfig();
  return !!userConfig.apiKey;
}

/**
 * 获取当前配置信息
 */
export async function getConfigInfo() {
  await loadConfig();
  return {
    provider: userConfig.provider,
    model: userConfig.model,
    hasApiKey: !!userConfig.apiKey,
  };
}
