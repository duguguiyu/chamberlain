# 组件 API 文档

本文档详细介绍 Chamberlain React 组件库的所有组件和 API。

## ChamberlainProvider

全局配置 Provider，必须包裹在应用根组件外层。

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| endpoint | string | 是 | - | API 端点地址 |
| headers | object | 否 | - | 静态请求头（固定不变的请求头） |
| timeout | number | 否 | 30000 | 请求超时时间（毫秒） |
| requestInterceptor | RequestInterceptor | 否 | - | 请求拦截器，用于动态修改请求配置（如注入鉴权信息） |
| capabilities | Capabilities | 否 | - | 自定义 capabilities（不传则自动获取） |
| children | ReactNode | 是 | - | 子组件 |

### 基本示例

```tsx
<ChamberlainProvider 
  endpoint="http://localhost:8080/api"
  headers={{ 'X-Custom-Header': 'value' }}
>
  <App />
</ChamberlainProvider>
```

### 鉴权配置

使用 `requestInterceptor` 可以在每次请求前动态修改请求头，常用于注入鉴权信息：

```tsx
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

const requestInterceptor: RequestInterceptor = async (config) => {
  // 从 localStorage 或其他地方获取 token
  const token = localStorage.getItem('authToken');
  
  // 注入到请求头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 也可以添加其他自定义头
  config.headers['X-Request-ID'] = generateRequestId();
  
  return config;
};

<ChamberlainProvider 
  endpoint="http://localhost:8080/api"
  requestInterceptor={requestInterceptor}
>
  <App />
</ChamberlainProvider>
```

**RequestInterceptor 类型：**

```typescript
type RequestInterceptor = (
  config: InternalAxiosRequestConfig
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
```

**常见鉴权场景：**

1. **Bearer Token 鉴权**
```tsx
const requestInterceptor: RequestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
```

2. **API Key 鉴权**
```tsx
const requestInterceptor: RequestInterceptor = (config) => {
  config.headers['X-API-Key'] = process.env.REACT_APP_API_KEY;
  return config;
};
```

3. **动态 Token 刷新**
```tsx
const requestInterceptor: RequestInterceptor = async (config) => {
  // 检查 token 是否过期
  const token = await getValidToken(); // 自动刷新过期 token
  config.headers.Authorization = `Bearer ${token}`;
  return config;
};
```

4. **多租户场景**
```tsx
const requestInterceptor: RequestInterceptor = (config) => {
  config.headers['X-Tenant-ID'] = getCurrentTenantId();
  config.headers['X-User-ID'] = getCurrentUserId();
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
};
```

更多鉴权集成示例，请参考：[React Components 鉴权文档](../packages/react-components/docs/authentication-example.md)

---

## SceneTable

场景列表表格组件，支持分页、搜索、排序等功能。

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| columns | ProColumns<Scene>[] | 否 | - | 自定义列配置 |
| actions | object | 否 | - | 行操作回调函数 |
| searchable | boolean | 否 | true | 是否显示搜索 |
| showActions | boolean | 否 | true | 是否显示操作列 |
| showCreateButton | boolean | 否 | true | 是否显示创建按钮 |

### actions 对象

| 属性 | 类型 | 说明 |
|-----|------|------|
| onView | (scene: Scene) => void | 查看场景详情 |
| onEdit | (scene: Scene) => void | 编辑场景 |
| onDelete | (scene: Scene) => Promise<void> | 删除场景 |
| onCreate | () => void | 创建场景 |
| onViewConfigs | (scene: Scene) => void | 查看场景配置 |

### 示例

```tsx
<SceneTable
  searchable={true}
  actions={{
    onView: (scene) => navigate(`/scenes/${scene.id}`),
    onCreate: () => setCreateModalVisible(true),
    onDelete: async (scene) => {
      await deleteScene(scene.id);
    },
  }}
/>
```

---

## ConfigForm

基于 JSON Schema 动态生成的配置表单组件。

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| schema | JSONSchema | 是 | - | JSON Schema 定义 |
| initialValues | object | 否 | - | 初始值（编辑模式） |
| onSubmit | (values: object) => Promise<void> | 是 | - | 提交回调 |
| onCancel | () => void | 否 | - | 取消回调 |
| readonly | boolean | 否 | false | 是否只读 |

### 支持的字段类型

| JSON Schema 类型 | 渲染组件 |
|-----------------|---------|
| string | Input / Select（如果有 enum） / TextArea（如果 format=textarea） |
| number / integer | InputNumber |
| boolean | Switch |
| array | TextArea（JSON 格式） |
| object | TextArea（JSON 格式） |

### 示例

```tsx
const schema = {
  type: 'object',
  properties: {
    host: {
      type: 'string',
      title: '主机地址',
      default: 'localhost',
    },
    port: {
      type: 'integer',
      title: '端口',
      default: 3306,
      minimum: 1,
      maximum: 65535,
    },
    ssl: {
      type: 'boolean',
      title: '启用 SSL',
      default: false,
    },
  },
  required: ['host', 'port'],
};

<ConfigForm
  schema={schema}
  initialValues={{ host: 'localhost', port: 3306 }}
  onSubmit={async (values) => {
    await saveConfig(values);
  }}
/>
```

---

## Hooks

### useChamberlain

获取全局上下文。

```tsx
const { client, capabilities, loadingCapabilities } = useChamberlain();
```

**返回值：**

| 属性 | 类型 | 说明 |
|-----|------|------|
| client | ChamberlainClient | API 客户端实例 |
| capabilities | Capabilities \| null | 服务能力 |
| loadingCapabilities | boolean | 是否正在加载能力 |

---

### useCapabilities

获取服务能力。

```tsx
const { capabilities, loading, hasCapability } = useCapabilities();
```

**返回值：**

| 属性 | 类型 | 说明 |
|-----|------|------|
| capabilities | Capabilities \| null | 服务能力 |
| loading | boolean | 是否正在加载 |
| hasCapability | (cap: string) => boolean | 检查是否支持某个能力 |

**示例：**

```tsx
if (hasCapability('scenes.search')) {
  // 显示搜索框
}
```

---

### useScenes

场景管理操作。

```tsx
const {
  loading,
  error,
  fetchScenes,
  fetchScene,
  createScene,
  updateScene,
  deleteScene,
  validateScheme,
  updateScheme,
  addCondition,
} = useScenes();
```

**方法：**

| 方法 | 参数 | 返回值 | 说明 |
|-----|------|--------|------|
| fetchScenes | params?: SceneListParams | Promise<PageData<Scene>> | 获取场景列表 |
| fetchScene | id: string | Promise<Scene> | 获取场景详情 |
| createScene | request: CreateSceneRequest | Promise<Scene> | 创建场景 |
| updateScene | id: string, request: UpdateSceneRequest | Promise<Scene> | 更新场景 |
| deleteScene | id: string | Promise<void> | 删除场景 |
| validateScheme | id: string, request: ValidateSchemeRequest | Promise<ValidationResult> | 验证 Scheme |
| updateScheme | id: string, request: UpdateSchemeRequest | Promise<UpdateSchemeResponse> | 更新 Scheme |
| addCondition | id: string, request: AddConditionRequest | Promise<Scene> | 添加条件 |

**示例：**

```tsx
const { fetchScenes, createScene, loading, error } = useScenes();

// 获取列表
const loadScenes = async () => {
  const result = await fetchScenes({ page: 1, pageSize: 10 });
  console.log(result.list);
};

// 创建场景
const handleCreate = async () => {
  await createScene({
    id: 'my_config',
    name: '我的配置',
    scheme: { type: 'object', properties: {} },
  });
};
```

---

### useConfigs

配置管理操作。

```tsx
const {
  loading,
  error,
  fetchConfigs,
  fetchConfig,
  createConfig,
  updateConfig,
  deleteConfig,
  copyConfig,
} = useConfigs();
```

**方法：**

| 方法 | 参数 | 返回值 | 说明 |
|-----|------|--------|------|
| fetchConfigs | params: ConfigListParams | Promise<PageData<Config>> | 获取配置列表 |
| fetchConfig | id: string | Promise<Config> | 获取配置详情 |
| createConfig | request: CreateConfigRequest | Promise<Config> | 创建配置 |
| updateConfig | id: string, request: UpdateConfigRequest | Promise<Config> | 更新配置 |
| deleteConfig | id: string | Promise<void> | 删除配置 |
| copyConfig | id: string, request: CopyConfigRequest | Promise<Config> | 复制配置 |

---

## ChamberlainClient

底层 API 客户端，可以直接使用。

### 创建实例

```tsx
import { ChamberlainClient, type RequestInterceptor } from '@chamberlain/react-components';

const client = new ChamberlainClient({
  endpoint: 'http://localhost:8080/api',
  headers: { 'X-Custom-Header': 'value' },
  timeout: 30000,
});
```

### 配置选项

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| endpoint | string | 是 | - | API 端点地址 |
| headers | object | 否 | - | 静态请求头 |
| timeout | number | 否 | 30000 | 请求超时时间（毫秒） |
| requestInterceptor | RequestInterceptor | 否 | - | 请求拦截器 |

### 使用请求拦截器

```tsx
const requestInterceptor: RequestInterceptor = async (config) => {
  const token = await getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const client = new ChamberlainClient({
  endpoint: 'http://localhost:8080/api',
  requestInterceptor,
});
```

### 方法

所有方法与 Hooks 中的方法对应，但返回 Promise。

---

## 类型定义

所有类型定义都从 `@chamberlain/protocol` 导出：

```tsx
import type {
  Scene,
  Config,
  Condition,
  JSONSchema,
  Capabilities,
  PageData,
  ApiResponse,
} from '@chamberlain/protocol';
```

---

## 最佳实践

### 1. 错误处理

```tsx
const { createScene } = useScenes();

try {
  await createScene(request);
  message.success('创建成功');
} catch (error: any) {
  message.error(error.message || '创建失败');
}
```

### 2. 加载状态

```tsx
const { loading, fetchScenes } = useScenes();

return (
  <Spin spinning={loading}>
    <SceneTable />
  </Spin>
);
```

### 3. 自定义列

```tsx
const customColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    copyable: true,
  },
  {
    title: '名称',
    dataIndex: 'name',
    render: (text, record) => (
      <a onClick={() => navigate(`/scenes/${record.id}`)}>{text}</a>
    ),
  },
];

<SceneTable columns={customColumns} />
```

---

## 相关文档

- [快速开始](./getting-started.md)
- [协议规范](../packages/protocol/docs/api-spec.md)
- [开发指南](./development.md)


