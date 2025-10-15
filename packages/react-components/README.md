# @chamberlain/react-components

Chamberlain React 组件库，提供 Scene 和 Config 的完整 UI 组件。

## 安装

```bash
pnpm install @chamberlain/react-components
```

## 快速开始

```tsx
import { ChamberlainProvider, SceneTable, ConfigTable } from '@chamberlain/react-components';

function App() {
  return (
    <ChamberlainProvider endpoint="http://localhost:8080/api">
      <SceneTable />
      <ConfigTable />
    </ChamberlainProvider>
  );
}
```

## 组件

### Provider

`ChamberlainProvider` 是必需的顶层组件，提供全局配置和 API 客户端。

#### 基本用法

```tsx
<ChamberlainProvider
  endpoint="http://localhost:8080/api"
  timeout={30000}
  headers={{
    'X-Custom-Header': 'value'
  }}
>
  {/* 你的应用 */}
</ChamberlainProvider>
```

### Scene 组件

- `SceneTable` - Scene 列表表格
- `SceneForm` - Scene 创建/编辑表单
- `SceneDescriptions` - Scene 详情展示

### Config 组件

- `ConfigTable` - Config 列表表格
- `ConfigForm` - Config 创建/编辑表单
- `ConfigDescriptions` - Config 详情展示

## 自定义鉴权

Chamberlain 支持通过请求拦截器自定义鉴权逻辑。你可以在发送请求前动态修改请求头，注入 Token 或其他鉴权信息。

### 使用请求拦截器

```tsx
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

// 定义请求拦截器
const requestInterceptor: RequestInterceptor = async (config) => {
  // 从 localStorage、cookie 或其他地方获取 token
  const token = localStorage.getItem('authToken');
  
  if (token) {
    // 注入 Authorization 请求头
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用 */}
    </ChamberlainProvider>
  );
}
```

### 高级示例：动态获取 Token

```tsx
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

// 模拟从认证服务获取 token 的函数
async function getAuthToken(): Promise<string> {
  // 检查 token 是否过期
  const token = localStorage.getItem('authToken');
  const expiry = localStorage.getItem('tokenExpiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token;
  }
  
  // Token 过期，刷新 token
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('tokenExpiry', data.expiry);
  
  return data.token;
}

// 定义请求拦截器
const requestInterceptor: RequestInterceptor = async (config) => {
  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    // 可以选择跳转到登录页面
    window.location.href = '/login';
  }
  
  return config;
};

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用 */}
    </ChamberlainProvider>
  );
}
```

### 添加多个自定义请求头

```tsx
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

const requestInterceptor: RequestInterceptor = async (config) => {
  // 添加多个自定义请求头
  config.headers['X-Tenant-ID'] = getCurrentTenantId();
  config.headers['X-User-ID'] = getCurrentUserId();
  config.headers['X-Request-ID'] = generateRequestId();
  
  // 添加鉴权信息
  const token = await getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  
  return config;
};

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用 */}
    </ChamberlainProvider>
  );
}
```

### 与 React Hooks 结合使用

```tsx
import React, { useCallback, useMemo } from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';
import { useAuth } from './hooks/useAuth'; // 你的认证 hook

function AppWithAuth() {
  const { getToken, isAuthenticated } = useAuth();
  
  // 使用 useCallback 确保拦截器函数引用稳定
  const requestInterceptor: RequestInterceptor = useCallback(async (config) => {
    if (isAuthenticated) {
      const token = await getToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, [getToken, isAuthenticated]);
  
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用 */}
    </ChamberlainProvider>
  );
}
```

## API 参考

### ChamberlainProviderProps

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `endpoint` | `string` | 是 | - | API 端点 URL |
| `headers` | `Record<string, string>` | 否 | - | 静态请求头 |
| `timeout` | `number` | 否 | `30000` | 请求超时时间（毫秒） |
| `requestInterceptor` | `RequestInterceptor` | 否 | - | 请求拦截器函数 |
| `capabilities` | `Capabilities` | 否 | - | 自定义能力配置（不传则自动获取） |

### RequestInterceptor

```typescript
type RequestInterceptor = (
  config: InternalAxiosRequestConfig
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
```

请求拦截器函数，在每次 API 请求发送前调用：

- **参数**: `config` - Axios 请求配置对象，包含 `headers`、`url`、`method` 等属性
- **返回**: 修改后的请求配置对象（可以是同步或异步）

## Hooks

### useChamberlain

获取 Chamberlain Context 的 hook。

```tsx
import { useChamberlain } from '@chamberlain/react-components';

function MyComponent() {
  const { client, capabilities, loadingCapabilities } = useChamberlain();
  
  // 使用 client 调用 API
  const fetchScenes = async () => {
    const scenes = await client.listScenes();
    console.log(scenes);
  };
  
  return <div>...</div>;
}
```

### useScenes

Scene 相关的 hook。

```tsx
import { useScenes } from '@chamberlain/react-components';

function MyComponent() {
  const { scenes, loading, error, refresh } = useScenes();
  
  return <div>...</div>;
}
```

### useConfigs

Config 相关的 hook。

```tsx
import { useConfigs } from '@chamberlain/react-components';

function MyComponent() {
  const { configs, loading, error, refresh } = useConfigs({ sceneId: 'scene-1' });
  
  return <div>...</div>;
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 监听模式
pnpm dev
```

## License

MIT

