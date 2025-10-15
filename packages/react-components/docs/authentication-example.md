# 鉴权集成示例

本文档展示如何在 Chamberlain React Components 中集成各种鉴权方式。

## 目录

1. [Bearer Token 鉴权](#bearer-token-鉴权)
2. [API Key 鉴权](#api-key-鉴权)
3. [OAuth 2.0 鉴权](#oauth-20-鉴权)
4. [自定义鉴权头](#自定义鉴权头)
5. [条件鉴权](#条件鉴权)

## Bearer Token 鉴权

最常见的鉴权方式，使用 JWT Token。

### 简单示例

```tsx
import React from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

const requestInterceptor: RequestInterceptor = (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
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
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

export default App;
```

### 带 Token 刷新的完整示例

```tsx
import React from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

// Token 管理服务
class TokenService {
  private static TOKEN_KEY = 'authToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';
  private static EXPIRY_KEY = 'tokenExpiry';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getExpiry(): number | null {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    return expiry ? parseInt(expiry) : null;
  }

  static setToken(token: string, refreshToken: string, expiresIn: number) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
  }

  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static isTokenExpired(): boolean {
    const expiry = this.getExpiry();
    return !expiry || Date.now() >= expiry;
  }

  static async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('http://localhost:8080/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.setToken(data.token, data.refreshToken, data.expiresIn);
    return data.token;
  }

  static async getValidToken(): Promise<string> {
    let token = this.getToken();

    if (!token) {
      throw new Error('No token available');
    }

    // 如果 token 即将过期（小于 5 分钟），尝试刷新
    const expiry = this.getExpiry();
    if (expiry && expiry - Date.now() < 5 * 60 * 1000) {
      try {
        token = await this.refreshToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Token 刷新失败，清除所有 token 并跳转到登录页
        this.clearTokens();
        window.location.href = '/login';
        throw error;
      }
    }

    return token;
  }
}

// 请求拦截器
const requestInterceptor: RequestInterceptor = async (config) => {
  try {
    const token = await TokenService.getValidToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Authentication error:', error);
    // 可以在这里处理认证失败的情况
  }
  return config;
};

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

export default App;
```

## API Key 鉴权

使用 API Key 进行鉴权。

```tsx
import React from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

const requestInterceptor: RequestInterceptor = (config) => {
  // 从环境变量或配置中获取 API Key
  const apiKey = import.meta.env.VITE_API_KEY || process.env.REACT_APP_API_KEY;
  
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  
  return config;
};

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

export default App;
```

## OAuth 2.0 鉴权

集成 OAuth 2.0 认证流程。

```tsx
import React, { useCallback, useEffect, useState } from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

// OAuth 服务
class OAuthService {
  private static clientId = 'your-client-id';
  private static redirectUri = 'http://localhost:3000/callback';
  private static authEndpoint = 'https://oauth.example.com/authorize';
  private static tokenEndpoint = 'https://oauth.example.com/token';

  static startAuthFlow() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read write',
    });

    window.location.href = `${this.authEndpoint}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    localStorage.setItem('oauth_token', data.access_token);
    return data.access_token;
  }

  static getToken(): string | null {
    return localStorage.getItem('oauth_token');
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查 URL 中是否有授权码
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // 交换授权码获取 token
      OAuthService.exchangeCodeForToken(code)
        .then(() => {
          setIsAuthenticated(true);
          // 清除 URL 中的 code 参数
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          console.error('OAuth error:', error);
          OAuthService.startAuthFlow();
        });
    } else if (OAuthService.getToken()) {
      setIsAuthenticated(true);
    } else {
      // 开始 OAuth 流程
      OAuthService.startAuthFlow();
    }
  }, []);

  const requestInterceptor: RequestInterceptor = useCallback((config) => {
    const token = OAuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, []);

  if (!isAuthenticated) {
    return <div>正在认证...</div>;
  }

  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

export default App;
```

## 自定义鉴权头

添加多个自定义鉴权相关的请求头。

```tsx
import React from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

const requestInterceptor: RequestInterceptor = (config) => {
  // 添加多个自定义请求头
  config.headers['X-Tenant-ID'] = getCurrentTenantId();
  config.headers['X-User-ID'] = getCurrentUserId();
  config.headers['X-Session-ID'] = getSessionId();
  config.headers['X-Request-ID'] = generateRequestId();
  
  // 添加签名（如果需要）
  const signature = generateSignature(config);
  config.headers['X-Signature'] = signature;
  
  // 添加时间戳
  config.headers['X-Timestamp'] = Date.now().toString();
  
  // 添加 Authorization
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

// 辅助函数
function getCurrentTenantId(): string {
  return localStorage.getItem('tenantId') || 'default';
}

function getCurrentUserId(): string {
  return localStorage.getItem('userId') || 'anonymous';
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateSignature(config: any): string {
  // 实现你的签名逻辑
  const secret = 'your-secret-key';
  const data = `${config.method}:${config.url}:${config.headers['X-Timestamp']}`;
  // 这里简化处理，实际应使用 HMAC-SHA256 等算法
  return btoa(data + secret);
}

function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

export default App;
```

## 条件鉴权

根据不同条件使用不同的鉴权方式。

```tsx
import React from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

const requestInterceptor: RequestInterceptor = async (config) => {
  // 检查请求 URL，决定使用哪种鉴权方式
  const url = config.url || '';
  
  if (url.startsWith('/public/')) {
    // 公开 API，不需要鉴权
    return config;
  }
  
  if (url.startsWith('/admin/')) {
    // 管理员 API，使用管理员 token
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Admin ${adminToken}`;
      config.headers['X-Admin-Role'] = getAdminRole();
    }
  } else {
    // 普通用户 API，使用用户 token
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  
  // 添加共同的请求头
  config.headers['X-Client-Version'] = '1.0.0';
  config.headers['X-Platform'] = getPlatform();
  
  return config;
};

function getAdminRole(): string {
  return localStorage.getItem('adminRole') || 'viewer';
}

function getPlatform(): string {
  return navigator.platform || 'unknown';
}

function App() {
  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

export default App;
```

## 与认证 Context 集成

在实际应用中，通常会有一个认证 Context 来管理用户状态。

```tsx
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { ChamberlainProvider, type RequestInterceptor } from '@chamberlain/react-components';

// 认证 Context
interface AuthContextValue {
  user: any;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('authToken', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const getToken = async (): Promise<string> => {
    // 可以在这里实现 token 刷新逻辑
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 应用组件
function AppContent() {
  const { getToken } = useAuth();

  const requestInterceptor: RequestInterceptor = useCallback(
    async (config) => {
      try {
        const token = await getToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get token:', error);
      }
      return config;
    },
    [getToken]
  );

  return (
    <ChamberlainProvider
      endpoint="http://localhost:8080/api"
      requestInterceptor={requestInterceptor}
    >
      {/* 你的应用内容 */}
    </ChamberlainProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

## 调试技巧

在开发过程中，可以在请求拦截器中添加日志来调试：

```tsx
const requestInterceptor: RequestInterceptor = (config) => {
  // 开发环境下打印请求信息
  if (process.env.NODE_ENV === 'development') {
    console.log('Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      params: config.params,
    });
  }

  // 添加鉴权信息
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
```

## 错误处理

如果鉴权失败（如 token 过期），后端会返回 401 错误。你可以在应用层面处理这个错误：

```tsx
import { useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';

function App() {
  useEffect(() => {
    // 添加全局响应拦截器来处理 401 错误
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          message.error('认证失败，请重新登录');
          // 清除 token
          localStorage.removeItem('authToken');
          // 跳转到登录页
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // ... 其他代码
}
```

## 最佳实践

1. **安全存储**: 敏感信息（如 token）应该安全存储，避免使用 localStorage 存储敏感数据在生产环境中
2. **Token 刷新**: 实现自动 token 刷新机制，提升用户体验
3. **错误处理**: 统一处理认证错误，如 401、403 等
4. **日志记录**: 在开发环境记录请求日志，便于调试
5. **类型安全**: 使用 TypeScript 确保类型安全
6. **测试**: 编写单元测试和集成测试，确保鉴权逻辑正确

