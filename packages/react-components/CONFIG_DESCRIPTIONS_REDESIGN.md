# ConfigDescriptions 组件重新设计

## 🎯 设计目标

**突出配置数据，元数据紧凑化**

重新设计 `ConfigDescriptions` 组件，将配置数据作为主要展示内容，而元数据（ID、时间等）作为辅助信息紧凑显示。

## ✨ 新设计概览

### 视觉结构

```
┌─────────────────────────────────────────────────────────────┐
│ 元数据                                          [紧凑卡片] │
├─────────────────────────────────────────────────────────────┤
│ 配置 ID: xxx    场景 ID: yyy    Schema版本: v1              │
│ 应用条件: [environment=prod]   创建时间: xxx   更新时间: xxx│
└─────────────────────────────────────────────────────────────┘
                        ↓ 明显分隔 ↓
┌─────────────────────────────────────────────────────────────┐
│ 配置数据 [MySQL 配置]          基于 Schema v1 解析        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ╔═══════════════════════════════════════════════════════╗ │
│ ║  主机地址:           localhost                        ║ │
│ ║  端口:               3306                             ║ │
│ ║  数据库名:           default_db                       ║ │
│ ║  用户名:             root                             ║ │
│ ║  密码:               ********                         ║ │
│ ║  字符集:             [utf8mb4]                        ║ │
│ ║  最大连接数:         100                              ║ │
│ ║  超时时间（秒）:     30                               ║ │
│ ║  启用 SSL:           [否]                             ║ │
│ ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│ 原始 JSON 数据                                              │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ {                                                     │ │
│ │   "host": "localhost",                                │ │
│ │   "port": 3306,                                       │ │
│ │   ...                                                 │ │
│ │ }                                                     │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 主要改进

### 1. 区域分离

**修改前**：
- 所有信息混在一个 ProDescriptions 中
- 配置数据和元数据没有明显区分
- 视觉层次不清晰

**修改后**：
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
  {/* 元数据区域 - 紧凑 */}
  <Card size="small" title="元数据">
    <ProDescriptions
      column={3}
      size="small"
      bordered={false}
      // 紧凑样式
    />
  </Card>

  {/* 配置数据区域 - 突出 */}
  <Card title="配置数据">
    <ProDescriptions
      column={2}
      bordered
      // 更大字体，更突出
    />
    {/* 原始 JSON */}
  </Card>
</div>
```

### 2. 元数据区域优化

**特点**：
- ✅ `size="small"` - 小尺寸卡片
- ✅ `column={3}` - 3列布局，更紧凑
- ✅ `bordered={false}` - 无边框，更简洁
- ✅ `colon={false}` - 无冒号，节省空间
- ✅ 灰色标题 - 弱化视觉重要性
- ✅ 小字号（13px）- 辅助信息感

**显示内容**：
- 配置 ID（可复制）
- 场景 ID
- Schema 版本（Tag 显示）
- 应用条件（紧凑 Tag）
- 创建时间
- 更新时间

**移除内容**：
- ❌ 创建者（较少使用）
- ❌ 更新者（较少使用）

### 3. 配置数据区域增强

**特点**：
- ✅ 标准尺寸卡片
- ✅ `column={2}` - 2列布局，宽松舒适
- ✅ `bordered` - 有边框，强调重要性
- ✅ 粗体标题 - 突出显示
- ✅ 大字号（14px）- 主要内容感
- ✅ Schema 标题 Tag - 显示配置类型

**显示逻辑**：
```tsx
{configColumns.length > 0 ? (
  <ProDescriptions
    // 基于 Schema 动态生成的字段
  />
) : (
  <div>未提供 Schema 定义，无法解析配置字段</div>
)}
```

### 4. 原始 JSON 优化

**改进**：
- ✅ 分隔线分隔
- ✅ 小标题说明
- ✅ 浅灰背景 + 边框
- ✅ 等宽字体（Monaco, Consolas）
- ✅ 限制高度（300px）+ 滚动
- ✅ 一键复制功能

**样式**：
```tsx
<Paragraph
  copyable
  style={{
    background: '#fafafa',
    border: '1px solid #e8e8e8',
    padding: 12,
    borderRadius: 4,
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: 12,
    maxHeight: 300,
    overflow: 'auto',
  }}
>
  <pre>{JSON.stringify(configData, null, 2)}</pre>
</Paragraph>
```

## 📊 样式对比

| 属性 | 元数据区域 | 配置数据区域 |
|------|-----------|-------------|
| 卡片大小 | `small` | 标准 |
| 标题字号 | 14px（次要灰色） | 16px（加粗黑色） |
| 列数 | 3 列 | 2 列 |
| 边框 | 无 | 有 |
| 字号 | 13px | 14px |
| 标签重点 | label 弱化 | label 加粗 |
| 间距 | 紧凑 | 宽松 |

## 🎨 字段渲染优化

### 根据类型智能渲染

```tsx
// 布尔值
if (fieldSchema.type === 'boolean') {
  return <Tag color={value ? 'green' : 'default'}>{value ? '是' : '否'}</Tag>;
}

// 枚举值
if (fieldSchema.enum) {
  return <Tag color="blue">{String(value)}</Tag>;
}

// 数字
if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
  return <span style={{ fontFamily: 'monospace' }}>{value}</span>;
}

// 数组
if (Array.isArray(value)) {
  return (
    <Space wrap>
      {value.map((item, index) => (
        <Tag key={index}>{String(item)}</Tag>
      ))}
    </Space>
  );
}

// 对象
if (typeof value === 'object') {
  return (
    <Paragraph copyable>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </Paragraph>
  );
}
```

## 📝 使用示例

### 基本使用

```tsx
import { ConfigDescriptions } from '@chamberlain/react-components';

<ConfigDescriptions
  config={configData}
  schema={sceneSchema}
  showRawConfig={true}
  column={2}
/>
```

### Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config` | `Config` | 必填 | 配置数据对象 |
| `schema` | `JSONSchema` | 可选 | JSON Schema（用于解析字段） |
| `showRawConfig` | `boolean` | `true` | 是否显示原始 JSON |
| `extra` | `ProDescriptionsProps['columns']` | `[]` | 额外的字段配置 |
| `column` | `number` | `2` | 配置数据区域的列数 |

## ✅ 优势总结

1. **视觉层次清晰**
   - 元数据和配置数据明确分离
   - 主次分明，重点突出

2. **空间利用高效**
   - 元数据 3 列布局，节省空间
   - 配置数据 2 列布局，舒适阅读

3. **信息密度合理**
   - 辅助信息紧凑但不拥挤
   - 主要数据宽松但不浪费

4. **可读性强**
   - 配置字段基于 Schema 自动解析
   - 不同类型智能渲染（布尔、枚举、数字等）
   - 原始 JSON 易于查看和复制

5. **响应式友好**
   - 使用 Card + flex 布局
   - 可以适应不同屏幕尺寸

## 🚀 后续优化建议

1. **添加字段搜索**
   - 当字段很多时，支持搜索过滤

2. **字段分组**
   - 根据 Schema 的分组信息，对配置字段分组显示

3. **历史版本对比**
   - 显示与历史版本的差异

4. **校验状态显示**
   - 实时显示字段是否符合 Schema 要求

---

*重新设计完成时间: 2025-10-11*
*影响组件: ConfigDescriptions*

