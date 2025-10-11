# 表格组件重构指南

## 📋 目标

统一管理所有 Table 组件的基础配置，提高代码复用性和一致性。

## 🎯 设计原则

### 1. 符合 Ant Design Pro 最佳实践

- 使用 ProColumns 类型
- 遵循 ProTable 组件规范
- 保持与 Ant Design 设计语言一致

### 2. 配置分层

```
constants/tableConfig.ts
├── COLUMN_WIDTHS      # 列宽常量
├── ACTION_CONFIG      # 操作列配置
├── createCommonColumns  # 通用列生成器
├── TABLE_CONFIG       # 表格通用配置
└── TAG_COLORS / STATUS_CONFIG  # 样式配置
```

## 📦 已创建的配置文件

### `src/constants/tableConfig.ts`

包含以下配置：

#### 1. **COLUMN_WIDTHS** - 列宽标准

```typescript
export const COLUMN_WIDTHS = {
  ID: 200,              // 标准 ID 列
  ID_SHORT: 120,        // 短 ID
  DATE: 165,            // 日期时间列
  STATUS: 100,          // 状态列
  ACTIONS_FULL: 300,    // 完整操作列
  NAME: 200,            // 名称列
  // ... 更多
} as const;
```

**使用场景**：
- 所有表格的时间列统一使用 `COLUMN_WIDTHS.DATE` (165px)
- 所有操作列根据按钮数量选择对应宽度
- 确保不同表格的相同类型列宽度一致

#### 2. **createCommonColumns** - 列配置生成器

```typescript
const commonColumns = createCommonColumns();

// 使用示例
const columns = [
  { ...commonColumns.id('ID', COLUMN_WIDTHS.ID) },
  { ...commonColumns.name('名称') },
  { ...commonColumns.createdAt() },
  { ...commonColumns.updatedAt() },
  { ...commonColumns.actions(4, true) }, // 4个按钮，有图标
];
```

**优势**：
- 自动包含 copyable、ellipsis、sorter 等常用配置
- 类型安全
- 易于维护和扩展

#### 3. **TABLE_CONFIG** - 表格通用配置

```typescript
<ProTable
  pagination={TABLE_CONFIG.pagination}
  scroll={TABLE_CONFIG.scroll}
  search={TABLE_CONFIG.search}
/>
```

**统一配置**：
- 分页器样式
- 滚动行为
- 搜索框配置

## 🔧 重构步骤

### 步骤 1: 更新导入

```typescript
// 旧的方式
import { ProTable, type ProColumns } from '@ant-design/pro-components';

// 新的方式
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { COLUMN_WIDTHS, createCommonColumns, TABLE_CONFIG } from '../../constants';
```

### 步骤 2: 使用通用列配置

**重构前**：
```typescript
const columns: ProColumns[] = [
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    valueType: 'dateTime',
    width: 180,  // 宽度不统一
    hideInSearch: true,
    sorter: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    valueType: 'dateTime',
    width: 165,  // 宽度不一致
    hideInSearch: true,
    sorter: true,
  },
];
```

**重构后**：
```typescript
const commonColumns = createCommonColumns();

const columns: ProColumns[] = [
  {
    ...commonColumns.createdAt(),  // 自动使用标准宽度 165px
    sorter: hasCapability('sort'),
  },
  {
    ...commonColumns.updatedAt(),
    sorter: hasCapability('sort'),
  },
];
```

### 步骤 3: 统一操作列

**重构前**：
```typescript
const actionColumn = {
  title: '操作',
  key: 'action',
  valueType: 'option',
  width: 200,      // 手动设置，可能不够或过宽
  fixed: 'right',
  render: ...
};
```

**重构后**：
```typescript
const actionColumn = {
  ...commonColumns.actions(4, true),  // 自动计算：4个按钮 + 图标 = 适当宽度
  render: ...
};
```

**宽度自动计算逻辑**：
- 无图标：每个按钮 50px
- 有图标：每个按钮 60px
- 最小宽度：200px
- 自动加上间距

### 步骤 4: 使用表格通用配置

**重构前**：
```typescript
<ProTable
  pagination={{
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  }}
  scroll={{ x: 'max-content' }}
  search={{
    labelWidth: 'auto',
  }}
/>
```

**重构后**：
```typescript
<ProTable
  pagination={TABLE_CONFIG.pagination}
  scroll={TABLE_CONFIG.scroll}
  search={searchable ? TABLE_CONFIG.search : false}
/>
```

## 📝 完整示例

### SceneTable 重构示例

```typescript
import { COLUMN_WIDTHS, createCommonColumns, TABLE_CONFIG } from '../../constants';

export const SceneTable: React.FC<Props> = ({ ... }) => {
  const commonColumns = createCommonColumns();
  
  const defaultColumns: ProColumns<Scene>[] = [
    // ID 列 - 使用标准配置
    {
      ...commonColumns.id('场景 ID', COLUMN_WIDTHS.ID),
    },
    
    // 名称列 - 使用标准配置
    {
      ...commonColumns.name('场景名称'),
    },
    
    // 自定义列 - 需要特殊逻辑的列
    {
      title: '可用条件',
      key: 'availableConditions',
      render: (_, record) => {
        // 自定义渲染逻辑
      },
    },
    
    // 时间列 - 使用标准配置并添加特定行为
    {
      ...commonColumns.createdAt(),
      sorter: hasCapability('scenes.sort'),
    },
    {
      ...commonColumns.updatedAt(),
      sorter: hasCapability('scenes.sort'),
    },
  ];
  
  // 操作列 - 自动计算宽度（4个操作，有图标）
  const actionColumn: ProColumns<Scene> = {
    ...commonColumns.actions(4, true),
    render: (_, record) => [
      <a key="view" onClick={() => actions?.onView?.(record)}>查看</a>,
      <a key="edit" onClick={() => actions?.onEdit?.(record)}>编辑</a>,
      <a key="configs" onClick={() => actions?.onViewConfigs?.(record)}>配置</a>,
      <Popconfirm key="delete" ...>
        <a style={{ color: 'red' }}>删除</a>
      </Popconfirm>,
    ],
  };
  
  return (
    <ProTable
      columns={[...defaultColumns, actionColumn]}
      pagination={TABLE_CONFIG.pagination}
      scroll={TABLE_CONFIG.scroll}
      search={searchable ? TABLE_CONFIG.search : false}
      {...other props}
    />
  );
};
```

## 🎨 自定义和扩展

### 场景 1: 需要不同的列宽

```typescript
// 使用标准宽度
{ ...commonColumns.id() }

// 使用自定义宽度
{ ...commonColumns.id('自定义ID', 250) }

// 完全自定义
{
  title: 'ID',
  dataIndex: 'id',
  width: 300,
  // 其他自定义配置
}
```

### 场景 2: 添加额外配置

```typescript
{
  ...commonColumns.createdAt(),
  sorter: true,
  filters: [...],  // 添加筛选器
  onFilter: ...,
}
```

### 场景 3: 扩展通用列生成器

```typescript
// 在 tableConfig.ts 中添加新的生成器
export const createCommonColumns = () => ({
  // ... 现有生成器
  
  // 新增：状态列生成器
  status: (title = '状态'): Partial<ProColumns<any>> => ({
    title,
    dataIndex: 'status',
    key: 'status',
    width: COLUMN_WIDTHS.STATUS,
    render: (status) => {
      const config = STATUS_CONFIG[status];
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  }),
});
```

## ✅ 重构检查清单

### 代码层面
- [ ] 所有时间列使用 `COLUMN_WIDTHS.DATE`
- [ ] 所有 ID 列使用合适的 `COLUMN_WIDTHS.ID_*`
- [ ] 操作列使用 `commonColumns.actions()` 并正确计算按钮数量
- [ ] 表格配置使用 `TABLE_CONFIG.*`
- [ ] 移除硬编码的宽度值

### 一致性检查
- [ ] 相同类型的列在不同表格中宽度一致
- [ ] 分页器行为统一
- [ ] 搜索框样式统一
- [ ] 操作按钮间距统一

### 类型安全
- [ ] 使用 TypeScript 严格模式
- [ ] 所有配置都有类型定义
- [ ] 使用 `as const` 确保常量不可变

## 📊 重构收益

### 1. 一致性
- ✅ 所有表格的时间列宽度统一 (165px)
- ✅ 操作列宽度根据按钮数量自动适配
- ✅ 分页器样式完全一致

### 2. 可维护性
- ✅ 需要调整宽度时只需修改一处
- ✅ 新增表格时快速复用配置
- ✅ 减少重复代码

### 3. 开发效率
- ✅ 不需要每次都手动计算列宽
- ✅ 常见列配置一行代码搞定
- ✅ 类型提示完善

### 4. 性能
- ✅ 配置对象可以被缓存和复用
- ✅ 避免不必要的重新计算

## 🚀 下一步

1. **完成 SceneTable 重构**
2. **完成 ConfigTable 重构**
3. **创建单元测试验证配置正确性**
4. **更新组件文档**
5. **Code Review 确保质量**

## 📚 参考资料

- [Ant Design Pro - ProTable](https://procomponents.ant.design/components/table)
- [Ant Design - Table](https://ant.design/components/table-cn/)
- [React 组件设计模式](https://react.dev/learn/reusing-logic-with-custom-hooks)

