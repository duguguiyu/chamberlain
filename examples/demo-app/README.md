# Chamberlain Demo App

基于 Ant Design Pro 和 Umi 的 Chamberlain 示例应用。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:8000

### 构建生产版本

```bash
pnpm build
```

## 📁 目录结构

```
demo-app/
├── mock/                    # Mock 数据
│   ├── data/               # 静态数据文件
│   │   ├── sample-scenes.json
│   │   └── sample-configs.json
│   ├── capabilities.ts     # Capabilities Mock
│   ├── scenes.ts           # Scenes Mock API
│   └── configs.ts          # Configs Mock API
├── src/
│   ├── pages/              # 页面
│   │   ├── Scenes/         # 场景管理页
│   │   └── Configs/        # 配置管理页
│   └── app.tsx             # 应用配置
├── .umirc.ts               # Umi 配置
└── package.json
```

## 🎭 Mock 数据

本项目包含完整的 Mock 数据层，支持前端独立开发：

### 特性

- ✅ 支持所有 Chamberlain API
- ✅ 模拟网络延迟（300ms）
- ✅ 完整的错误处理
- ✅ 数据持久化（会话期间）

### 示例数据

Mock 数据包含：

- **3 个场景**
  - MySQL 数据库配置
  - Redis 缓存配置
  - 应用功能开关

- **7 个配置**
  - 覆盖多种环境（default, production, development）
  - 展示多条件配置

### 切换到真实后端

修改 `.umirc.ts` 中的 proxy 配置：

```typescript
proxy: {
  '/api': {
    target: 'http://your-backend-url',
    changeOrigin: true,
  },
},
```

## 🔧 开发

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `.umirc.ts` 的 `routes` 中添加路由

### 添加 Mock API

1. 在 `mock/` 目录创建新的 Mock 文件
2. 导出符合 Umi Mock 格式的对象

## 📚 相关文档

- [Ant Design Pro](https://pro.ant.design/)
- [Umi.js](https://umijs.org/)
- [Chamberlain Components](../../packages/react-components/README.md)

## 📄 License

MIT


