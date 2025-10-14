# Demo App 指南

Chamberlain Demo 应用是基于 Ant Design Pro 和 Umi 框架构建的完整示例应用，展示了如何使用 Chamberlain 组件库。

## 快速开始

### 启动开发服务器

```bash
cd examples/demo-app
pnpm install
pnpm dev
```

访问 http://localhost:8000

### 构建生产版本

```bash
pnpm build
```

构建产物位于 `dist/` 目录。

## 功能特性

### 场景管理页面

- 查看所有场景列表
- 创建新场景
- 编辑场景信息
- 查看场景详情
- 删除场景
- 搜索和排序

### 配置管理页面

- 选择场景
- 查看配置列表
- 创建配置（支持条件选择）
- 编辑配置（条件只读）
- 复制配置
- 查看配置详情
- 删除配置

## Mock 数据

Demo 应用包含完整的 Mock 数据层，位于 `mock/` 目录：

- `capabilities.ts` - 服务能力
- `scenes.ts` - 场景 API Mock
- `configs.ts` - 配置 API Mock
- `data/sample-scenes.json` - 示例场景数据
- `data/sample-configs.json` - 示例配置数据

### 切换到真实后端

修改 `.umirc.ts` 中的配置：

```typescript
export default defineConfig({
  mock: false, // 禁用 Mock
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
});
```

## 项目结构

```
demo-app/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Scenes/        # 场景管理页
│   │   └── Configs/       # 配置管理页
│   └── app.tsx            # 应用配置
├── mock/                   # Mock 数据
├── .umirc.ts              # Umi 配置
└── package.json
```

## 常用命令

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint
```

## 常见问题

### 端口冲突

如果 8000 端口被占用：

```bash
PORT=8001 pnpm dev
```

### Mock 数据未生效

确保 `.umirc.ts` 中 `mock` 配置正确：

```typescript
mock: {
  exclude: [],
}
```

### 组件导入错误

确保组件库已编译：

```bash
cd ../../packages/react-components
pnpm build
```

## 相关文档

- [组件 API 文档](./component-api.md)
- [快速开始](./getting-started.md)
- [后端集成](./demo-backend.md)

