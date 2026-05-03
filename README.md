# AI 校园生存模拟器

Campus Survival Simulator - 基于 AI 大模型的校园生存模拟游戏

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

在项目根目录创建 `.env` 文件：

```env
VITE_DASHSCOPE_API_KEY=your_api_key_here
```

API Key 获取地址：https://dashscope.console.aliyun.com/

### 3. 启动开发模式

```bash
npm run electron:dev
```

### 4. 构建生产版本

```bash
npm run build
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
- **AI 模型**: 百连/通义千问 API
- **打包**: electron-builder

## 游戏说明

- 每学期包含关键时间节点，每次触发重要事件和剧情
- AI NPC 拥有独立的 System Prompt，具有独特个性和对话风格
- 状态系统影响游戏进程（GPA、金钱、社交值、声誉等）
- 剧情分支由玩家选择决定，影响 NPC 好感度
