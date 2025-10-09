# 🗄️ Chamberlain

<div align="center">

**开源配置编辑器 - 基于 JSON Schema 的动态配置管理系统**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://reactjs.org/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5+-1890FF)](https://ant.design/)

[特性](#-特性) • [快速开始](#-快速开始) • [文档](#-文档) • [示例](#-示例) • [贡献](#-贡献)

</div>

---

## 📖 简介

Chamberlain 是一个开源的配置管理系统，旨在为多服务、多环境的应用提供强类型、可视化的配置编辑和管理能力。

### 核心特点

- 🎨 **基于 JSON Schema**：通过标准 JSON Schema 定义配置结构，自动生成编辑界面
- 🔧 **开箱即用的 React 组件**：基于 Ant Design Pro 的高级业务组件，无需额外开发
- 🌍 **多条件配置**：支持根据环境、客户、国家等条件提供不同配置
- 🔌 **协议优先设计**：定义清晰的前后端协议，可轻松集成到现有系统
- 🚀 **私有部署友好**：完整的开源方案，支持本地部署
- 📦 **Monorepo 架构**：组件库、协议、示例应用统一管理

### 背景与动机

在许多项目中，都需要根据不同条件动态读取配置的需求。例如：

- 🌐 根据不同国家/地区提供不同的服务配置
- 👥 为不同客户提供定制化的配置方案
- 🔄 在开发、测试、生产环境使用不同的配置

这些配置通常是**长期存在**且**强类型**的，包括整数、浮点数、字符串、枚举等。为了确保配置的可靠性，需要配套的编辑页面、规则校验等功能。

Chamberlain 提供了端到端的完整解决方案，既可以接入不同的后端存储，也提供了可嵌入任何后台管理系统的前端组件。

---

## ✨ 特性

### 前端组件

- ✅ **场景管理组件**
  - 场景表格（SceneTable）- 查看和管理所有配置场景
  - 场景详情（SceneDescriptions）- 展示场景完整信息
  - 场景表单（SceneForm）- 创建和编辑场景

- ✅ **配置管理组件**
  - 配置表格（ConfigTable）- 查看和管理配置
  - 配置详情（ConfigDescriptions）- 基于 Schema 动态渲染
  - 配置表单（ConfigForm）- 基于 Schema 自动生成表单

- ✅ **智能特性**
  - 自动读取服务端 Capabilities，动态调整 UI
  - 支持搜索、排序、筛选（基于服务端能力）
  - 完整的表单验证和错误提示

### 后端协议

- 📋 RESTful API 设计
- 🔐 灵活的鉴权方式（由实现者定义）
- ✅ 标准化的错误响应格式
- 📊 分页、搜索、排序支持

### 开发体验

- 🎭 完整的 Mock 数据层，前端可独立开发
- 📝 TypeScript 类型定义完备
- 🧪 协议兼容性测试脚本
- 📚 详细的文档和示例

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/chamberlain.git
cd chamberlain

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

### 使用前端组件

```tsx
import { ChamberlainProvider, SceneTable } from '@chamberlain/react-components';

function App() {
  return (
    <ChamberlainProvider endpoint="http://localhost:8080/api">
      <SceneTable
        onView={(scene) => console.log('查看场景:', scene)}
        onCreate={() => console.log('创建场景')}
      />
    </ChamberlainProvider>
  );
}
```

---

## 📂 项目结构

```
chamberlain/
├── packages/
│   ├── react-components/    # React 组件库
│   └── protocol/            # 协议定义和测试
├── examples/
│   ├── demo-app/           # 完整 Demo 应用（Ant Design Pro）
│   └── demo-backend/       # 后端实现参考（链接到独立仓库）
└── docs/                   # 文档
```

---

## 📚 文档

- [快速开始](docs/getting-started.md)
- [组件 API 文档](docs/component-api.md)
- [协议规范](packages/protocol/docs/api-spec.md)
- [部署指南](docs/deployment.md)
- [开发指南](docs/development.md)

---

## 🎯 核心概念

### 场景（Scene）

场景是配置管理的基础单元，包含：
- 唯一 ID 和名称
- JSON Schema 定义（支持多版本）
- 条件列表（如环境、客户等）

### 配置（Config）

基于场景创建的具体配置实例，包含：
- 所属场景和 Schema 版本
- 条件筛选（可为空，表示默认配置）
- 符合 Schema 的配置内容

### 示例

```json
{
  "scene": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    "scheme": {
      "type": "object",
      "properties": {
        "host": { "type": "string", "title": "主机地址" },
        "port": { "type": "integer", "title": "端口", "default": 3306 }
      }
    },
    "conditions": [
      { "key": "environment", "value": "环境" },
      { "key": "customer", "value": "客户" }
    ]
  },
  "config": {
    "sceneId": "mysql_database_config",
    "conditions": [
      { "key": "environment", "value": "production" }
    ],
    "config": {
      "host": "prod-db.example.com",
      "port": 3306
    }
  }
}
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📄 License

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- [Ant Design](https://ant.design/) - 企业级 UI 设计语言和 React 组件库
- [Ant Design Pro](https://pro.ant.design/) - 开箱即用的中台前端解决方案
- [JSON Schema](https://json-schema.org/) - 描述 JSON 数据的强大工具

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by Chamberlain Team

</div>
