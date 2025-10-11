# 条件选择器显示问题排查

## 🔍 问题描述
创建或复制配置时，看不到条件选择器。

## ✅ 已完成的修复

1. **ConfigForm 组件更新** ✅
   - 添加了 `renderConditions()` 方法
   - 添加了 `scene`、`initialConditions`、`allowEditConditions` props
   - 已构建到 `dist/components/ConfigForm/index.js`

2. **Configs 页面更新** ✅
   - 传递 `scene` prop 到 ConfigForm
   - 传递 `allowEditConditions` prop
   - 创建时：`allowEditConditions={true}`
   - 编辑时：`allowEditConditions={false}`

3. **react-components 包重新构建** ✅
   - 执行了 `pnpm build`
   - 确认构建文件包含新功能

4. **缓存清理** ✅
   - 清理了 `src/.umi` 目录
   - 清理了 `node_modules/.cache` 目录
   - 重启了开发服务器

## 🐛 可能的原因

### 1. Scene 对象结构问题

检查 `selectedScene` 是否包含 `availableConditions`：

```typescript
// 在 Configs 页面中
console.log('Selected Scene:', selectedScene);
console.log('Available Conditions:', selectedScene?.availableConditions);
```

**预期结果**：
```javascript
{
  id: 'mysql_database_config',
  name: 'MySQL 数据库配置',
  availableConditions: [
    {
      key: 'environment',
      name: '环境',
      type: 'string',
      values: ['dev', 'test', 'staging', 'prod']
    }
  ]
}
```

### 2. Scene API 返回数据不完整

检查 Mock API 返回的场景数据：

```bash
# 检查 Mock 文件
cat examples/demo-app/mock/data/sample-scenes.json
```

**必须包含**：
- `availableConditions` 数组
- 每个条件必须有 `key`、`name`、`type`
- 可选：`values` 数组（预定义值）

### 3. ConfigForm 没有收到 scene prop

在 `ConfigForm` 组件中添加调试：

```typescript
export const ConfigForm: React.FC<ConfigFormProps> = ({
  schema,
  scene,
  // ...
}) => {
  console.log('ConfigForm received scene:', scene);
  console.log('ConfigForm availableConditions:', scene?.availableConditions);
  
  // ...
};
```

### 4. renderConditions 提前返回

检查 `renderConditions` 是否提前返回 null：

```typescript
const renderConditions = () => {
  if (!scene || !scene.availableConditions || scene.availableConditions.length === 0) {
    console.log('renderConditions returning null because:', {
      hasScene: !!scene,
      hasConditions: !!scene?.availableConditions,
      conditionsLength: scene?.availableConditions?.length
    });
    return null;
  }
  // ...
};
```

## 🔧 快速修复步骤

### 步骤 1: 验证 Mock 数据

```bash
cd /Users/advance/workspace/chamberlain/examples/demo-app
cat mock/data/sample-scenes.json | grep -A 10 "availableConditions"
```

### 步骤 2: 检查 Configs 页面 Props

在 `src/pages/Configs/index.tsx` 中临时添加：

```typescript
{/* 创建配置抽屉 */}
<Drawer
  title={`创建配置 - ${selectedScene?.name || ''}`}
  open={createModalVisible}
  // ...
>
  {(selectedScene as any)?.currentScheme && (
    <>
      {/* 调试信息 */}
      <div style={{ background: '#fff3cd', padding: 10, marginBottom: 10 }}>
        <pre>{JSON.stringify({
          hasScene: !!selectedScene,
          sceneId: selectedScene?.id,
          hasConditions: !!(selectedScene as any)?.availableConditions,
          conditionsCount: (selectedScene as any)?.availableConditions?.length || 0,
        }, null, 2)}</pre>
      </div>
      
      <ConfigForm
        schema={(selectedScene as any).currentScheme}
        scene={selectedScene}
        // ...
      />
    </>
  )}
</Drawer>
```

### 步骤 3: 强制刷新浏览器

1. **打开 DevTools** (F12)
2. **右键点击刷新按钮**
3. **选择 "清空缓存并硬性重新加载"**
4. 或按 `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Windows)

### 步骤 4: 检查 Console

打开浏览器 Console，查找：
- React 错误
- 条件渲染相关的 log
- Schema 验证错误

## 📋 检查清单

- [ ] Mock 数据包含 `availableConditions`
- [ ] Scene API 返回完整数据
- [ ] `selectedScene` 不为 undefined
- [ ] `scene` prop 正确传递到 ConfigForm
- [ ] `allowEditConditions={true}` 设置正确
- [ ] 浏览器已清除缓存
- [ ] 开发服务器已重启
- [ ] Console 无错误信息

## 🎯 预期行为

### 创建配置时

应该看到：

```
┌─────────────────────────────────┐
│ ─── 配置条件 ───                 │
│ ┌─── 卡片背景（蓝色）────────┐   │
│ │ 配置条件用于区分不同环境... │   │
│ │                              │   │
│ │ [+ 添加条件] 按钮            │   │
│ └──────────────────────────────┘   │
│                                 │
│ ─── 配置数据 ───                 │
│ [Schema 字段...]                │
└─────────────────────────────────┘
```

点击 "+ 添加条件" 后：

```
┌─── 条件 1 ──────────────── [×] ┐
│ 条件类型: [选择 ▼]              │
│ 条件值: [根据类型动态显示]       │
└─────────────────────────────────┘
```

### 编辑配置时

应该看到：

```
┌─────────────────────────────────┐
│ 配置条件                         │
│ 条件一旦创建后不可修改            │
│ -------------------------------- │
│ 环境: prod                       │
└─────────────────────────────────┘
```

## 🚨 如果问题依然存在

### 方案 1: 临时硬编码测试

在 `ConfigForm` 中临时硬编码一个条件：

```typescript
const renderConditions = () => {
  // 临时：硬编码测试
  return (
    <Card size="small" style={{ marginBottom: 24, background: '#ffcccc' }}>
      <div>🔴 测试：条件选择器应该显示在这里</div>
      <div>Scene: {scene ? 'YES' : 'NO'}</div>
      <div>Conditions: {scene?.availableConditions?.length || 0}</div>
    </Card>
  );
  
  // 原代码...
};
```

### 方案 2: 检查类型定义

确认 `Scene` 类型包含 `availableConditions`：

```bash
grep -A 20 "interface Scene\|type Scene" packages/protocol/src/types/scene.ts
```

### 方案 3: 重新构建所有包

```bash
cd /Users/advance/workspace/chamberlain
pnpm -r build
cd examples/demo-app
rm -rf src/.umi node_modules/.cache
pnpm dev
```

## 📞 需要帮助？

提供以下信息：
1. Console 中的错误信息（截图）
2. `selectedScene` 的完整数据结构（Console.log 输出）
3. 创建配置时的截图
4. Network 面板中场景 API 的响应数据

---

**最后更新**: 2025-10-11  
**服务器状态**: ✅ 运行中 (localhost:8000)  
**构建状态**: ✅ 最新

