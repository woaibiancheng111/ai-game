# AI 校园生存模拟器

Campus Survival Simulator - 面向 Windows 桌面发布的 AI 校园生存视觉小说

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

复制环境模板文件，在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

商业版默认支持离线游玩，也默认内置线上 AI 代理地址：

```text
https://ai.shixi.chat/chat
```

玩家无需手动填写代理地址。需要改用本地或自建代理时，可以在设置页修改，也可以在 `.env` 中配置代理地址：

```env
# 可选：覆盖默认 AI 服务端代理
AI_PROXY_URL=https://ai.shixi.chat/chat

# 可选：MySQL 数据库配置（不填则默认使用本地模式）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ai_campus_survival
MYSQL_USER=root
MYSQL_PASSWORD=123456
```

- 本地 AI 代理可用 `npm run ai-proxy:dev` 启动，接口为 `POST http://localhost:8787/chat`。
- 代理服务读取 `AI_PROVIDER_API_KEY` 或 `DASHSCOPE_API_KEY`，真实供应商 Key 不进入 Electron 客户端。
- 旧版本地调试仍保留直接 LLM 通道，但 NPC 对话当前走服务端代理；商业版应通过代理隐藏供应商 Key。

### 3. 启动开发模式

```bash
npm run electron:dev
```

### 4. 构建生产版本

```bash
npm run build
```

生成 Windows 安装包：

```bash
npm run dist:win
```

### 5. 运行验收脚本

```bash
npm run validate:story
```

该脚本会检查剧情节点、跳转目标、NPC 引用和教育卡映射是否断裂。

运行 8 章主线固定路线巡检：

```bash
npm run route:smoke
```

运行桌面端可玩流程烟测：

```bash
npm run test:e2e:smoke
```

烟测会启动真实 Electron 窗口，使用临时本地数据目录，覆盖新建档案、开局、选择推进、状态面板、手动存档和自动存档读取。

生成发布候选 Windows 安装包和 SHA256 清单：

```bash
npm run release:win
```

## 项目结构

```
d:\ai-game\
├── electron/          # Electron 主进程代码
│   ├── main.ts        # 主进程入口
│   └── preload.ts     # 预加载脚本
├── public/            # 背景图、图标、BGM 等静态资源
├── server/            # AI 代理服务
├── scripts/           # 验收、烟测和发布脚本
├── docs/              # 发布、隐私和签名说明
├── src/               # React 渲染进程代码
│   ├── engine/        # 游戏引擎核心
│   ├── services/      # 服务层（AI 代理、存储、设置、音频）
│   ├── data/          # 游戏数据（NPC、剧情）
│   └── renderer/      # React UI 组件
└── dist*/release/output/ # 构建、安装包和烟测输出目录（已忽略）
```

## 技术栈

- **框架**: Electron + React 18 + TypeScript
- **构建工具**: Vite + vite-plugin-electron
- **AI 模型**: 服务端代理增强，失败自动静态兜底
- **打包**: electron-builder

## 游戏说明

- 每学期包含关键时间节点，每次触发重要事件和剧情
- AI NPC 拥有独立的 System Prompt；代理不可用时自动使用静态台词，不阻塞游玩
- 状态系统影响游戏进程（GPA、金钱、社交值、声誉等）
- 剧情分支由玩家选择决定，影响 NPC 好感度

## 成品化能力

- 本地优先存档，MySQL 不可用时自动降级
- 可见保存/错误提示，错误日志写入应用数据目录
- AI 代理默认使用 `https://ai.shixi.chat/chat`，流式输出、音频、音量和日志开关可在设置中调整
- 设置页支持测试 AI 代理、打开数据目录、打开日志目录、导出日志包和恢复默认设置
- 已内置轻音乐 BGM：`public/audio/bgm/menu.ogg` 和 `public/audio/bgm/daily.ogg`
- 剧情图可通过 `npm run validate:story` 做自动验收，降低新增章节时的断链风险
- 8 章主线可通过 `npm run route:smoke` 自动巡检到毕业结局
- Electron 可玩流程可通过 `npm run test:e2e:smoke` 自动验收，失败时会输出截图到 `output/smoke/`
- 发布候选包可通过 `npm run release:win` 生成，并输出 `release/release-manifest.*`

## 上线资料

- [Windows 商业版上线清单](docs/RELEASE_CHECKLIST.md)
- [隐私与日志说明模板](docs/PRIVACY_AND_LOGGING_TEMPLATE.md)
- [Windows 签名与安装包发布说明](docs/WINDOWS_SIGNING_AND_RELEASE.md)
