# src/config.py

from dotenv import load_dotenv
from typing import Optional
import os
from dotenv import load_dotenv
from typing import Optional
import os

# 修改路径查找逻辑，更灵活地定位 .env 文件
def find_env_file():
    """查找 .env 文件的多种可能位置"""
    current_dir = os.path.dirname(os.path.abspath(__file__))  # backend/src/
    parent_dir = os.path.dirname(current_dir)  # backend/
    grandparent_dir = os.path.dirname(parent_dir)  # 项目根目录
    
    possible_paths = [
        os.path.join(current_dir, '.env'),  # backend/src/.env
        os.path.join(parent_dir, '.env'),   # backend/.env
        os.path.join(grandparent_dir, '.env'),  # 项目根/.env
        os.path.join(os.path.expanduser('~'), '.env'),  # 用户根目录
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    return None

# 加载 .env 文件
env_path = find_env_file()
if env_path:
    load_dotenv(dotenv_path=env_path)


class Config:
    """
    配置类：集中管理所有环境变量
    """

    # ================== LLM Settings ==================
    # LLM (用于信息查询)
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "qwen-max-latest")
    LLM_MODEL_BASE_URL: str = os.getenv("LLM_MODEL_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    LLM_MODEL_API_KEY: str = os.getenv("LLM_MODEL_API_KEY", "")

    # 默认 User-Agent
    USER_AGENT: str = os.getenv("USER_AGENT", "MyApp/1.0")

    # ================Prompt Settings ==================
    _prompt_directory = os.getenv("PROMPT_DIRECTORY", "./resources/prompts")
    PROMPT_DIRECTORY:str = os.path.abspath(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), _prompt_directory.lstrip("./"))
    )
    @classmethod
    def validate(cls):
        """
        验证必要配置是否已设置
        """
        missing = []
        if not cls.LLM_MODEL_API_KEY:
            missing.append("LLM_MODEL_API_KEY")

        if missing:
            raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")

# 创建一个全局实例，方便导入
config = Config()