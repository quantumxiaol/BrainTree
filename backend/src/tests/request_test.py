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
import sys

# API 地址
BASE_URL = "http://localhost:8000"

def test_chat_sync():
    """测试普通同步接口 /api/chat"""
    url = f"{BASE_URL}/api/chat"
    data = {
        "question": "你是谁？",
        "context": []
    }

    print(f"🔍 正在测试同步接口: {url}")
    try:
        response = requests.post(url, json=data, timeout=30)
        assert response.status_code == 200, f"HTTP {response.status_code}: {response.text}"

        result = response.json()
        assert "answer" in result, "响应中缺少 'answer' 字段"
        assert len(result["answer"]) > 0, "answer 为空"

        print("✅ 同步接口测试通过！")
        print("回答:", result["answer"])
        return result["answer"]
    except Exception as e:
        print("❌ 同步接口测试失败:", str(e))
        sys.exit(1)  # ← 关键：让脚本以失败退出

def test_chat_stream():
    """测试流式接口 /api/chat/stream"""
    url = f"{BASE_URL}/api/chat/stream"
    data = {
        "question": "讲个笑话",
        "context": []
    }

    print(f"🔍 正在测试流式接口: {url}")
    try:
        with requests.post(url, json=data, timeout=30, stream=True) as response:
            assert response.status_code == 200, f"HTTP {response.status_code}: {response.text}"

            print("✅ 流式接口响应开始...")
            full_answer = ""
            chunk_count = 0

            for chunk in response.iter_lines(decode_unicode=True):
                if chunk.strip():  # 非空 chunk
                    full_answer += chunk
                    print(chunk, end="", flush=True)
                    chunk_count += 1

            print()  # 换行

            # 验证流式响应是否有效
            assert chunk_count > 0, "未收到任何数据流"
            assert len(full_answer) > 10, "流式回答太短，可能不完整"

            print("✅ 流式接口测试通过！")
            return full_answer
    except Exception as e:
        print("❌ 流式接口测试失败:", str(e))
        sys.exit(1)  # ← 关键：让脚本以失败退出


if __name__ == "__main__":
    print("开始测试 BrainTree API...\n")
    
    # 测试同步接口
    test_chat_sync()
    
    print("\n" + "-"*50 + "\n")
    
    # 测试流式接口
    test_chat_stream()

    print("\n 所有后端测试通过！")
    sys.exit(0)