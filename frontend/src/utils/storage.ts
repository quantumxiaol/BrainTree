import type { ConversationCanvas } from '../types/conversation';

const STORAGE_KEY = 'braintree_canvases';
const STORAGE_VERSION = '1.0';

interface StorageData {
  version: string;
  canvases: ConversationCanvas[];
  activeCanvasId: string | null;
  timestamp: number;
}

/**
 * 保存画布数据到 localStorage
 */
export function saveCanvases(canvases: ConversationCanvas[], activeCanvasId: string | null): boolean {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      canvases,
      activeCanvasId,
      timestamp: Date.now(),
    };

    const jsonString = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonString);
    
    console.log(`✅ 已保存 ${canvases.length} 个画布到本地存储`);
    return true;
  } catch (error) {
    console.error('保存画布数据失败:', error);
    
    // 如果是容量超限，提示用户
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('浏览器存储空间已满！请导出数据或删除一些旧的画布。');
    }
    
    return false;
  }
}

/**
 * 从 localStorage 加载画布数据
 */
export function loadCanvases(): { canvases: ConversationCanvas[]; activeCanvasId: string | null } | null {
  try {
    const jsonString = localStorage.getItem(STORAGE_KEY);
    
    if (!jsonString) {
      console.log('📭 本地存储中没有保存的数据');
      return null;
    }

    const data: StorageData = JSON.parse(jsonString);
    
    // 检查版本兼容性
    if (data.version !== STORAGE_VERSION) {
      console.warn('⚠️ 存储数据版本不匹配，可能需要迁移');
      // 这里可以添加数据迁移逻辑
    }

    console.log(`📂 已加载 ${data.canvases.length} 个画布（保存于 ${new Date(data.timestamp).toLocaleString()}）`);
    
    return {
      canvases: data.canvases,
      activeCanvasId: data.activeCanvasId,
    };
  } catch (error) {
    console.error('加载画布数据失败:', error);
    return null;
  }
}

/**
 * 清除所有保存的数据
 */
export function clearStorage(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ 已清除本地存储');
    return true;
  } catch (error) {
    console.error('清除本地存储失败:', error);
    return false;
  }
}

/**
 * 导出数据为 JSON 文件
 */
export function exportData(canvases: ConversationCanvas[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      canvases,
      activeCanvasId: null,
      timestamp: Date.now(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `braintree-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📥 数据已导出');
  } catch (error) {
    console.error('导出数据失败:', error);
    alert('导出数据失败！');
  }
}

/**
 * 从 JSON 文件导入数据
 */
export function importData(file: File): Promise<ConversationCanvas[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const data: StorageData = JSON.parse(jsonString);
        
        if (!data.canvases || !Array.isArray(data.canvases)) {
          throw new Error('无效的数据格式');
        }
        
        console.log(`📤 已导入 ${data.canvases.length} 个画布`);
        resolve(data.canvases);
      } catch (error) {
        console.error('解析导入文件失败:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * 获取存储使用情况
 */
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  try {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    // localStorage 的大小限制通常是 5MB (5 * 1024 * 1024 字符)
    const maxSize = 5 * 1024 * 1024;
    const usedSize = totalSize * 2; // 每个字符约 2 字节
    const percentage = (usedSize / maxSize) * 100;
    
    return {
      used: usedSize,
      total: maxSize,
      percentage: Math.min(percentage, 100),
    };
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

