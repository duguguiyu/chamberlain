# Chamberlain Demo App

基于 Ant Design Pro 和 Umi 的 Chamberlain 完整示例应用，展示了场景管理和配置管理的完整功能。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:8000

## ✨ 功能特性

- **场景管理** - 创建、编辑、查看、删除场景
- **配置管理** - 基于场景创建配置，支持多条件配置
- **Mock 数据** - 完整的 Mock 数据层，无需后端即可运行
- **动态表单** - 基于 JSON Schema 自动生成配置表单

## 📦 Mock 数据

默认使用 Mock 数据，包含示例场景和配置。

切换到真实后端请修改 `.umirc.ts`:

```typescript
mock: false,
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
},
```

## 📚 完整文档

详细文档请查看: [Demo App 指南](../../docs/demo-app.md)

## 相关链接

- [Chamberlain 主项目](../../README.md)
- [组件库文档](../../packages/react-components/README.md)
- [后端服务](../demo-backend/README.md)


