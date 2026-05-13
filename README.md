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

商业版默认支持离线游玩，未配置 AI 代理时会使用静态剧情台词兜底。需要 AI NPC 增强时，在 `.env` 中配置代理地址：

```env
# 可选：AI 服务端代理
AI_PROXY_URL=http://localhost:8787/chat

# 可选：MySQL 数据库配置（不填则默认使用本地模式）
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ai_campus_survival
MYSQL_USER=root
MYSQL_PASSWORD=123456
```

- 本地 AI 代理可用 `npm run ai-proxy:dev` 启动，接口为 `POST http://localhost:8787/chat`。
- 代理服务读取 `AI_PROVIDER_API_KEY` 或 `DASHSCOPE_API_KEY`，真实供应商 Key 不进入 Electron 客户端。
- 旧版本地调试仍兼容 `VITE_DASHSCOPE_API_KEY`，但商业版建议通过服务端代理隐藏供应商 Key。

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
├── src/               # React 渲染进程代码
│   ├── engine/        # 游戏引擎核心
│   ├── services/      # 服务层（LLM API、存储）
│   ├── data/          # 游戏数据（NPC、剧情）
│   └── renderer/      # React UI 组件
└── dist-electron/     # 编译后的 Electron 代码
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
- AI 代理、流式输出、音频、音量和日志开关可在设置中调整
- 设置页支持测试 AI 代理、打开数据目录、打开日志目录、导出日志包和恢复默认设置
- 无音频资源时使用内置轻量音景兜底，避免缺失文件导致体验断裂
- 剧情图可通过 `npm run validate:story` 做自动验收，降低新增章节时的断链风险
- 8 章主线可通过 `npm run route:smoke` 自动巡检到毕业结局
- Electron 可玩流程可通过 `npm run test:e2e:smoke` 自动验收，失败时会输出截图到 `output/smoke/`
- 发布候选包可通过 `npm run release:win` 生成，并输出 `release/release-manifest.*`

## 上线资料

- [Windows 商业版上线清单](docs/RELEASE_CHECKLIST.md)
- [隐私与日志说明模板](docs/PRIVACY_AND_LOGGING_TEMPLATE.md)
- [Windows 签名与安装包发布说明](docs/WINDOWS_SIGNING_AND_RELEASE.md)
