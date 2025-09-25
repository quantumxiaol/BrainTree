# HOW TO CONTRIBUTE

## 分支管理规范

所有新功能或修改都必须在独立分支上进行开发，禁止直接在 main 或 master 分支上提交代码。

新功能开发：以 feat/ 开头

示例：feat/user-authentication、feat/dashboard-redesign
Bug 修复：以 fix/ 开头（可关联 issue）

示例：fix/login-error-500、fix/header-responsive-bug
文档/配置更新：以 docs/ 或 chore/ 开头（可选）

示例：docs/update-readme

## 🔧开发流程
步骤 1：同步主分支
在开始新功能前，确保你的本地 main 分支是最新的：

```bash
git checkout main
git pull origin main
```

步骤 2：创建新分支
基于 main 创建新分支：

```bash
git checkout -b feat/new-feature-name
# 或
git checkout -b fix/bug-description
```

步骤 3：开发与测试
在分支上进行代码修改。
确保所有功能通过本地测试（单元测试、集成测试等）。
遵循项目代码风格（如 ESLint、Prettier 等）。

步骤 4：提交更改（Commit）
每次提交应聚焦一个明确的变更点，提交信息需清晰描述实现了什么或修复了什么。

✅ 提交信息格式
```
<type>: <description>

[optional body]

[optional footer]
```
```
支持的类型（type）：
feat：新增功能
fix：修复 bug
docs：文档更新
style：代码格式调整（不影响逻辑）
refactor：代码重构
test：测试相关
chore：构建过程或辅助工具变动
```

步骤 5：推送分支
将本地分支推送到远程仓库：

```bash
git push origin feat/new-feature-name
```
首次推送时，Git 可能提示你设置上游分支，按提示操作即可。

步骤 6：创建 Pull Request (PR)
访问 GitHub 仓库页面。
点击 "Compare & pull request" 按钮，或进入 Pull requests → New pull request。

选择：
base: main
compare: feat/new-feature-name

填写 PR 标题和描述：
标题：简明扼要，如 feat: add user registration form
描述：说明变更内容、解决的问题、相关 issue（如 Closes #123）、截图（如 UI 变更）

合并后清理
步骤 1：删除远程分支
PR 合并后，GitHub 通常会提示 "Delete branch"，点击即可删除远程分支。

你也可以手动删除：

```bash
git push origin --delete feat/new-feature-name
```

步骤 2：清理本地分支
```bash
git checkout main
# 删除本地分支
git branch -d feat/new-feature-name
# 同步远程分支状态（清理已删除的远程分支引用）
git fetch -p
```

## 📚 示例流程
```bash
# 1. 更新主分支
git checkout main
git pull origin main

# 2. 创建新功能分支
git checkout -b feat/user-profile-page

# 3. 编写代码并测试

# 4. 提交更改
git add .
git commit -m "feat: implement user profile display and edit form"

# 5. 推送分支
git push origin feat/user-profile-page

# 6. 在 GitHub 上创建 PR，等待审查

# 7. PR 审查通过并合并

# 8. 删除远程分支（GitHub 界面或命令行）
git push origin --delete feat/user-profile-page

# 9. 切换回 main 并删除本地分支
git checkout main
git branch -d feat/user-profile-page
git fetch -p
```

## 关于提交

一次commit到本地Git仓库后，如果改了一些小bug，typo，考虑撤销本地提交，重新提交。

```bash
# 撤销最近一次提交，但保留修改内容（进入暂存区）
git reset --soft HEAD~1

# 撤销最近一次提交，并将修改变为未暂存状态（文件保留在工作区）
git reset --mixed HEAD~1  # 或 git reset HEAD~1

# 彻底删除提交和修改（慎用！）
git reset --hard HEAD~1
```

本地有多个提交，想合并成一个再推送

使用交互式变基

```bash
# 查看最近两次提交，开始交互式变基
git rebase -i HEAD~2
```
编辑器中出现
```
pick abc1234 第一次提交信息
pick def5678 第二次提交信息
```

第二个 pick 改成 squash 或 s
```
pick abc1234 第一次提交信息
squash def5678 第二次提交信息
```

保存退出后，Git 会提示你编辑合并后的提交信息。修改后保存，两个提交就合并为一个了。

然后可以正常推送