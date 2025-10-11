# 配置表单改进：支持条件选择和复制

## 📋 改进说明

为 `ConfigForm` 组件添加条件选择功能，并优化配置创建、编辑和复制流程。

## ❌ 之前的问题

1. **创建配置时无法选择条件** - 配置必须有条件才能创建，但表单中没有提供选择
2. **复制配置需要后端支持** - 复制逻辑在后端实现，效率低
3. **编辑模式下条件显示缺失** - 看不到配置的条件信息

## ✅ 改进内容

### 1. ConfigForm 组件增强 (`packages/react-components/src/components/ConfigForm/index.tsx`)

#### 新增 Props

```typescript
export interface ConfigFormProps {
  schema: JSONSchema;
  scene?: Scene;              // 新增：场景信息（用于条件选择）
  initialValues?: Record<string, any>;
  initialConditions?: Array<{ key: string; value: any }>;  // 新增：初始条件
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  readonly?: boolean;
  allowEditConditions?: boolean;  // 新增：是否允许编辑条件
}
```

#### 功能特性

**1. 创建/复制模式 (`allowEditConditions=true`)**

- ✅ 显示完整的条件选择器
- ✅ 使用 `ProFormList` 支持多条件添加
- ✅ 条件类型下拉选择（从场景的 `availableConditions` 获取）
- ✅ 条件值根据类型动态渲染：
  - 有预定义值 → 下拉选择
  - 数字类型 → `ProFormDigit`
  - 布尔类型 → 下拉选择（是/否）
  - 其他类型 → 文本输入
- ✅ 每个条件使用 `Card` 包裹，视觉分组清晰
- ✅ 提示信息："条件一旦创建后不可修改"

**2. 编辑模式 (`allowEditConditions=false`)**

- ✅ 只读显示现有条件
- ✅ 灰色背景区分不可编辑
- ✅ 显示条件名称和值
- ✅ 提示："条件一旦创建后不可修改（因为条件是配置 ID 的一部分）"

**3. 表单布局**

```
┌─────────────────────────────────────┐
│ 配置条件                             │
│ [条件选择器或只读显示]                 │
└─────────────────────────────────────┘
─── 配置数据 ───────────────────────────
┌─────────────────────────────────────┐
│ [Schema 动态生成的表单字段]            │
└─────────────────────────────────────┘
```

### 2. Configs 页面更新 (`examples/demo-app/src/pages/Configs/index.tsx`)

#### handleCreate 修改

```typescript
const handleCreate = async (values: any) => {
  // 分离条件和配置数据
  const { conditionList, ...configData } = values;
  
  const createData: CreateConfigRequest = {
    sceneId: selectedSceneId,
    conditionList: conditionList || [],  // 从表单获取
    config: configData,
    schemeVersion: (selectedScene as any)?.currentSchemeVersion || 1,
  };
  // ...
};
```

#### handleEdit 修改

```typescript
const handleEdit = async (values: any) => {
  // 只提交配置数据，不提交条件
  const { conditionList, ...configData } = values;
  
  await client.updateConfig(currentConfig.id, { config: configData });
  // ...
};
```

#### handleCopy 修改（前端实现）

```typescript
// 之前：调用后端 API
await client.copyConfig(config.id);

// 现在：前端预填充
const handleCopy = (config: Config) => {
  setCurrentConfig(config);  // 预填充配置数据
  setCreateModalVisible(true);  // 打开创建表单
  message.info('配置已复制，请修改条件后保存');
};
```

#### 创建配置 Drawer

```typescript
<Drawer title={`创建配置 - ${selectedScene?.name || ''}`} ...>
  <ConfigForm
    schema={(selectedScene as any).currentScheme}
    scene={selectedScene}  // 传递场景信息
    initialValues={currentConfig ? getConfigData(currentConfig) : undefined}  // 复制时预填充
    initialConditions={currentConfig ? currentConfig.conditionList : undefined}  // 复制时预填充
    onSubmit={handleCreate}
    allowEditConditions={true}  // 允许编辑条件
  />
</Drawer>
```

#### 编辑配置 Drawer

```typescript
<Drawer title="编辑配置" ...>
  <ConfigForm
    schema={(selectedScene as any).currentScheme}
    scene={selectedScene}  // 传递场景信息
    initialValues={getConfigData(currentConfig)}
    initialConditions={currentConfig.conditionList}  // 显示现有条件
    onSubmit={handleEdit}
    allowEditConditions={false}  // 不允许编辑条件
  />
</Drawer>
```

## 🎯 使用场景对比

| 场景 | 条件显示 | 条件可编辑 | 配置数据 |
|------|---------|-----------|---------|
| **创建配置** | ✅ 完整选择器 | ✅ 可编辑 | ✅ 空表单 |
| **复制配置** | ✅ 完整选择器 | ✅ 可编辑 | ✅ 预填充 |
| **编辑配置** | ✅ 只读显示 | ❌ 不可编辑 | ✅ 可编辑 |

## 🔄 流程图

### 创建配置流程

```
选择场景
   ↓
点击"创建配置"
   ↓
打开 Drawer
   ↓
├─ 选择条件（多个）
│  ├─ 条件类型：从场景 availableConditions 选择
│  └─ 条件值：根据类型动态输入
├─ 填写配置数据（根据 Schema）
   ↓
提交 → 后端生成 ID（sceneId:key1:value1:key2:value2）
```

### 复制配置流程

```
点击"复制"按钮
   ↓
预填充配置数据到创建表单
   ↓
├─ 条件：显示原条件但可修改
├─ 配置数据：显示原数据但可修改
   ↓
修改条件和/或配置数据
   ↓
提交 → 创建新配置（新 ID）
```

### 编辑配置流程

```
点击"编辑"按钮
   ↓
打开 Drawer
   ↓
├─ 条件：只读显示（灰色背景）
├─ 配置数据：可编辑
   ↓
修改配置数据
   ↓
提交 → 更新配置（ID 不变）
```

## 💡 设计原则

### 1. 条件不可变性
- ✅ 条件是配置 ID 的一部分
- ✅ 创建后不可修改，避免 ID 冲突
- ✅ 需要不同条件 → 创建新配置或复制后修改

### 2. 复制功能前端化
- ✅ 无需后端 API
- ✅ 响应更快
- ✅ 用户可以立即修改条件和数据

### 3. 用户体验
- ✅ 明确提示：哪些可以编辑，哪些不能
- ✅ 视觉区分：编辑模式的条件使用灰色背景
- ✅ 表单分组：条件 vs 配置数据，使用 `Divider` 分隔

## 📊 代码结构

```
ConfigForm
├── renderConditions()          # 条件选择/显示
│   ├── allowEditConditions=true   → ProFormList + 动态字段
│   └── allowEditConditions=false  → 只读 Card 显示
├── renderFields()              # Schema 字段渲染
└── onSubmit()                  # 统一提交处理
```

## ✨ 特色功能

### 1. 智能条件值输入

```typescript
// 根据条件定义自动选择输入方式
if (condition.values && condition.values.length > 0) {
  // 有预定义值 → 下拉选择
  <ProFormSelect options={condition.values} />
} else {
  switch (condition.type) {
    case 'number':
      <ProFormDigit />
    case 'boolean':
      <ProFormSelect options={[true, false]} />
    default:
      <ProFormText />
  }
}
```

### 2. 条件卡片分组

```typescript
<ProFormList
  itemRender={({ listDom, action }, { index }) => (
    <Card
      title={`条件 ${index + 1}`}
      extra={action}  // 删除按钮
    >
      {listDom}
    </Card>
  )}
>
  // 条件字段
</ProFormList>
```

### 3. 数据分离提交

```typescript
// 创建：分离条件和配置数据
const { conditionList, ...configData } = values;

// 编辑：只提交配置数据
const { conditionList, ...configData } = values;
await client.updateConfig(id, { config: configData });
```

## 🎉 完成状态

- ✅ ConfigForm 组件：添加条件选择器
- ✅ ConfigForm 组件：支持创建/编辑/复制模式
- ✅ Configs 页面：更新创建逻辑
- ✅ Configs 页面：更新编辑逻辑
- ✅ Configs 页面：复制功能前端化
- ✅ 构建成功：react-components 包已重新编译
- ✅ 热更新：demo-app 服务器自动检测并更新

## 🚀 验证方式

1. **创建配置**
   - 选择场景
   - 点击"创建配置"
   - ✅ 看到"配置条件"区域（蓝色背景）
   - ✅ 可以添加多个条件
   - ✅ 条件值根据类型动态显示

2. **复制配置**
   - 在配置列表中点击"复制"
   - ✅ 打开创建表单
   - ✅ 配置数据已预填充
   - ✅ 条件已预填充但可修改
   - ✅ 提示："配置已复制，请修改条件后保存"

3. **编辑配置**
   - 点击"编辑"
   - ✅ 看到"配置条件"区域（灰色背景）
   - ✅ 条件只读显示
   - ✅ 提示："条件一旦创建后不可修改"
   - ✅ 配置数据可编辑

---

**改进时间**: 2025-10-11  
**影响范围**: ConfigForm 组件、Configs 页面  
**向后兼容**: ✅ 新增可选 props，不影响现有功能

