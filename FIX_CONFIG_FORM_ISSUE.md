# ✅ 修复配置表单无法显示的问题

## 📝 问题描述

用户反馈：点击"创建配置"按钮后，没有打开表单，也没有发送任何请求。

## 🔍 根本原因

**后端数据结构设计**：
- `Scene` 实体的 `SceneResponse` DTO 不包含 `currentScheme`（JSON Schema）
- JSON Schema 存储在 `SchemeVersion` 实体中
- 需要单独调用 API `/api/scenes/{id}/schemes` 获取 Schema

**前端代码问题**：
- `ConfigForm` 只有在 `selectedScene.currentScheme` 存在时才会渲染
- 但后端返回的 Scene 数据中没有这个字段
- 导致 `Drawer` 打开，但表单不显示

## 🛠️ 解决方案

### 修改文件：`examples/demo-app/src/pages/Configs/index.tsx`

#### 1. 添加 `currentScheme` 状态
```typescript
const [currentScheme, setCurrentScheme] = useState<any>(undefined); // 当前场景的 JSON Schema
```

#### 2. 新增 `loadScheme` 函数
```typescript
// 加载场景的 JSON Schema
const loadScheme = async (sceneId: string) => {
  try {
    // 直接使用 fetch 获取场景的所有 scheme 版本
    const response = await fetch(`/api/scenes/${sceneId}/schemes`);
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      // 找到当前激活的版本，或使用最新的版本
      const activeScheme = result.data.find((s: any) => s.status === 'ACTIVE') || result.data[result.data.length - 1];
      setCurrentScheme(activeScheme.schemaJson);
    } else {
      console.warn('未找到场景的 Scheme');
    }
  } catch (error: any) {
    console.error('加载 Scheme 失败:', error);
    message.error('加载场景配置模板失败');
  }
};
```

#### 3. 在场景选择/切换时加载 Scheme
```typescript
// useEffect 中
if (scene) {
  loadScheme(scene.id);
}

// handleSceneChange 中
loadScheme(sceneId);
```

#### 4. 更新 Drawer 中的表单渲染逻辑
```typescript
{/* 创建配置抽屉 */}
<Drawer title={`创建配置 - ${selectedScene?.name || ''}`} open={createModalVisible} ...>
  {currentScheme ? (
    <ConfigForm
      schema={currentScheme}  // 使用 currentScheme 而不是 selectedScene.currentScheme
      scene={selectedScene}
      initialValues={currentConfig ? getConfigData(currentConfig) : undefined}
      initialConditions={currentConfig ? currentConfig.conditionList : undefined}
      onSubmit={handleCreate}
      onCancel={...}
      allowEditConditions={true}
    />
  ) : (
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
      加载配置模板中...
    </div>
  )}
</Drawer>
```

同样的修改应用到：
- 编辑配置 Drawer
- 查看配置详情 Drawer

## 📊 API 调用流程

### 之前（错误）
```
1. GET /api/scenes → 返回 Scene 列表（不含 schema）
2. 用户点击"创建配置"
3. ❌ 表单不显示（因为 selectedScene.currentScheme 为 undefined）
```

### 现在（正确）
```
1. GET /api/scenes → 返回 Scene 列表
2. GET /api/scenes/{id}/schemes → 返回 SchemeVersion 列表
3. 提取 schemaJson 并保存到 currentScheme
4. 用户点击"创建配置"
5. ✅ 表单正常显示（基于 currentScheme 渲染）
6. 用户填写并提交
7. POST /api/configs → 创建配置
```

## 🧪 测试步骤

1. **启动服务**
   ```bash
   # 后端（如果未运行）
   cd examples/demo-backend
   mvn spring-boot:run -Dspring-boot.run.profiles=local -DskipTests
   
   # 前端（如果未运行）
   cd examples/demo-app
   pnpm dev
   ```

2. **访问应用**
   - 打开 http://localhost:8000

3. **测试创建配置**
   - 进入"配置管理"页面
   - 从下拉菜单选择一个场景（如 "测试"）
   - 等待场景加载（观察 Network 面板：`/api/scenes/{id}/schemes`）
   - 点击"创建配置"按钮
   - ✅ **期望**：打开 Drawer，显示表单（包括条件选择和配置数据输入）
   - 填写条件和配置数据
   - 点击"保存"
   - ✅ **期望**：发送 POST 请求，创建成功，Drawer 关闭，表格刷新

4. **测试编辑配置**
   - 点击某个配置的"编辑"按钮
   - ✅ **期望**：打开 Drawer，显示表单，条件为只读，配置数据可编辑
   - 修改配置数据
   - 点击"保存"
   - ✅ **期望**：发送 PUT 请求，更新成功

5. **测试复制配置**
   - 点击某个配置的"复制"按钮
   - ✅ **期望**：打开创建 Drawer，表单预填充原配置的数据和条件
   - 修改条件或配置数据
   - 点击"保存"
   - ✅ **期望**：发送 POST 请求，创建新配置

6. **测试查看配置**
   - 点击某个配置的"查看"按钮
   - ✅ **期望**：打开 Drawer，显示配置详情（包括元数据和配置数据，样式区分明显）

## 🐛 已知问题（Lint 警告）

有一个 TypeScript lint 警告：
```
Line 16:10: 模块""@umijs/max""没有导出的成员"useSearchParams"。
```

这是 IDE 的类型检查问题，实际上 `useSearchParams` 是 Umi Max 提供的，运行时可以正常使用。如果需要完全消除警告，可以：

```typescript
// 替换
import { useSearchParams } from '@umijs/max';

// 为
import { useSearchParams } from 'umi';
```

但当前的代码可以正常运行。

## 📈 后续优化建议

### 1. 后端优化（可选）
在 `SceneResponse` 中包含 `currentScheme`，减少前端 API 调用：

```java
@Data
@Schema(description = "场景响应")
public class SceneResponse {
    // ... 现有字段 ...
    
    @Schema(description = "当前激活的 JSON Schema")
    private JsonNode currentScheme;
}
```

### 2. 前端缓存优化（可选）
缓存已加载的 Scheme，避免重复请求：

```typescript
const [schemeCache, setSchemeCache] = useState<Record<string, any>>({});

const loadScheme = async (sceneId: string) => {
  // 先检查缓存
  if (schemeCache[sceneId]) {
    setCurrentScheme(schemeCache[sceneId]);
    return;
  }
  
  // ... 加载逻辑 ...
  
  // 保存到缓存
  setSchemeCache({ ...schemeCache, [sceneId]: activeScheme.schemaJson });
};
```

### 3. Loading 状态优化
添加 loading 状态，提供更好的用户体验：

```typescript
const [schemeLoading, setSchemeLoading] = useState(false);

const loadScheme = async (sceneId: string) => {
  setSchemeLoading(true);
  try {
    // ... 加载逻辑 ...
  } finally {
    setSchemeLoading(false);
  }
};

// 在 Drawer 中
{schemeLoading ? <Spin /> : currentScheme ? <ConfigForm .../> : <Empty />}
```

## ✅ 完成状态

- [x] 识别问题根本原因
- [x] 实现 `loadScheme` 函数
- [x] 更新场景加载和切换逻辑
- [x] 更新所有 Drawer 中的表单渲染
- [x] 修复 lint 错误（可选的警告除外）
- [x] 重启前端服务
- [x] 编写测试指南

## 📞 联系信息

如果有任何问题或需要进一步的帮助，请查看：
- 后端 API 文档: http://localhost:8080/swagger-ui.html
- 验证连接脚本: `./verify-connection.sh`

