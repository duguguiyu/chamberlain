# Scene API 改进 - 返回当前 Scheme

## 📋 问题描述

之前的实现中，场景 API (`GET /api/scenes` 和 `GET /api/scenes/{id}`) 返回的数据中不包含当前激活的 JSON Schema，导致前端需要额外调用 `GET /api/scenes/{id}/schemes` 来获取 Schema。这增加了不必要的网络请求，降低了用户体验。

## ✅ 解决方案

在场景 API 响应中直接包含当前激活的 JSON Schema (`currentScheme`)。

## 🔧 后端修改

### 1. SceneResponse DTO 添加字段

**文件**: `examples/demo-backend/src/main/java/com/chamberlain/dto/response/SceneResponse.java`

```java
@Schema(description = "当前激活的 Scheme 版本")
private Integer currentSchemeVersion;

@Schema(description = "当前激活的 JSON Schema")
private String currentScheme;  // 新增字段
```

### 2. SceneService 填充 currentScheme

**文件**: `examples/demo-backend/src/main/java/com/chamberlain/service/SceneService.java`

#### getById 方法
```java
public SceneResponse getById(String id) {
    Scene scene = sceneRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("SCENE_NOT_FOUND", "场景不存在: " + id));
    SceneResponse response = sceneMapper.toResponse(scene);
    
    // 获取当前激活的 scheme
    if (scene.getCurrentSchemeVersion() != null) {
        schemeVersionRepository.findBySceneIdAndVersion(id, scene.getCurrentSchemeVersion())
            .ifPresent(schemeVersion -> response.setCurrentScheme(schemeVersion.getSchemaJson()));
    }
    
    return response;
}
```

#### list 方法
```java
public PageResult<SceneResponse> list(Integer page, Integer pageSize, String keyword, String sort) {
    // ... 查询逻辑 ...
    
    List<SceneResponse> responses = sceneMapper.toResponseList(scenePage.getContent());
    
    // 为每个场景填充当前激活的 scheme
    responses.forEach(response -> {
        if (response.getCurrentSchemeVersion() != null) {
            schemeVersionRepository.findBySceneIdAndVersion(
                response.getId(), 
                response.getCurrentSchemeVersion()
            ).ifPresent(schemeVersion -> response.setCurrentScheme(schemeVersion.getSchemaJson()));
        }
    });
    
    return PageResult.<SceneResponse>builder()
        .list(responses)
        .total(scenePage.getTotalElements())
        .page(page)
        .pageSize(pageSize)
        .build();
}
```

#### create 方法
```java
public SceneResponse create(CreateSceneRequest request) {
    // ... 创建场景和初始 Scheme 版本 ...
    
    SceneResponse response = sceneMapper.toResponse(scene);
    response.setCurrentScheme(schemeVersion.getSchemaJson());  // 直接设置
    return response;
}
```

## 🎨 前端修改

### 1. Protocol 类型定义更新

**文件**: `packages/protocol/src/types/scene.ts`

```typescript
export interface Scene {
  // ... 其他字段 ...
  
  /** 当前 Schema 版本号 */
  currentSchemeVersion?: number;
  
  /** 当前 Schema 定义 (可能是 JSON 字符串或对象) */
  currentScheme?: string | JSONSchema;
  
  // ... 其他字段 ...
}
```

### 2. Configs 页面简化

**文件**: `examples/demo-app/src/pages/Configs/index.tsx`

#### 移除了 `loadScheme` 函数和 `currentScheme` 状态
```typescript
// 移除
const [currentScheme, setCurrentScheme] = useState<any>(undefined);

// 移除
const loadScheme = async (sceneId: string) => { ... };
```

#### 添加了 `getCurrentScheme` 辅助函数
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

#### 更新所有使用 Schema 的地方
```typescript
// 创建配置抽屉
<ConfigForm
  schema={getCurrentScheme()}
  scene={selectedScene}
  // ...
/>

// 编辑配置抽屉
<ConfigForm
  schema={getCurrentScheme()}
  scene={selectedScene}
  // ...
/>

// 查看配置详情抽屉
<ConfigDescriptions
  config={currentConfig}
  schema={getCurrentScheme()}
  // ...
/>
```

## 📊 API 响应示例

### 修改前

**GET /api/scenes**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "mysql_database_config",
        "name": "MySQL 数据库配置",
        "currentSchemeVersion": 1
        // ❌ 没有 currentScheme 字段
      }
    ]
  }
}
```

前端需要额外调用：
```
GET /api/scenes/mysql_database_config/schemes
```

### 修改后

**GET /api/scenes**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "mysql_database_config",
        "name": "MySQL 数据库配置",
        "currentSchemeVersion": 1,
        "currentScheme": "{\"type\":\"object\",\"properties\":{...}}"
        // ✅ 直接包含 JSON Schema
      }
    ]
  }
}
```

前端无需额外请求！

## 🎯 优势

### 1. **减少网络请求**
- 从 2 次请求减少到 1 次
- 场景列表页加载更快
- 配置创建流程更流畅

### 2. **简化前端代码**
- 移除了 `loadScheme` 异步函数
- 移除了 `currentScheme` 状态管理
- 减少了加载状态的复杂性

### 3. **提升用户体验**
- 更快的页面响应
- 更少的"加载中..."提示
- 更流畅的操作流程

### 4. **数据一致性**
- Schema 与场景数据同步获取
- 避免了分离请求可能导致的数据不一致

## 📝 注意事项

### 后端返回格式

`currentScheme` 是一个 **JSON 字符串**，而不是对象：

```java
// 后端
response.setCurrentScheme(schemeVersion.getSchemaJson());  // String
```

### 前端解析

前端需要解析字符串为对象：

```typescript
if (typeof selectedScene.currentScheme === 'string') {
  return JSON.parse(selectedScene.currentScheme);
}
```

### 类型定义

TypeScript 类型定义支持两种格式：

```typescript
currentScheme?: string | JSONSchema;
```

## 🔄 迁移指南

### 从旧版本迁移

如果你的代码还在使用 `loadScheme` 模式：

**旧代码**:
```typescript
const loadScheme = async (sceneId: string) => {
  const response = await fetch(`/api/scenes/${sceneId}/schemes`);
  const result = await response.json();
  // ...
  setCurrentScheme(schema);
};
```

**新代码**:
```typescript
const getCurrentScheme = () => {
  if (!selectedScene?.currentScheme) return undefined;
  
  if (typeof selectedScene.currentScheme === 'string') {
    return JSON.parse(selectedScene.currentScheme);
  }
  
  return selectedScene.currentScheme;
};
```

## 🚀 下一步

### 后端编译

由于当前 Java 版本（22/25）与项目要求（17）不兼容，需要：

1. **安装 Java 17**:
   ```bash
   brew install openjdk@17
   ```

2. **设置 JAVA_HOME**:
   ```bash
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17
   export PATH="$JAVA_HOME/bin:$PATH"
   ```

3. **编译后端**:
   ```bash
   cd examples/demo-backend
   mvn clean compile -DskipTests
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

### 测试流程

1. 启动后端服务 (http://localhost:8080)
2. 启动前端服务 (http://localhost:8001)
3. 访问"场景管理"页面，验证场景列表加载
4. 访问"配置管理"页面，选择场景
5. 点击"创建配置"，验证表单正常渲染（无需等待 Schema 加载）
6. 检查浏览器 Network 面板，确认没有 `/api/scenes/{id}/schemes` 请求

## 📦 变更文件清单

### 后端
- ✅ `examples/demo-backend/src/main/java/com/chamberlain/dto/response/SceneResponse.java`
- ✅ `examples/demo-backend/src/main/java/com/chamberlain/service/SceneService.java`

### 前端
- ✅ `packages/protocol/src/types/scene.ts`
- ✅ `examples/demo-app/src/pages/Configs/index.tsx`

### 构建
- ✅ `packages/protocol` - 已重新编译
- ✅ `packages/react-components` - 已重新编译
- ⚠️ `examples/demo-backend` - 因 Java 版本问题未编译（代码已修改）

## 🎉 总结

这次改进通过在场景 API 中直接返回当前激活的 JSON Schema，显著简化了前端代码，减少了网络请求，提升了用户体验。这是一个典型的"后端多做一点，前端轻松很多"的优化案例。

**关键收益**:
- 🚀 **性能提升**: 减少 50% 的 API 请求
- 🧹 **代码简化**: 移除了异步加载逻辑和状态管理
- 😊 **体验优化**: 更快的页面响应和更少的加载等待

**前端服务**: ✅ http://localhost:8001 (已启动)  
**后端服务**: ⚠️ 待 Java 17 环境配置后启动

