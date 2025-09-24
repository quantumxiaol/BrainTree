# Brain Tree

基于树状图管理对话历史，可以从一个节点开始新的对话。

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
# 安装pnpm(如果尚未安装)
npm install -g pnpm
pnpm --version

```

```bash
# 安装项目依赖
cd frontend
pnpm install

```

启动前端
```bash
pnpm run dev

# 构建生产版本
pnpm run build
```
