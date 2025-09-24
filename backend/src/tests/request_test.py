# backend/src/tests/request_test.py
# python backend/src/tests/request_test.py

"""
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "你是谁？",
    "context": []
  }'

curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "question": "你是谁？",
    "context": []
  }'
"""

import requests
import json

# API 地址
BASE_URL = "http://localhost:8000"

def test_chat_sync():
    """测试普通同步接口 /api/chat"""
    url = f"{BASE_URL}/api/chat"
    data = {
        "question": "你是谁？",
        "context": []
    }

    try:
        response = requests.post(url, json=data, timeout=30)
        response.raise_for_status()  # 检查 HTTP 错误

        result = response.json()
        print("✅ 同步接口响应:")
        print(result["answer"])
        return result["answer"]
    except requests.exceptions.RequestException as e:
        print("❌ 同步接口请求失败:", e)
        return None

def test_chat_stream():
    """测试流式接口 /api/chat/stream"""
    url = f"{BASE_URL}/api/chat/stream"
    data = {
        "question": "讲个笑话",
        "context": []
    }

    try:
        # 注意：stream=True 表示启用流式接收
        with requests.post(url, json=data, timeout=30, stream=True) as response:
            response.raise_for_status()

            print("✅ 流式接口响应:")
            full_answer = ""

            # 逐行读取流式数据（chunk）
            for chunk in response.iter_lines(decode_unicode=True):
                if chunk:  # 忽略空行
                    full_answer += chunk
                    print(chunk, end="", flush=True)  # 实时打印，不换行

            print()  # 换行
            return full_answer
    except requests.exceptions.RequestException as e:
        print("❌ 流式接口请求失败:", e)
        return None


if __name__ == "__main__":
    print("🧪 开始测试 BrainTree API...\n")
    
    # 测试同步接口
    test_chat_sync()
    
    print("\n" + "-"*50 + "\n")
    
    # 测试流式接口
    test_chat_stream()