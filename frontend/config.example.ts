/**
 * 配置文件示例
 * 复制此文件为 config.ts 并填入你的配置
 */

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const config: LLMConfig = {
  // LLM提供商: 'openai', 'anthropic', 或 'custom'
  provider: 'openai',
  
  // API密钥
  apiKey: 'your_openai_api_key_here',
  
  // 可选: 自定义API地址（用于代理或自托管）
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  
  // 可选: 模型名称
  model: 'qwen-plus',
  
  // 可选: 温度（0-2）
  temperature: 0.7,
  
  // 可选: 最大token数
  maxTokens: 2000,
};

export default config;
