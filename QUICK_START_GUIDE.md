# 🚀 Chamberlain 快速启动指南

## 📦 项目完成状态

✅ **6 个核心前端组件** 全部完成  
✅ **完整的 Demo 应用** 已集成所有组件  
✅ **Java 后端服务** 已实现并测试通过

---

## 🎯 快速体验完整流程

### 1. 启动后端服务

```bash
cd examples/demo-backend

# 使用 H2 内存数据库（本地开发）
java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=local
```

后端服务将在 **http://localhost:8080** 启动

### 2. 启动前端应用

在新的终端窗口：

```bash
cd examples/demo-app

# 启动开发服务器
pnpm dev
```

前端应用将在 **http://localhost:8000** 启动

### 3. 体验完整流程

访问 http://localhost:8000 后，您可以：

#### 场景管理流程（/scenes）
1. **查看场景列表**：看到所有已创建的场景
2. **创建新场景**：
   - 点击"创建"按钮
   - 填写场景 ID（如：`my_app_config`）
   - 填写场景名称和描述
   - 添加可用条件（如：环境、客户）
   - 输入 JSON Schema 定义
   - 提交创建
3. **查看场景详情**：点击"查看"按钮，查看完整信息和 Schema
4. **编辑场景**：点击"编辑"按钮，修改场景信息
5. **删除场景**：点击"删除"按钮，删除场景

#### 配置管理流程（/configs）
1. **选择场景**：从顶部下拉框选择一个场景
2. **查看配置列表**：查看该场景下的所有配置
3. **创建配置**：
   - 点击"创建配置"按钮
   - 表单会根据 Schema 自动生成
   - 填写配置数据
   - 提交创建
4. **查看配置详情**：点击"查看"按钮，查看配置的完整信息
5. **编辑配置**：点击"编辑"按钮，修改配置数据
6. **复制配置**：点击"复制"按钮，快速创建配置副本
7. **删除配置**：点击"删除"按钮，删除配置

---

## 📂 6 个核心组件详解

### 场景管理组件

#### 1. SceneTable - 场景列表表格
```tsx
import { SceneTable } from '@chamberlain/react-components';

<SceneTable
  searchable
  showActions
  showCreateButton
  actions={{
    onCreate: () => {},
    onView: (scene) => {},
    onEdit: (scene) => {},
    onDelete: async (scene) => {},
  }}
/>
```

#### 2. SceneForm - 场景表单
```tsx
import { SceneForm } from '@chamberlain/react-components';

<SceneForm
  scene={scene}  // 编辑模式（可选）
  onSubmit={async (values) => {}}
  onCancel={() => {}}
/>
```

#### 3. SceneDescriptions - 场景详情
```tsx
import { SceneDescriptions } from '@chamberlain/react-components';

<SceneDescriptions
  scene={scene}
  showSchema
  column={2}
/>
```

### 配置管理组件

#### 4. ConfigTable - 配置列表表格
```tsx
import { ConfigTable } from '@chamberlain/react-components';

<ConfigTable
  sceneId="my_scene"
  searchable
  showActions
  showCreateButton
  actions={{
    onCreate: () => {},
    onView: (config) => {},
    onEdit: (config) => {},
    onDelete: async (config) => {},
    onCopy: (config) => {},
  }}
/>
```

#### 5. ConfigForm - 配置表单（基于 Schema 自动生成）
```tsx
import { ConfigForm } from '@chamberlain/react-components';

<ConfigForm
  schema={jsonSchema}
  initialValues={config}  // 编辑模式（可选）
  onSubmit={async (values) => {}}
  onCancel={() => {}}
/>
```

#### 6. ConfigDescriptions - 配置详情
```tsx
import { ConfigDescriptions } from '@chamberlain/react-components';

<ConfigDescriptions
  config={config}
  schema={jsonSchema}
  showRawConfig
  column={2}
/>
```

---

## 🛠️ 开发环境

### 前端开发

```bash
# 进入组件库
cd packages/react-components
pnpm install
pnpm dev        # 开发模式
pnpm build      # 构建组件库

# 进入 Demo 应用
cd examples/demo-app
pnpm install
pnpm dev        # 启动开发服务器
pnpm build      # 构建生产版本
```

### 后端开发

```bash
cd examples/demo-backend

# 编译
mvn clean package

# 运行测试
mvn test

# 启动服务
java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=local
```

---

## 🔧 配置说明

### 后端配置文件

- **application-local.yml**: H2 内存数据库（快速开发）
- **application-dev.yml**: MySQL 数据库（开发环境）
- **application-prod.yml**: MySQL + Redis（生产环境）

### 前端配置

Demo 应用配置文件：`examples/demo-app/.umirc.ts`

```typescript
export default defineConfig({
  // API 代理配置
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
});
```

---

## 📊 数据流程图

```
┌─────────────────────────────────────────────────────────┐
│                     前端应用                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │
│  │场景管理页 │  │配置管理页 │  │ ChamberlainClient│     │
│  │(6组件)   │→ │(6组件)   │→ │  (API Client)    │     │
│  └──────────┘  └──────────┘  └──────────────────┘     │
└─────────────────────────────│───────────────────────────┘
                               │ HTTP/JSON
                               ↓
┌─────────────────────────────────────────────────────────┐
│                     后端服务                              │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────┐     │
│  │Controller│→ │  Service  │→ │   Repository    │     │
│  │(3个)     │  │(Schema验证)│  │    (JPA)        │     │
│  └──────────┘  └───────────┘  └─────────────────┘     │
└─────────────────────────────│───────────────────────────┘
                               │
                               ↓
                        ┌──────────────┐
                        │ H2 / MySQL   │
                        │   数据库      │
                        └──────────────┘
```

---

## 🎨 组件特性

### 智能特性
- ✅ 自动读取服务端 Capabilities
- ✅ 根据能力动态调整 UI
- ✅ 基于 JSON Schema 自动生成表单
- ✅ 智能类型渲染
- ✅ 完整的数据验证

### 支持的字段类型

| JSON Schema 类型 | 渲染组件 | 示例 |
|-----------------|---------|------|
| string | Input | 普通文本输入 |
| string (enum) | Select | 下拉选择 |
| string (format=textarea) | TextArea | 多行文本 |
| number / integer | InputNumber | 数字输入 |
| boolean | Switch | 开关 |
| array | List / TextArea | 列表或 JSON |
| object | TextArea | JSON 对象 |

---

## 📖 更多文档

- **组件 API 文档**: [docs/component-api.md](docs/component-api.md)
- **协议规范**: [packages/protocol/docs/api-spec.md](packages/protocol/docs/api-spec.md)
- **后端设计**: [docs/backend-java-design.md](docs/backend-java-design.md)
- **部署指南**: [docs/deployment.md](docs/deployment.md)

---

## 🚨 常见问题

### Q: 前端组件显示"模块未找到"？
A: 确保组件库已编译：
```bash
cd packages/react-components && pnpm build
```

### Q: 后端服务无法启动？
A: 检查 Java 版本（需要 17+）和 Maven 安装

### Q: API 请求失败？
A: 确保后端服务已启动，检查 proxy 配置

### Q: 表单验证不工作？
A: 检查 JSON Schema 定义是否正确

---

## 🎯 下一步

1. **查看示例**: 浏览 Demo 应用的完整实现
2. **自定义样式**: 修改 Ant Design 主题
3. **添加权限**: 集成认证授权系统
4. **部署上线**: 参考部署文档进行生产部署

---

## 💡 提示

- 使用 H2 控制台查看数据库：http://localhost:8080/h2-console
- 使用 Swagger 文档查看 API：http://localhost:8080/swagger-ui.html
- 使用 Chrome DevTools 查看网络请求

---

**祝您使用愉快！** 🎉

如有问题，请参考文档或提交 Issue。

