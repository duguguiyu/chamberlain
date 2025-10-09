# 快速开始

本指南将帮助你快速上手 Chamberlain 配置管理系统。

## 📦 安装

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 克隆项目

```bash
git clone https://github.com/yourusername/chamberlain.git
cd chamberlain
```

### 安装依赖

```bash
pnpm install
```

## 🚀 快速体验

### 1. 启动 Demo 应用

```bash
pnpm dev
```

访问 http://localhost:8000，你将看到基于 Ant Design Pro 的管理界面。

Demo 应用包含：
- 完整的 Mock 数据
- 场景管理页面
- 配置管理页面

### 2. 使用组件库

在你的 React 项目中使用 Chamberlain 组件：

```bash
npm install @chamberlain/react-components antd @ant-design/pro-components
```

```tsx
import { ChamberlainProvider, SceneTable } from '@chamberlain/react-components';

function App() {
  return (
    <ChamberlainProvider endpoint="http://localhost:8080/api">
      <SceneTable />
    </ChamberlainProvider>
  );
}
```

## 📚 下一步

- [组件 API 文档](./component-api.md) - 了解所有可用组件
- [协议规范](../packages/protocol/docs/api-spec.md) - 了解 API 协议
- [部署指南](./deployment.md) - 部署到生产环境
- [开发指南](./development.md) - 参与项目开发

## 💡 常见场景

### 场景1：为应用添加多环境配置

1. 创建场景（定义配置结构）
2. 添加"环境"条件
3. 为不同环境创建配置（dev, test, prod）

### 场景2：为不同客户提供定制配置

1. 创建场景
2. 添加"客户"条件
3. 为每个客户创建专属配置

### 场景3：功能开关管理

1. 创建"功能开关"场景
2. 使用布尔类型字段
3. 根据环境/地区开启不同功能

## 🆘 获取帮助

- [GitHub Issues](https://github.com/yourusername/chamberlain/issues)
- [讨论区](https://github.com/yourusername/chamberlain/discussions)

## 📄 License

MIT


