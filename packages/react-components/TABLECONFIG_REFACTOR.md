# TableConfig 配置重构完成

## 📝 概述

成功完成了表格配置的统一重构工作，将分散在各个组件中的表格配置提取到 `tableConfig.ts` 统一管理。

## ✅ 完成的工作

### 1. 创建统一配置文件
**文件**: `packages/react-components/src/constants/tableConfig.ts`

包含以下配置：
- **列宽配置** (`COLUMN_WIDTHS`): 定义标准列宽度
  - ID列：`ID_SHORT: 120`, `ID: 200`, `ID_LONG: 280`
  - 时间列：`DATE: 165`, `DATE_SHORT: 120`
  - 状态列：`STATUS: 100`, `VERSION: 100`
  - 操作列：`ACTIONS_FULL: 300` 等
  - 名称列：`NAME: 200`

- **通用列生成器** (`createCommonColumns()`):
  - `id()` - ID列
  - `name()` - 名称列  
  - `createdAt()` - 创建时间列
  - `updatedAt()` - 更新时间列
  - `createdBy()` - 创建者列
  - `updatedBy()` - 更新者列
  - `actions()` - 操作列（根据按钮数量自动计算宽度）

- **表格通用配置** (`TABLE_CONFIG`):
  - 分页配置：`pagination`
  - 滚动配置：`scroll`
  - 搜索配置：`search`
  - 工具栏配置：`toolbar`

### 2. 重构 SceneTable 组件
**文件**: `packages/react-components/src/components/SceneTable/index.tsx`

**改进**:
- ✅ 导入并使用 `tableConfig`
- ✅ 使用 `commonColumns.id()` 替代手写ID列配置
- ✅ 使用 `commonColumns.name()` 替代手写名称列配置  
- ✅ 使用 `commonColumns.createdAt()` 和 `commonColumns.updatedAt()` 替代时间列
- ✅ 使用 `commonColumns.actions(4, true)` 生成操作列（4个按钮，有图标）
- ✅ 应用统一的分页、滚动配置

### 3. 重构 ConfigTable 组件
**文件**: `packages/react-components/src/components/ConfigTable/index.tsx`

**改进**:
- ✅ 导入并使用 `tableConfig`
- ✅ 使用 `commonColumns.id()` 替代手写ID列配置
- ✅ 使用 `commonColumns.createdAt()` 和 `commonColumns.updatedAt()` 替代时间列
- ✅ 使用 `commonColumns.actions(4, false)` 生成操作列（4个按钮，无图标）
- ✅ 应用统一的分页、滚动配置

### 4. 修复 TypeScript 类型问题
- ✅ 修复 `id()` 方法的宽度参数类型
- ✅ 修复 `pagination` 配置的 readonly 类型冲突
- ✅ 修复 `search.labelWidth` 的类型问题

## 📊 代码对比

### 修改前 (SceneTable)
```typescript
const defaultColumns: ProColumns<Scene>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    copyable: true,
    width: 120,
    ellipsis: true,
    fixed: 'left',
  },
  // ... 重复的配置
];

const actionColumn: ProColumns<Scene> = {
  title: '操作',
  key: 'action',
  valueType: 'option',
  width: 300,
  minWidth: 300,
  fixed: 'right',
  // ...
};
```

### 修改后 (SceneTable)
```typescript
import { COLUMN_WIDTHS, createCommonColumns, TABLE_CONFIG } from '../../constants/tableConfig';

const commonColumns = createCommonColumns();

const defaultColumns: ProColumns<Scene>[] = [
  {
    ...commonColumns.id('ID', COLUMN_WIDTHS.ID_SHORT),
  },
  // ... 简洁且统一
];

const actionColumn: ProColumns<Scene> = {
  ...commonColumns.actions(4, true), // 4个按钮，有图标
  render: (_, record) => [
    // ...
  ],
};
```

## 🎯 优势

1. **统一管理**: 所有表格配置集中在一个文件，便于维护
2. **类型安全**: 使用 TypeScript 定义常量，避免魔法数字
3. **可复用**: 通用列配置生成器可在任何表格中复用
4. **易扩展**: 新增表格时可直接使用现有配置
5. **一致性**: 确保所有表格的列宽、样式统一
6. **智能计算**: 操作列宽度根据按钮数量自动计算

## 📝 使用指南

### 导入配置
```typescript
import { 
  COLUMN_WIDTHS, 
  createCommonColumns, 
  TABLE_CONFIG 
} from '../../constants/tableConfig';
```

### 使用通用列
```typescript
const commonColumns = createCommonColumns();

const columns = [
  { ...commonColumns.id() },                    // 使用默认宽度
  { ...commonColumns.name('场景名称') },         // 自定义标题
  { ...commonColumns.createdAt() },             // 创建时间
  { ...commonColumns.actions(3) },              // 3个操作按钮
];
```

### 使用表格配置
```typescript
<ProTable
  pagination={{
    defaultPageSize: TABLE_CONFIG.pagination.defaultPageSize,
    showSizeChanger: TABLE_CONFIG.pagination.showSizeChanger,
    // ...
  }}
  scroll={TABLE_CONFIG.scroll}
/>
```

## 🚀 后续优化建议

1. **提取更多通用配置**
   - 状态列配置
   - 标签列配置  
   - 数字列配置

2. **完善操作列生成器**
   - 支持更多操作类型
   - 支持 Popconfirm 集成
   - 支持权限控制

3. **添加主题支持**
   - 暗色主题
   - 自定义颜色方案

4. **性能优化**
   - 列配置缓存
   - 虚拟滚动支持

## ✨ 总结

本次重构成功实现了表格配置的统一管理，提高了代码的可维护性和一致性。所有表格现在都使用标准化的配置，未来添加新表格时可以快速复用现有配置。

**服务器状态**: ✅ 已启动在 http://localhost:8003

---

*重构完成时间: 2025-10-11*
*影响文件: 3个核心文件 (tableConfig.ts, SceneTable/index.tsx, ConfigTable/index.tsx)*

