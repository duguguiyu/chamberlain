# API 协议更新 - Schema 直接返回 JSON 对象

## 📋 更新背景

根据 RESTful API 最佳实践，后端应该直接返回 JSON 对象，而不是 JSON 字符串。这样可以：
1. 简化前端解析逻辑
2. 提高 API 的可读性和一致性
3. 让前端可以直接使用对象，无需额外的 `JSON.parse()`
4. 更符合 JSON API 规范

## ✅ 后端修改

### 1. SceneResponse DTO
**文件**: `examples/demo-backend/src/main/java/com/chamberlain/dto/response/SceneResponse.java`

**修改前**:
```java
@Schema(description = "当前激活的 JSON Schema")
private String currentScheme;
```

**修改后**:
```java
import com.fasterxml.jackson.databind.JsonNode;

@Schema(description = "当前激活的 JSON Schema（JSON 对象）")
private JsonNode currentScheme;
```

### 2. SceneService
**文件**: `examples/demo-backend/src/main/java/com/chamberlain/service/SceneService.java`

**修改前** (3 处):
```java
// getById
response.setCurrentScheme(schemeVersion.getSchemaJson().toString());

// list
response.setCurrentScheme(schemeVersion.getSchemaJson().toString());

// create
response.setCurrentScheme(schemeVersion.getSchemaJson().toString());
```

**修改后** (3 处):
```java
// getById
response.setCurrentScheme(schemeVersion.getSchemaJson());

// list
response.setCurrentScheme(schemeVersion.getSchemaJson());

// create
response.setCurrentScheme(schemeVersion.getSchemaJson());
```

**说明**: 直接设置 `JsonNode` 对象，Jackson 会自动将其序列化为 JSON 对象

## ✅ 前端修改

### 1. Protocol 类型定义
**文件**: `packages/protocol/src/types/scene.ts`

**修改前**:
```typescript
/** 当前 Schema 定义 (可能是 JSON 字符串或对象) */
currentScheme?: string | JSONSchema;
```

**修改后**:
```typescript
/** 当前 Schema 定义 (后端直接返回 JSON 对象) */
currentScheme?: JSONSchema;
```

### 2. Configs 页面
**文件**: `examples/demo-app/src/pages/Configs/index.tsx`

**修改前**:
```typescript
// 解析场景的 JSON Schema（后端返回的是字符串）
const getCurrentScheme = () => {
  if (!selectedScene?.currentScheme) {
    return undefined;
  }
  
  if (typeof selectedScene.currentScheme === 'string') {
    try {
      return JSON.parse(selectedScene.currentScheme);
    } catch (error) {
      console.error('解析 JSON Schema 失败:', error);
      return undefined;
    }
  }
  
  return selectedScene.currentScheme;
};
```

**修改后**:
```typescript
// 获取场景的 JSON Schema（后端直接返回 JSON 对象）
const getCurrentScheme = () => {
  return selectedScene?.currentScheme;
};
```

**说明**: 前端不再需要字符串解析，直接使用对象

## 📊 API 响应对比

### 修改前
```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    "currentSchemeVersion": 1,
    "currentScheme": "{\"type\":\"object\",\"properties\":{\"host\":{\"type\":\"string\"}}}"
  }
}
```
❌ `currentScheme` 是字符串，需要前端 `JSON.parse()`

### 修改后
```json
{
  "success": true,
  "data": {
    "id": "mysql_database_config",
    "name": "MySQL 数据库配置",
    "currentSchemeVersion": 1,
    "currentScheme": {
      "type": "object",
      "properties": {
        "host": {
          "type": "string",
          "title": "主机地址"
        },
        "port": {
          "type": "number",
          "title": "端口"
        }
      }
    }
  }
}
```
✅ `currentScheme` 是 JSON 对象，前端直接使用

## 🎯 优势

### 1. **简化前端代码**
- 移除了字符串解析逻辑
- 移除了错误处理（try-catch）
- 代码行数从 13 行减少到 3 行

### 2. **更符合 RESTful 规范**
- JSON API 应该返回 JSON 数据，而不是字符串化的 JSON
- 提高 API 的可读性和一致性

### 3. **更好的类型安全**
- TypeScript 类型定义更简单：`JSONSchema` 而不是 `string | JSONSchema`
- 前端不需要处理两种类型的兼容性

### 4. **更好的开发体验**
- 在浏览器 DevTools 中可以直接查看 Schema 结构
- 在 Swagger/OpenAPI 文档中显示更清晰
- 前端代码更简洁易读

## 🔧 技术细节

### Jackson 自动序列化

Java 中的 `JsonNode` 类型会被 Jackson 自动序列化为 JSON 对象：

```java
// Java 代码
private JsonNode currentScheme;

// 数据库中存储为 JSON
schemaJson: {"type": "object", "properties": {...}}

// Jackson 序列化后的 HTTP 响应
{
  "currentScheme": {
    "type": "object",
    "properties": {...}
  }
}
```

### TypeScript 类型推断

前端可以直接使用类型推断：

```typescript
// 类型: JSONSchema | undefined
const schema = selectedScene?.currentScheme;

// 直接使用，无需解析
if (schema) {
  console.log(schema.properties); // ✅ 类型安全
}
```

## 📦 编译和部署

### 后端
```bash
cd examples/demo-backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"
mvn clean compile -DskipTests
```

### 前端
```bash
# 编译 Protocol
cd packages/protocol
pnpm build

# 编译 React Components
cd ../react-components
pnpm build

# 清理缓存并启动前端
cd ../../examples/demo-app
rm -rf src/.umi .umi-production node_modules/.cache
PORT=8000 pnpm dev
```

## 🧪 测试验证

### 1. 启动后端
```bash
cd examples/demo-backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 2. 测试 API
```bash
# 获取场景详情
curl http://localhost:8080/api/scenes/mysql_database_config

# 检查 currentScheme 字段是否为 JSON 对象
```

### 3. 测试前端
```
1. 访问 http://localhost:8000
2. 进入"配置管理"页面
3. 选择场景
4. 点击"创建配置"
5. 验证表单正常渲染（使用 currentScheme）
```

## 📝 迁移指南

如果你的代码中有类似的字符串解析逻辑，可以按照以下步骤迁移：

### 步骤 1: 修改后端 DTO
```java
// 将 String 改为 JsonNode
private String jsonField;  // ❌
private JsonNode jsonField; // ✅
```

### 步骤 2: 修改后端 Service
```java
// 移除 .toString() 调用
response.setField(node.toString()); // ❌
response.setField(node);            // ✅
```

### 步骤 3: 修改前端类型
```typescript
// 移除 string 类型
field?: string | JSONSchema; // ❌
field?: JSONSchema;          // ✅
```

### 步骤 4: 简化前端代码
```typescript
// 移除字符串解析
if (typeof data === 'string') {  // ❌
  return JSON.parse(data);
}
return data; // ✅
```

## 🎉 总结

这次更新遵循了 **"后端直接返回 JSON 对象，让前端直接使用"** 的 API 设计原则，显著简化了前端代码，提高了代码质量和开发体验。

**关键改进**:
- 🔧 后端: 使用 `JsonNode` 而不是 `String`
- 🎨 前端: 移除字符串解析逻辑
- 📝 类型: 简化 TypeScript 类型定义
- 🚀 性能: 减少前端运行时的 JSON 解析开销

---

**更新时间**: 2025-10-14  
**影响范围**: Scene API (`currentScheme` 字段)  
**向后兼容**: 不兼容（需要前端同步更新）

