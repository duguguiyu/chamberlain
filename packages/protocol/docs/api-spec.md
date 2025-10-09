# Chamberlain API 规范文档

版本：v0.1.0

## 概述

本文档定义了 Chamberlain 配置管理系统的完整 REST API 规范。

### 设计原则

1. **RESTful 风格**：使用标准 HTTP 方法和状态码
2. **JSON 数据格式**：所有请求和响应使用 JSON 格式
3. **能力声明**：服务通过 `/capabilities` 接口声明支持的功能
4. **统一响应格式**：所有响应遵循统一的数据结构
5. **向后兼容**：协议更新保持向后兼容

### 基础 URL

```
开发环境: http://localhost:8080/api
生产环境: https://api.chamberlain.example.com/api
```

---

## 1. 服务能力 (Capabilities)

### 1.1 获取服务能力

**请求**

```http
GET /api/capabilities
```

**响应**

```json
{
  "success": true,
  "data": {
    "scenes.search": true,
    "scenes.sort": true,
    "configs.search": true,
    "configs.sort": true,
    "configs.filter": true
  }
}
```

**能力说明**

| 能力 | 说明 |
|-----|-----|
| `scenes.search` | 是否支持场景搜索 |
| `scenes.sort` | 是否支持场景排序 |
| `configs.search` | 是否支持配置搜索 |
| `configs.sort` | 是否支持配置排序 |
| `configs.filter` | 是否支持配置筛选 |

---

## 2. 场景管理 (Scenes)

### 2.1 获取场景列表

**请求**

```http
GET /api/scenes?page=1&pageSize=10&q=mysql&sort=createdAt:desc
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | integer | 否 | 页码（默认 1） |
| pageSize | integer | 否 | 每页大小（默认 10） |
| q | string | 否 | 搜索关键字（需要 `scenes.search` 能力） |
| sort | string | 否 | 排序规则（需要 `scenes.sort` 能力） |

**排序格式**

```
sort=field:order,field:order
```

示例：
- `sort=createdAt:desc` - 按创建时间降序
- `sort=name:asc,createdAt:desc` - 按名称升序，创建时间降序

**响应**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "mysql_database_config",
        "name": "MySQL 数据库配置",
        "schemeList": [
          {
            "scheme": { "type": "object", "properties": {...} },
            "version": 1,
            "status": "active"
          }
        ],
        "conditionList": [
          { "key": "environment", "value": "环境" },
          { "key": "customer", "value": "客户" }
        ],
        "createdAt": "2025-10-01T10:00:00Z",
        "updatedAt": "2025-10-08T15:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2.2 创建场景

**请求**

```http
POST /api/scenes
Content-Type: application/json

{
  "id": "redis_cache_config",
  "name": "Redis 缓存配置",
  "scheme": {
    "type": "object",
    "title": "Redis 配置",
    "properties": {
      "host": {
        "type": "string",
        "title": "主机地址",
        "default": "localhost"
      },
      "port": {
        "type": "integer",
        "title": "端口",
        "default": 6379
      }
    },
    "required": ["host", "port"]
  },
  "conditions": [
    { "key": "environment", "value": "环境" }
  ]
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| id | string | 是 | 场景 ID（小写字母、数字、下划线） |
| name | string | 是 | 场景名称 |
| scheme | object | 是 | JSON Schema 定义 |
| conditions | array | 否 | 条件列表 |

**响应**

```json
{
  "success": true,
  "data": {
    "id": "redis_cache_config",
    "name": "Redis 缓存配置",
    "schemeList": [
      {
        "scheme": {...},
        "version": 1,
        "status": "active"
      }
    ],
    "conditionList": [...],
    "createdAt": "2025-10-08T16:00:00Z",
    "updatedAt": "2025-10-08T16:00:00Z"
  }
}
```

**错误码**

- `INVALID_SCENE_ID_FORMAT` - 场景 ID 格式不正确
- `SCENE_EXISTS` - 场景 ID 已存在
- `INVALID_SCHEME` - Schema 格式不正确

### 2.3 获取场景详情

**请求**

```http
GET /api/scenes/{id}
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    ...
  }
}
```

### 2.4 更新场景

**请求**

```http
PATCH /api/scenes/{id}
Content-Type: application/json

{
  "name": "MySQL 数据库配置（新）"
}
```

**响应**

```json
{
  "success": true,
  "data": {...}
}
```

### 2.5 验证新版本 Scheme

在更新 Scheme 之前，可以先验证兼容性。

**请求**

```http
POST /api/scenes/{id}/schemes:validate
Content-Type: application/json

{
  "scheme": {
    "type": "object",
    "properties": {
      "host": { "type": "string" },
      "port": { "type": "integer" },
      "newField": { "type": "string" }
    }
  }
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "warnings": [
      "字段 \"database\" 已被删除",
      "字段 \"newField\" 被设置为必填"
    ]
  }
}
```

### 2.6 更新 Scheme

**请求**

```http
POST /api/scenes/{id}/schemes
Content-Type: application/json

{
  "scheme": {...},
  "overwrite": false
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| scheme | object | 是 | 新的 JSON Schema |
| overwrite | boolean | 否 | 是否强制覆盖（跳过兼容性检查） |

**响应**

```json
{
  "success": true,
  "data": {
    "version": 2
  }
}
```

### 2.7 激活/停用 Scheme 版本

**请求**

```http
PATCH /api/scenes/{id}/schemes/{version}
Content-Type: application/json

{
  "status": "active"
}
```

**响应**

```json
{
  "success": true
}
```

### 2.8 添加条件

**请求**

```http
POST /api/scenes/{id}/conditions
Content-Type: application/json

{
  "key": "region",
  "value": "地区"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "conditionList": [
      { "key": "environment", "value": "环境" },
      { "key": "customer", "value": "客户" },
      { "key": "region", "value": "地区" }
    ],
    ...
  }
}
```

---

## 3. 配置管理 (Configs)

### 3.1 获取配置列表

**请求**

```http
GET /api/configs?sceneId=mysql_database_config&page=1&pageSize=10
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| sceneId | string | 是 | 场景 ID |
| schemeVersion | integer | 否 | Scheme 版本 |
| conditions | string | 否 | 条件筛选（格式：key1:value1,key2:value2） |
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页大小 |
| sort | string | 否 | 排序规则 |

**响应**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "mysql_database_config:environment:production",
        "sceneId": "mysql_database_config",
        "schemeVersion": 1,
        "conditionList": [
          { "key": "environment", "value": "production" }
        ],
        "config": {
          "host": "prod-db.example.com",
          "port": 3306,
          "database": "myapp",
          "username": "app_user",
          "password": "********"
        },
        "createdAt": "2025-10-01T10:00:00Z",
        "updatedAt": "2025-10-08T15:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
}
```

### 3.2 创建配置

**请求**

```http
POST /api/configs
Content-Type: application/json

{
  "sceneId": "mysql_database_config",
  "schemeVersion": 1,
  "conditions": [
    { "key": "environment", "value": "development" }
  ],
  "config": {
    "host": "localhost",
    "port": 3306,
    "database": "dev_db",
    "username": "dev_user",
    "password": "dev123"
  }
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config:environment:development",
    "sceneId": "mysql_database_config",
    "schemeVersion": 1,
    "conditionList": [
      { "key": "environment", "value": "development" }
    ],
    "config": {...},
    "createdAt": "2025-10-08T16:00:00Z",
    "updatedAt": "2025-10-08T16:00:00Z"
  }
}
```

**错误码**

- `CONFIG_EXISTS` - 相同条件的配置已存在
- `CONFIG_VALIDATION_FAILED` - 配置内容验证失败
- `SCENE_NOT_FOUND` - 场景不存在

### 3.3 获取配置详情

**请求**

```http
GET /api/configs/{id}
```

**响应**

```json
{
  "success": true,
  "data": {...}
}
```

### 3.4 更新配置

**请求**

```http
PUT /api/configs/{id}
Content-Type: application/json

{
  "config": {
    "host": "new-host.example.com",
    "port": 3306
  }
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| schemeVersion | integer | 否 | 更新 Scheme 版本 |
| conditions | array | 否 | 更新条件 |
| config | object | 是 | 配置内容 |

**响应**

```json
{
  "success": true,
  "data": {...}
}
```

### 3.5 删除配置

**请求**

```http
DELETE /api/configs/{id}
```

**响应**

```json
{
  "success": true
}
```

### 3.6 复制配置

将现有配置复制到新的条件组合。

**请求**

```http
POST /api/configs/{id}:copy
Content-Type: application/json

{
  "toConditions": [
    { "key": "environment", "value": "staging" },
    { "key": "customer", "value": "customer_a" }
  ]
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config:customer:customer_a,environment:staging",
    ...
  }
}
```

---

## 4. 错误处理

### 4.1 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "错误描述",
  "details": {
    "field": "具体错误详情"
  },
  "requestId": "abc123def456"
}
```

### 4.2 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

### 4.3 错误码列表

#### 通用错误（1xxx）

- `UNKNOWN_ERROR` - 未知错误
- `INVALID_PARAMETER` - 参数验证失败
- `UNAUTHORIZED` - 未授权
- `FORBIDDEN` - 禁止访问
- `NOT_FOUND` - 资源不存在

#### 场景相关错误（2xxx）

- `INVALID_SCENE_ID_FORMAT` - 场景 ID 格式不正确
- `SCENE_EXISTS` - 场景已存在
- `SCENE_NOT_FOUND` - 场景不存在
- `SCENE_HAS_CONFIGS` - 场景下存在配置，无法删除
- `INVALID_SCHEME` - Schema 格式不正确
- `SCHEME_VERSION_NOT_FOUND` - Scheme 版本不存在
- `SCHEME_NOT_COMPATIBLE` - Scheme 不兼容

#### 配置相关错误（3xxx）

- `CONFIG_NOT_FOUND` - 配置不存在
- `CONFIG_EXISTS` - 配置已存在
- `CONFIG_VALIDATION_FAILED` - 配置验证失败
- `CONFIG_CONFLICT` - 配置冲突
- `INVALID_CONFIG_DATA` - 配置数据不合法

---

## 5. 鉴权

协议本身不定义具体的鉴权方式，由实现者根据实际需求选择：

### 5.1 常见鉴权方式

**Bearer Token**

```http
GET /api/scenes
Authorization: Bearer your_token_here
```

**API Key**

```http
GET /api/scenes
X-API-Key: your_api_key_here
```

**Basic Auth**

```http
GET /api/scenes
Authorization: Basic base64(username:password)
```

### 5.2 鉴权错误

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "未授权访问",
  "requestId": "abc123"
}
```

---

## 6. 版本控制

API 版本通过 URL 路径控制：

```
/api/v1/scenes
/api/v2/scenes
```

当前版本为 v1（默认），可以省略版本号：

```
/api/scenes  (等同于 /api/v1/scenes)
```

---

## 7. 协议兼容性测试

为确保服务端实现符合协议规范，提供了兼容性测试脚本。

### 7.1 运行测试

```bash
cd packages/protocol
export TEST_ENDPOINT=http://localhost:8080/api
pnpm test:compat
```

### 7.2 测试覆盖

- ✅ Capabilities API
- ✅ Scene CRUD 操作
- ✅ Scheme 管理
- ✅ Config CRUD 操作
- ✅ 错误处理
- ✅ 参数验证

---

## 8. 示例场景

### 8.1 完整流程示例

```javascript
// 1. 获取服务能力
const capabilities = await fetch('/api/capabilities').then(r => r.json());

// 2. 创建场景
const scene = await fetch('/api/scenes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'app_config',
    name: '应用配置',
    scheme: {
      type: 'object',
      properties: {
        debug: { type: 'boolean', default: false },
        logLevel: { type: 'string', enum: ['debug', 'info', 'error'] }
      }
    },
    conditions: [
      { key: 'environment', value: '环境' }
    ]
  })
}).then(r => r.json());

// 3. 创建开发环境配置
const devConfig = await fetch('/api/configs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sceneId: 'app_config',
    schemeVersion: 1,
    conditions: [
      { key: 'environment', value: 'development' }
    ],
    config: {
      debug: true,
      logLevel: 'debug'
    }
  })
}).then(r => r.json());

// 4. 创建生产环境配置
const prodConfig = await fetch('/api/configs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sceneId: 'app_config',
    schemeVersion: 1,
    conditions: [
      { key: 'environment', value: 'production' }
    ],
    config: {
      debug: false,
      logLevel: 'error'
    }
  })
}).then(r => r.json());
```

---

## 附录

### A. JSON Schema 支持

Chamberlain 支持 **JSON Schema Draft 2020-12** 规范。

常用字段类型：

- `string` - 字符串
- `number` / `integer` - 数字/整数
- `boolean` - 布尔值
- `object` - 对象
- `array` - 数组
- `enum` - 枚举

常用约束：

- `required` - 必填字段
- `default` - 默认值
- `minimum` / `maximum` - 数值范围
- `minLength` / `maxLength` - 字符串长度
- `pattern` - 正则表达式
- `format` - 格式（email, url, date 等）

### B. 参考资源

- [JSON Schema 官方文档](https://json-schema.org/)
- [OpenAPI 规范](https://swagger.io/specification/)
- [REST API 最佳实践](https://restfulapi.net/)


