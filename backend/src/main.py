from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, AsyncGenerator
import json
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage,BaseMessage
from langgraph.prebuilt import create_react_agent

app = FastAPI(title="BrainTree API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 从配置加载模型设置
from config import config
config.validate()

model_name = config.LLM_MODEL_NAME
api_key = config.LLM_MODEL_API_KEY
api_base = config.LLM_MODEL_BASE_URL

# 初始化 LLM 模型
model = ChatOpenAI(
    model_name=model_name,
    api_key=api_key,
    base_url=api_base,
)

class ChatRequest(BaseModel):
    question: str  # 当前问题
    context: List[Dict] = []  # 完整对话历史，由前端构建

class ChatResponse(BaseModel):
    answer: str

class LLMService:
    @staticmethod
    async def get_response(question: str, context: List[Dict]) -> str:
        """
        获取LLM的回复 - 简单的单阶段调用
        """
        try:
            # 构建完整提示，包含上下文
            full_prompt = ""
            
            # 添加上下文对话历史（由前端提供）
            for item in context:
                if item.get('question'):
                    full_prompt += f"Q: {item['question']}\n"
                if item.get('answer'):
                    full_prompt += f"A: {item['answer']}\n"
            
            # 添加当前问题
            full_prompt += f"Q: {question}\nA:"
            
            # 使用模型进行调用
            agent = create_react_agent(model, tools=[])
            result = await agent.ainvoke({"messages": [HumanMessage(content=full_prompt)]})
            final_answer = result["messages"][-1].content
            
            return final_answer
            
        except Exception as e:
            print(f"LLM请求错误: {e}")
            raise Exception(f"LLM请求失败: {str(e)}")
    @staticmethod
    async def stream_response(question: str, context: List[Dict]) -> AsyncGenerator[str, None]:
        try:
            # 构建消息列表
            messages: List[BaseMessage] = []

            for item in context:
                if item.get("question"):
                    messages.append(HumanMessage(content=item["question"]))
                if item.get("answer"):
                    messages.append(HumanMessage(content=item["answer"]))  # 注意：应为 AIMessage

            messages.append(HumanMessage(content=question))

            # 直接使用 model.astream() 流式输出 token
            async for chunk in model.astream(messages):
                if hasattr(chunk, "content") and chunk.content:
                    yield chunk.content  # 逐个 token 输出

        except Exception as e:
            yield f"\n\n[ERROR] {str(e)}"
@app.get("/")
async def root():
    return {"message": "Welcome to BrainTree API"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    与LLM对话的接口 - 简单的LLM调用
    """
    try:
        # 调用LLM获取回复
        answer = await LLMService.get_response(request.question, request.context)
        
        return ChatResponse(answer=answer)
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    流式对话接口
    返回 text/event-stream
    """
    try:
        # 使用流式生成器
        generator = LLMService.stream_response(request.question, request.context)
        return StreamingResponse(generator, media_type="text/plain; charset=utf-8")
    except Exception as e:
        print(f"Stream endpoint error: {e}")
        return StreamingResponse(
            iter([f"Error: {str(e)}"]),
            media_type="text/plain; charset=utf-8",
            status_code=500
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)