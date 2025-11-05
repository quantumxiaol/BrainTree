# Brain Tree

基于树状图管理对话历史，可以从一个节点开始新的对话。整体和AI的交互以思维导图的形式展开，思维导图的不同分支代表不同的对话，从一个新的分支节点开启新的问题，兄弟节点的内容不作为上下文干扰。原来针对同一个项目，可能要有多个页面对话，避免对话历史互相的干扰。现在这些不同的对话可以在思维导图中展示出来，帮助用户整理思路。这个思维导图每个节点展示用户问题和AI回答的总结，点进去可以看到AI的详细回答。一个思维导图中可以有多个孤立的节点，也可以连线节点构成思维导图，连线的节点AI会正确的使用上下文。

## Environment

### Backend

使用uv管理环境
```bash
# 安装uv（如果没有）
# On macOS and Linux.
curl -LsSf https://astral.sh/uv/install.sh | sh
# On Windows.
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# With pip.
pip install uv

uv --version

```

部署Python 环境，填写API key
```bash
uv venv --python 3.12
source .venv/bin/activate

# use -i https://pypi.tuna.tsinghua.edu.cn/simple or https://mirrors.aliyun.com/pypi/simple
uv lock
uv sync

cat .env.template > .env
# 替换 your_openai_api_key_here
```

运行后端服务器

```bash
# 直接运行main.py
python backend/src/main.py
# or
python -m backend.src.main
# or
uvicorn backend.src.main:app --reload --port 8000
```

### Frontend

使用pnpm管理环境
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm --version
nvm install 20
nvm use 20

# 安装pnpm(如果尚未安装)
npm install -g pnpm
pnpm --version

# 安装项目依赖
cd frontend
pnpm install

```

配置API(当前版本)
```bash
cat config.example.ts > config.ts
# 替换 your_openai_api_key_here
```

启动前端
```bash
pnpm run dev

# 构建生产版本
pnpm run build
```
