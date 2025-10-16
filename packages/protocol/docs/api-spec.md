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
Authorization: Bearer your_token_here

{
  "id": "redis_cache_config",
  "name": "Redis 缓存配置",
  "description": "Redis 缓存服务器连接配置",
  "schema": {
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
  "availableConditions": [
    {
      "key": "environment",
      "name": "环境",
      "type": "string",
      "values": ["dev", "test", "prod"]
    }
  ]
}
```

**请求体参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| id | string | 是 | 场景 ID（小写字母、数字、下划线，如：`redis_cache_config`） |
| name | string | 是 | 场景名称 |
| description | string | 否 | 场景描述 |
| schema | object | 是 | JSON Schema 定义（遵循 JSON Schema Draft 2020-12 规范） |
| availableConditions | array | 否 | 可用条件定义列表（推荐使用） |
| conditions | array | 否 | 条件列表（旧版格式，兼容但不推荐） |

> **注意**：
> - 创建者 (`createdBy`) 和更新者 (`updatedBy`) 由后端从认证 Token 中自动提取，**无需前端传递**
> - 创建时间 (`createdAt`) 和更新时间 (`updatedAt`) 由后端自动设置
> - 推荐使用 `availableConditions` 而非 `conditions`，前者支持更丰富的条件定义

**响应**

返回创建后的完整场景信息

```json
{
  "success": true,
  "data": {
    "id": "redis_cache_config",
    "name": "Redis 缓存配置",
    "description": "Redis 缓存服务器连接配置",
    "availableConditions": [
      {
        "key": "environment",
        "name": "环境",
        "type": "string",
        "values": ["dev", "test", "prod"]
      }
    ],
    "currentSchemeVersion": 1,
    "currentScheme": {
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
    "schemeList": [
      {
        "scheme": {...},
        "version": 1,
        "status": "active"
      }
    ],
    "conditionList": [
      { "key": "environment", "value": "环境" }
    ],
    "createdAt": "2025-10-15T16:00:00Z",
    "updatedAt": "2025-10-15T16:00:00Z",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

**错误码**

- `INVALID_SCENE_ID_FORMAT` - 场景 ID 格式不正确
- `SCENE_EXISTS` - 场景 ID 已存在
- `INVALID_SCHEME` - Schema 格式不正确
- `UNAUTHORIZED` - 未授权（缺少或无效的认证 Token）

### 2.3 获取场景详情

**请求**

```http
GET /api/scenes/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 场景 ID |

**响应**

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    "description": "MySQL 数据库连接配置",
    "availableConditions": [
      {
        "key": "environment",
        "name": "环境",
        "description": "部署环境",
        "type": "string",
        "values": ["dev", "test", "staging", "prod"]
      },
      {
        "key": "customer",
        "name": "客户",
        "type": "string"
      }
    ],
    "currentSchemeVersion": 1,
    "currentScheme": {
      "type": "object",
      "title": "MySQL 配置",
      "properties": {
        "host": {
          "type": "string",
          "title": "主机地址",
          "description": "MySQL 服务器地址",
          "default": "localhost"
        },
        "port": {
          "type": "integer",
          "title": "端口",
          "default": 3306
        },
        "database": {
          "type": "string",
          "title": "数据库名"
        },
        "username": {
          "type": "string",
          "title": "用户名"
        },
        "password": {
          "type": "string",
          "title": "密码",
          "format": "password"
        }
      },
      "required": ["host", "port", "database", "username", "password"]
    },
    "conditionConflictStrategy": "PRIORITY",
    "schemeList": [
      {
        "scheme": {...},
        "version": 1,
        "status": "active"
      }
    ],
    "conditionList": [
      { "key": "environment", "value": "环境" },
      { "key": "customer", "value": "客户" }
    ],
    "createdAt": "2025-09-30T10:00:00Z",
    "updatedAt": "2025-10-08T15:30:00Z",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

**字段说明**

| 字段 | 类型 | 必返回 | 说明 |
|-----|------|--------|------|
| id | string | 是 | 场景唯一标识 |
| name | string | 是 | 场景名称 |
| description | string | 否 | 场景描述 |
| availableConditions | array | 否 | 可用条件定义列表 |
| currentSchemeVersion | integer | 否 | 当前 Schema 版本号 |
| currentScheme | object/string | 否 | 当前 Schema 定义（JSON Schema 对象或字符串） |
| conditionConflictStrategy | string | 否 | 条件冲突策略：PRIORITY（优先级）、MERGE（合并）、ERROR（报错） |
| schemeList | array | 否 | Schema 版本列表 |
| conditionList | array | 否 | 条件列表（旧版格式，兼容） |
| createdAt | string | 是 | 创建时间（ISO 8601 格式） |
| updatedAt | string | 是 | 更新时间（ISO 8601 格式） |
| createdBy | string | 否 | 创建者（用户名或 ID） |
| updatedBy | string | 否 | 最后更新者（用户名或 ID） |

**AvailableCondition 字段说明**

| 字段 | 类型 | 必返回 | 说明 |
|-----|------|--------|------|
| key | string | 是 | 条件键（唯一标识） |
| name | string | 是 | 条件名称（展示用） |
| description | string | 否 | 条件描述 |
| type | string | 否 | 值类型：string、number、boolean |
| values | array | 否 | 预定义的可选值列表 |

**错误码**

- `SCENE_NOT_FOUND` - 场景不存在

### 2.4 更新场景元数据

更新场景的元数据信息（名称、描述等），不包括 Schema 和条件的修改。

**请求**

```http
PATCH /api/scenes/{id}
Content-Type: application/json

{
  "name": "MySQL 数据库配置（新）"
}
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 场景 ID |

**请求体参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | string | 否 | 场景名称 |

> **注意**：
> - 更新者 (`updatedBy`) 由后端从认证信息中自动提取
> - 更新时间 (`updatedAt`) 由后端自动设置

**响应**

返回更新后的完整场景信息（格式同 2.3 获取场景详情）

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置（新）",
    "description": "MySQL 数据库连接配置",
    "availableConditions": [...],
    "currentSchemeVersion": 1,
    "currentScheme": {...},
    "schemeList": [...],
    "conditionList": [...],
    "createdAt": "2025-09-30T10:00:00Z",
    "updatedAt": "2025-10-15T16:30:00Z",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

**错误码**

- `SCENE_NOT_FOUND` - 场景不存在
- `INVALID_PARAMETER` - 参数验证失败

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

### 2.8 删除场景

**请求**

```http
DELETE /api/scenes/{id}
Authorization: Bearer your_token_here
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 场景 ID |

**响应**

```json
{
  "success": true,
  "message": "场景已删除"
}
```

**错误码**

- `SCENE_NOT_FOUND` - 场景不存在
- `SCENE_HAS_CONFIGS` - 场景下存在配置，无法删除（需先删除所有配置）
- `UNAUTHORIZED` - 未授权
- `FORBIDDEN` - 无删除权限

### 2.9 添加条件

向场景添加新的可用条件。已有的条件不能删除或修改，只能添加新的。

**请求**

```http
POST /api/scenes/{id}/conditions
Content-Type: application/json
Authorization: Bearer your_token_here

{
  "key": "region",
  "value": "地区"
}
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 场景 ID |

**请求体参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| key | string | 是 | 条件键（唯一标识，小写字母和下划线） |
| value | string | 是 | 条件值描述（用于展示） |

> **注意**：
> - 添加条件后会更新场景的 `updatedAt` 和 `updatedBy` 字段
> - 不能删除或修改已有的条件，只能添加新的
> - 条件 key 必须唯一，不能重复

**响应**

返回更新后的完整场景信息

```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    "availableConditions": [
      {
        "key": "environment",
        "name": "环境",
        "type": "string",
        "values": ["dev", "test", "prod"]
      },
      {
        "key": "customer",
        "name": "客户",
        "type": "string"
      },
      {
        "key": "region",
        "name": "地区",
        "type": "string"
      }
    ],
    "conditionList": [
      { "key": "environment", "value": "环境" },
      { "key": "customer", "value": "客户" },
      { "key": "region", "value": "地区" }
    ],
    "currentSchemeVersion": 1,
    "currentScheme": {...},
    "createdAt": "2025-09-30T10:00:00Z",
    "updatedAt": "2025-10-15T16:45:00Z",
    "createdBy": "admin",
    "updatedBy": "admin"
  }
}
```

**错误码**

- `SCENE_NOT_FOUND` - 场景不存在
- `CONDITION_KEY_EXISTS` - 条件键已存在
- `INVALID_CONDITION_KEY` - 条件键格式不正确
- `UNAUTHORIZED` - 未授权

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
Authorization: Bearer your_token_here

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

**请求体参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| sceneId | string | 是 | 场景 ID |
| schemeVersion | integer | 是 | Schema 版本号（使用哪个版本的 Schema 验证） |
| conditions | array | 是 | 条件列表（每个条件包含 key 和 value） |
| config | object | 是 | 配置内容（必须符合 Schema 定义） |

> **注意**：
> - 创建者 (`createdBy`) 和更新者 (`updatedBy`) 由后端从认证信息中自动提取
> - 创建时间 (`createdAt`) 和更新时间 (`updatedAt`) 由后端自动设置
> - 配置内容会根据指定的 `schemeVersion` 进行 JSON Schema 验证
> - 相同条件组合的配置在同一场景下必须唯一

**响应**

返回创建后的完整配置信息

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
    "config": {
      "host": "localhost",
      "port": 3306,
      "database": "dev_db",
      "username": "dev_user",
      "password": "dev123"
    },
    "createdAt": "2025-10-15T16:00:00Z",
    "updatedAt": "2025-10-15T16:00:00Z",
    "createdBy": "john.doe",
    "updatedBy": "john.doe"
  }
}
```

**错误码**

- `CONFIG_EXISTS` - 相同条件的配置已存在
- `CONFIG_VALIDATION_FAILED` - 配置内容验证失败（不符合 Schema）
- `SCENE_NOT_FOUND` - 场景不存在
- `SCHEME_VERSION_NOT_FOUND` - Schema 版本不存在
- `INVALID_CONDITION` - 条件不在场景的可用条件列表中
- `UNAUTHORIZED` - 未授权

### 3.3 获取配置详情

**请求**

```http
GET /api/configs/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 配置 ID |

**响应**

```json
{
  "success": true,
  "data": {
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
      "password": "prod_password_encrypted"
    },
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-08T15:30:00Z",
    "createdBy": "admin",
    "updatedBy": "john.doe"
  }
}
```

**字段说明**

| 字段 | 类型 | 必返回 | 说明 |
|-----|------|--------|------|
| id | string | 是 | 配置唯一标识 |
| sceneId | string | 是 | 所属场景 ID |
| schemeVersion | integer | 是 | 使用的 Schema 版本号 |
| conditionList | array | 是 | 条件列表 |
| config | object | 是 | 配置内容（符合 Schema 定义） |
| createdAt | string | 是 | 创建时间 |
| updatedAt | string | 是 | 更新时间 |
| createdBy | string | 否 | 创建者 |
| updatedBy | string | 否 | 最后更新者 |

**错误码**

- `CONFIG_NOT_FOUND` - 配置不存在

### 3.4 更新配置

**请求**

```http
PUT /api/configs/{id}
Content-Type: application/json
Authorization: Bearer your_token_here

{
  "config": {
    "host": "new-host.example.com",
    "port": 3306,
    "database": "myapp",
    "username": "app_user",
    "password": "new_password"
  }
}
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 配置 ID |

**请求体参数**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| schemeVersion | integer | 否 | 更新使用的 Schema 版本号 |
| conditions | array | 否 | 更新条件列表 |
| config | object | 是 | 配置内容（必须符合 Schema 定义） |

> **注意**：
> - 更新者 (`updatedBy`) 由后端从认证信息中自动提取
> - 更新时间 (`updatedAt`) 由后端自动设置
> - 如果修改了 `schemeVersion` 或 `conditions`，配置的 ID 可能会改变
> - 配置内容会根据指定的 Schema 版本进行验证

**响应**

返回更新后的完整配置信息

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
    "config": {
      "host": "new-host.example.com",
      "port": 3306,
      "database": "myapp",
      "username": "app_user",
      "password": "new_password"
    },
    "createdAt": "2025-10-15T16:00:00Z",
    "updatedAt": "2025-10-15T17:15:00Z",
    "createdBy": "john.doe",
    "updatedBy": "jane.smith"
  }
}
```

**错误码**

- `CONFIG_NOT_FOUND` - 配置不存在
- `CONFIG_VALIDATION_FAILED` - 配置内容验证失败
- `CONFIG_EXISTS` - 修改条件后与已有配置冲突
- `SCHEME_VERSION_NOT_FOUND` - Schema 版本不存在
- `UNAUTHORIZED` - 未授权

### 3.5 删除配置

**请求**

```http
DELETE /api/configs/{id}
Authorization: Bearer your_token_here
```

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 配置 ID |

**响应**

```json
{
  "success": true,
  "message": "配置已删除"
}
```

**错误码**

- `CONFIG_NOT_FOUND` - 配置不存在
- `UNAUTHORIZED` - 未授权
- `FORBIDDEN` - 无删除权限

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


