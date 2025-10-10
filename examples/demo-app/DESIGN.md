# 📱 Chamberlain Demo App - 设计文档

## 🎯 设计目标

Demo App 是一个基于 **Umi.js 4 + Ant Design Pro** 的完整示例应用，用于展示 Chamberlain 配置编辑器的所有核心功能。

### 核心设计理念

1. **开箱即用**：可独立运行，使用 Mock 数据无需后端
2. **生产就绪**：架构和代码质量达到生产级标准
3. **最佳实践**：展示 React、Ant Design Pro 的最佳实践
4. **可扩展性**：易于添加新功能和自定义

---

## 🏗️ 技术架构

### 技术栈

```
Frontend Framework:    Umi.js 4.x (React 18)
UI Library:           Ant Design 5 + Ant Design Pro Components
Component Library:    @chamberlain/react-components (自研)
Protocol:             @chamberlain/protocol (自研)
State Management:     Umi Model (内置)
Request:              Umi Request (内置，基于 axios)
Mock Data:            Umi Mock (内置)
Build Tool:           Webpack (Umi 内置)
Package Manager:      pnpm
```

### 项目结构

```
examples/demo-app/
├── src/                          # 源代码
│   ├── app.tsx                   # 应用入口配置
│   ├── pages/                    # 页面组件
│   │   ├── Scenes/              # 场景管理页面
│   │   │   └── index.tsx
│   │   └── Configs/             # 配置管理页面
│   │       └── index.tsx
│   ├── models/                   # 全局状态（未使用）
│   ├── services/                 # API 服务（未使用，在 components 中）
│   └── utils/                    # 工具函数（未使用）
│
├── mock/                         # Mock 数据层
│   ├── capabilities.ts           # 服务能力 API
│   ├── scenes.ts                 # 场景 CRUD API
│   ├── configs.ts                # 配置 CRUD API
│   └── data/                     # 静态数据文件
│       ├── sample-scenes.json
│       └── sample-configs.json
│
├── .umirc.ts                     # Umi 配置文件
├── package.json
└── tsconfig.json
```

---

## 🎨 UI/UX 设计

### 布局结构

使用 Ant Design Pro 的 **ProLayout** 布局：

```
┌──────────────────────────────────────────────────┐
│  🗄️ Chamberlain                      [头像]      │  Header (48px)
├──────────┬───────────────────────────────────────┤
│          │                                       │
│  [菜单]   │                                       │
│          │         页面内容区                     │  Content
│  场景管理 │      (PageContainer)                 │
│  配置管理 │                                       │
│          │                                       │
│          │                                       │
│ (200px)  │                                       │
└──────────┴───────────────────────────────────────┘
```

### 路由设计

```typescript
routes: [
  {
    path: '/',
    redirect: '/scenes',  // 默认跳转到场景管理
  },
  {
    name: '场景管理',
    path: '/scenes',
    component: './Scenes',
  },
  {
    name: '配置管理',
    path: '/configs',
    component: './Configs',
  },
]
```

### 页面设计

#### 1️⃣ 场景管理页面 (`/scenes`)

**功能模块：**
- **SceneTable**：场景列表（表格）
- **SceneForm**：创建/编辑场景（弹窗表单）
- **SceneDescriptions**：场景详情（弹窗展示）

**用户流程：**
```
查看列表 → 点击创建 → 填写表单 → 提交成功
        ↘ 点击查看 → 弹窗展示详情
        ↘ 点击编辑 → 填写表单 → 更新成功
        ↘ 点击删除 → 确认对话框 → 删除成功
        ↘ 查看配置 → 跳转到配置页
```

**Modal 模式：**
- 创建场景 Modal：宽度 800px，使用 `SceneForm`
- 编辑场景 Modal：宽度 800px，使用 `SceneForm` + `initialValues`
- 查看详情 Modal：宽度 1000px，使用 `SceneDescriptions` + Tabs

#### 2️⃣ 配置管理页面 (`/configs`)

**功能模块：**
- **场景选择器**：顶部下拉框
- **ConfigTable**：配置列表（表格）
- **ConfigForm**：创建/编辑配置（弹窗表单，动态生成）
- **ConfigDescriptions**：配置详情（弹窗展示）

**用户流程：**
```
选择场景 → 查看配置列表 → 点击创建 → 动态表单 → 提交成功
                       ↘ 点击查看 → 弹窗展示详情
                       ↘ 点击编辑 → 动态表单 → 更新成功
                       ↘ 点击复制 → 复制配置
                       ↘ 点击删除 → 确认对话框 → 删除成功
```

**动态表单生成：**
根据场景的 `currentScheme` (JSON Schema) 自动生成表单字段。

---

## 🔌 数据流设计

### 架构层次

```
┌─────────────────────────────────────────────┐
│           Pages (Scenes/Configs)            │  页面层：业务逻辑
├─────────────────────────────────────────────┤
│     Chamberlain Components                  │  组件层：可复用组件
│  (SceneTable, ConfigForm, etc.)            │
├─────────────────────────────────────────────┤
│      ChamberlainContext + Hooks             │  状态层：全局状态
│   (ChamberlainClient, useScenes, etc.)     │
├─────────────────────────────────────────────┤
│        Umi Request / Axios                  │  请求层：HTTP 通信
├─────────────────────────────────────────────┤
│     Mock Layer (Dev) / Backend (Prod)      │  数据层
└─────────────────────────────────────────────┘
```

### 数据流向

```
用户操作 → 页面事件处理
         ↓
    调用 Component 方法
         ↓
    使用 useXxx Hook 获取数据/调用 API
         ↓
    通过 ChamberlainClient 发送请求
         ↓
    Umi Request (axios) 拦截并处理
         ↓
    开发环境：Mock Data 响应
    生产环境：真实 Backend 响应
         ↓
    返回数据到组件
         ↓
    更新 UI
```

### 状态管理

**ChamberlainProvider 提供全局配置：**
```typescript
<ChamberlainProvider endpoint="/api">
  {children}
</ChamberlainProvider>
```

**组件通过 Context 获取：**
```typescript
const { client } = useChamberlain();
const { scenes, loading, refreshScenes } = useScenes();
const { configs } = useConfigs(sceneId);
```

**本地状态管理：**
- 使用 React `useState` 管理 UI 状态（Modal 显示/隐藏、当前编辑项等）
- 使用 `tableKey` 机制手动触发表格刷新

---

## 🎭 Mock 数据层设计

### 设计原则

1. **与真实 API 一致**：Mock API 遵循 Protocol 定义
2. **完整的 CRUD**：支持所有增删改查操作
3. **数据持久化**：在内存中维护状态（刷新页面会重置）
4. **真实体验**：模拟网络延迟、错误响应
5. **独立开发**：前端可以完全脱离后端开发

### Mock API 结构

#### Capabilities API (`capabilities.ts`)

```typescript
'GET /api/capabilities': {
  success: true,
  data: {
    'scenes.search': true,    // 场景支持搜索
    'scenes.sort': true,      // 场景支持排序
    'configs.search': true,   // 配置支持搜索
    'configs.sort': true,     // 配置支持排序
    'configs.filter': true,   // 配置支持筛选
  },
}
```

#### Scenes API (`scenes.ts`)

实现完整的场景管理功能：

```typescript
'GET /api/scenes'                          // 列表（分页、搜索、排序）
'GET /api/scenes/:id'                      // 详情
'POST /api/scenes'                         // 创建
'PATCH /api/scenes/:id'                    // 更新
'DELETE /api/scenes/:id'                   // 删除
'POST /api/scenes/:id/schemes:validate'    // 验证 Schema
'POST /api/scenes/:id/schemes'             // 更新 Schema
'PATCH /api/scenes/:id/schemes/:version'   // 更新 Schema 状态
'POST /api/scenes/:id/conditions'          // 添加条件
```

**特点：**
- 数据存储在内存数组中
- 支持搜索（id、name）
- 支持多字段排序
- 支持分页
- 验证 ID 格式（小写字母、数字、下划线）
- 检查 ID 重复
- 模拟 300ms 网络延迟

#### Configs API (`configs.ts`)

实现完整的配置管理功能：

```typescript
'GET /api/configs'          // 列表（支持 sceneId 筛选）
'GET /api/configs/:id'      // 详情
'POST /api/configs'         // 创建
'PUT /api/configs/:id'      // 更新
'DELETE /api/configs/:id'   // 删除
'POST /api/configs/:id:copy' // 复制配置
```

**特点：**
- 根据 sceneId 筛选配置
- 自动生成 config ID
- 支持条件匹配
- 验证配置数据符合 Schema（简化版）
- 复制配置到新条件

### 示例数据 (`data/`)

#### sample-scenes.json

```json
[
  {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    "description": "各环境的 MySQL 数据库连接配置",
    "availableConditions": [
      { "key": "env", "name": "环境", "type": "string", "values": ["dev", "test", "prod"] }
    ],
    "currentScheme": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "host": { "type": "string", "title": "主机地址" },
        "port": { "type": "integer", "title": "端口号", "minimum": 1, "maximum": 65535 },
        "username": { "type": "string", "title": "用户名" },
        "password": { "type": "string", "title": "密码" },
        "database": { "type": "string", "title": "数据库名" }
      },
      "required": ["host", "port", "database"]
    },
    "currentSchemeVersion": 1
  }
]
```

#### sample-configs.json

```json
[
  {
    "id": "mysql_database_config:default",
    "sceneId": "mysql_database_config",
    "schemeVersion": 1,
    "conditionList": [],
    "config": {
      "host": "localhost",
      "port": 3306,
      "username": "root",
      "password": "root123",
      "database": "chamberlain_dev"
    }
  }
]
```

---

## 🔗 组件集成方式

### 1. 全局 Provider 注入

在 `app.tsx` 中使用 `rootContainer` 包装：

```typescript
export function rootContainer(container: React.ReactNode) {
  return (
    <ChamberlainProvider endpoint="/api">
      {container}
    </ChamberlainProvider>
  );
}
```

### 2. 页面中使用组件

**场景管理页面示例：**

```typescript
import {
  SceneTable,
  SceneForm,
  SceneDescriptions,
} from '@chamberlain/react-components';

export default function ScenesPage() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { client } = useChamberlain();
  
  const handleCreate = async (values: CreateSceneRequest) => {
    await client.createScene(values);
    message.success('创建成功');
    setCreateModalVisible(false);
  };
  
  return (
    <PageContainer>
      <SceneTable
        actions={{
          onView: (scene) => { /* ... */ },
          onEdit: (scene) => { /* ... */ },
          onDelete: (scene) => { /* ... */ },
          onCreate: () => setCreateModalVisible(true),
        }}
      />
      
      <Modal open={createModalVisible}>
        <SceneForm onSubmit={handleCreate} />
      </Modal>
    </PageContainer>
  );
}
```

### 3. 组件通信

**父 → 子：**通过 Props 传递数据和回调

```typescript
<SceneForm
  initialValues={currentScene}    // 传递初始值
  onSubmit={handleEdit}           // 提交回调
  onCancel={() => setVisible(false)} // 取消回调
/>
```

**子 → 父：**通过回调函数

```typescript
actions={{
  onView: (scene) => {
    setCurrentScene(scene);
    setViewModalVisible(true);
  },
}}
```

**跨组件：**通过 Context

```typescript
const { client } = useChamberlain();
const { scenes, loading } = useScenes();
```

---

## 🎛️ 配置管理

### Umi 配置 (`.umirc.ts`)

```typescript
export default defineConfig({
  antd: {},              // 启用 Ant Design
  access: {},            // 权限控制（未使用）
  model: {},             // 数据流（未使用）
  initialState: {},      // 初始化数据
  request: {},           // 请求配置
  
  layout: {
    title: 'Chamberlain',
    locale: false,       // 禁用国际化
  },
  
  routes: [ /* ... */ ], // 路由配置
  
  npmClient: 'pnpm',     // 包管理器
  
  mock: {
    exclude: [],         // 启用所有 Mock 文件
  },
  
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
});
```

### 环境切换

**开发环境（Mock 数据）：**
```bash
pnpm dev
# Mock 数据自动生效，无需后端
```

**连接后端：**
```bash
# 1. 先启动后端（端口 8080）
# 2. 再启动前端
pnpm dev
# 前端会通过 proxy 转发 /api/* 到后端
```

---

## 🚀 启动流程

### 启动顺序

```
1. Umi 启动
   ↓
2. 加载 .umirc.ts 配置
   ↓
3. 执行 app.tsx 中的配置
   - getInitialState()
   - rootContainer() → 注入 ChamberlainProvider
   ↓
4. 加载 Mock 数据（开发环境）
   ↓
5. 渲染布局 (ProLayout)
   ↓
6. 根据路由加载页面组件
   ↓
7. 页面组件调用 Hooks 获取数据
   ↓
8. 渲染完成
```

### 初始化流程

```typescript
// app.tsx
export async function getInitialState() {
  // 可以在这里加载用户信息、权限等
  return { name: 'Chamberlain Demo' };
}

export function rootContainer(container) {
  // 包装全局 Provider
  return (
    <ChamberlainProvider endpoint="/api">
      {container}
    </ChamberlainProvider>
  );
}
```

---

## 🎯 核心功能实现

### 1. 动态表单生成

**ConfigForm 的核心逻辑：**

```typescript
// 根据 JSON Schema 生成表单
function SchemaBasedField({ name, schema }) {
  // string 类型
  if (schema.type === 'string') {
    if (schema.enum) {
      return <ProFormSelect options={schema.enum} />;
    }
    return <ProFormText />;
  }
  
  // number/integer 类型
  if (schema.type === 'number' || schema.type === 'integer') {
    return <ProFormDigit min={schema.minimum} max={schema.maximum} />;
  }
  
  // boolean 类型
  if (schema.type === 'boolean') {
    return <Switch />;
  }
  
  // array/object 类型
  if (schema.type === 'array' || schema.type === 'object') {
    return <ProFormTextArea placeholder="请输入 JSON 格式" />;
  }
  
  return <ProFormText />;
}
```

### 2. 条件筛选

**ConfigTable 根据条件筛选：**

```typescript
// 过滤配置
const filteredConfigs = configs.filter((config) => {
  if (!conditionFilters) return true;
  
  return config.conditionList.every((cond) =>
    conditionFilters[cond.key] === cond.value
  );
});
```

### 3. 表格刷新机制

使用 `tableKey` 强制刷新：

```typescript
const [tableKey, setTableKey] = useState(0);

const handleCreate = async (values) => {
  await client.createScene(values);
  setTableKey(prev => prev + 1); // 触发刷新
};

return <SceneTable key={tableKey} />;
```

### 4. Schema 验证

**在提交前验证配置数据：**

```typescript
try {
  const validator = new SchemaValidator();
  const result = validator.validate(config, schema);
  
  if (!result.valid) {
    message.error('配置数据不符合 Schema 定义');
    return;
  }
  
  await client.createConfig(config);
} catch (error) {
  message.error('验证失败');
}
```

---

## 📊 性能优化

### 1. 组件懒加载

```typescript
const SceneForm = lazy(() => import('./components/SceneForm'));
```

### 2. 虚拟滚动

对于大数据量表格，使用 ProTable 的虚拟滚动：

```typescript
<ProTable
  scroll={{ y: 600 }}
  virtual
/>
```

### 3. 请求防抖

搜索框使用 debounce：

```typescript
const debouncedSearch = useMemo(
  () => debounce((value) => setSearchText(value), 300),
  []
);
```

---

## 🎨 样式定制

### Ant Design 主题

在 `.umirc.ts` 中配置：

```typescript
antd: {
  theme: {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 4,
    },
  },
},
```

### 自定义样式

使用 CSS Modules 或 styled-components：

```typescript
import styles from './index.less';

<div className={styles.container}>
  ...
</div>
```

---

## 🔐 权限控制

### Capabilities 动态控制

根据后端返回的能力动态调整 UI：

```typescript
const { hasCapability } = useCapabilities();

// 有搜索能力才显示搜索框
{hasCapability('scenes.search') && <SearchBar />}

// 有排序能力才允许排序
sorter: hasCapability('scenes.sort')
```

---

## 🧪 测试策略

### 单元测试

测试单个组件的功能：

```typescript
describe('SceneForm', () => {
  it('should submit valid data', async () => {
    const onSubmit = jest.fn();
    render(<SceneForm onSubmit={onSubmit} />);
    
    // 填写表单
    // ...
    
    // 提交
    fireEvent.click(screen.getByText('提交'));
    
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

### 集成测试

测试页面级别的功能：

```typescript
describe('ScenesPage', () => {
  it('should create scene successfully', async () => {
    render(<ScenesPage />);
    
    // 点击创建按钮
    fireEvent.click(screen.getByText('创建'));
    
    // 填写表单并提交
    // ...
    
    // 验证列表更新
    expect(screen.getByText('新场景')).toBeInTheDocument();
  });
});
```

---

## 📝 最佳实践

### 1. 组件设计

- ✅ **单一职责**：每个组件只负责一个功能
- ✅ **Props 类型定义**：使用 TypeScript 严格定义
- ✅ **受控组件**：表单使用受控模式
- ✅ **错误边界**：关键组件添加错误处理

### 2. 状态管理

- ✅ **最小化状态**：只保留必要的状态
- ✅ **状态提升**：共享状态提升到父组件
- ✅ **避免冗余**：不重复存储可计算的数据

### 3. API 调用

- ✅ **统一封装**：使用 ChamberlainClient
- ✅ **错误处理**：捕获并显示友好提示
- ✅ **Loading 状态**：显示加载动画
- ✅ **请求取消**：组件卸载时取消请求

### 4. 代码规范

- ✅ **ESLint + Prettier**：统一代码风格
- ✅ **TypeScript**：类型安全
- ✅ **注释**：关键逻辑添加注释
- ✅ **命名规范**：清晰的变量和函数命名

---

## 🎓 学习资源

### 技术文档

- [Umi.js 官方文档](https://umijs.org/)
- [Ant Design Pro 文档](https://pro.ant.design/)
- [Ant Design 组件库](https://ant.design/)
- [React 官方文档](https://react.dev/)

### 项目参考

- `packages/react-components/` - 组件库源码
- `packages/protocol/` - 协议定义
- `docs/component-api.md` - 组件 API 文档

---

## 🚧 未来规划

### 短期（v0.2.0）

- [ ] 添加配置版本管理页面
- [ ] 添加配置对比功能
- [ ] 添加配置导入/导出
- [ ] 优化移动端适配

### 中期（v0.3.0）

- [ ] 添加配置审批流程
- [ ] 添加配置生效时间设置
- [ ] 添加配置灰度发布
- [ ] 添加操作日志

### 长期（v1.0.0）

- [ ] 多租户支持
- [ ] 权限管理系统
- [ ] 配置监控和告警
- [ ] 配置回滚功能

---

## 📞 FAQ

### Q: 为什么使用 Umi.js 而不是 Create React App？

A: Umi.js 提供了更完整的企业级开发解决方案：
- 内置 Mock 数据支持
- 路由配置更简单
- Ant Design Pro 集成更好
- 构建和优化更强大

### Q: Mock 数据会持久化吗？

A: 不会。Mock 数据存储在内存中，刷新页面会重置。要持久化需要连接真实后端。

### Q: 如何添加新页面？

A: 
1. 在 `src/pages/` 创建新目录和组件
2. 在 `.umirc.ts` 的 `routes` 中添加路由
3. Umi 会自动注册和加载

### Q: 如何自定义主题？

A: 在 `.umirc.ts` 中配置 `antd.theme`，参考 Ant Design 的主题定制文档。

---

**这就是 Chamberlain Demo App 的完整设计！** 🎉

一个精心设计的、生产就绪的、易于扩展的配置管理应用示例。


