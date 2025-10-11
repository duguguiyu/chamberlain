# Mock 数据更新说明

## 📅 更新时间
2025-10-10

## 🔧 修复的问题

### 问题描述
场景（Scene）的 Mock 数据中 `conditionList` 字段的数据结构不正确。

**错误的数据结构**：
```json
"conditionList": [
  { "key": "environment", "value": "环境" },
  { "key": "customer", "value": "客户" }
]
```

这种结构缺少了必要的字段，导致前端无法正确显示条件信息。

### 正确的数据结构

根据 Chamberlain 协议定义，`conditionList` 应该包含完整的条件定义：

```json
"conditionList": [
  {
    "key": "environment",
    "name": "环境",
    "type": "string",
    "values": ["dev", "test", "staging", "prod"]
  },
  {
    "key": "customer",
    "name": "客户",
    "type": "string"
  }
]
```

### 字段说明

- **key**: 条件的唯一标识符（必填）
- **name**: 条件的显示名称（必填）
- **type**: 值的类型，如 "string", "number", "boolean"（必填）
- **values**: 可选值列表（可选，用于下拉选择）

---

## ✅ 已修复的场景

### 1. MySQL 数据库配置 (`mysql_database_config`)

**更新前**：
```json
"conditionList": [
  { "key": "environment", "value": "环境" },
  { "key": "customer", "value": "客户" }
]
```

**更新后**：
```json
"conditionList": [
  {
    "key": "environment",
    "name": "环境",
    "type": "string",
    "values": ["dev", "test", "staging", "prod"]
  },
  {
    "key": "customer",
    "name": "客户",
    "type": "string"
  }
]
```

### 2. Redis 缓存配置 (`redis_cache_config`)

**更新前**：
```json
"conditionList": [
  { "key": "environment", "value": "环境" }
]
```

**更新后**：
```json
"conditionList": [
  {
    "key": "environment",
    "name": "环境",
    "type": "string",
    "values": ["dev", "test", "prod"]
  }
]
```

### 3. 应用功能开关 (`app_feature_flags`)

**更新前**：
```json
"conditionList": [
  { "key": "environment", "value": "环境" },
  { "key": "region", "value": "地区" }
]
```

**更新后**：
```json
"conditionList": [
  {
    "key": "environment",
    "name": "环境",
    "type": "string",
    "values": ["dev", "test", "prod"]
  },
  {
    "key": "region",
    "name": "地区",
    "type": "string",
    "values": ["cn-north", "cn-south", "cn-east", "cn-west"]
  }
]
```

---

## 🎯 影响范围

### 前端显示
修复后，场景列表页面的"条件数量"列将正确显示：
- MySQL 数据库配置: 2 个条件
- Redis 缓存配置: 1 个条件
- 应用功能开关: 2 个条件

### 组件行为
- **SceneTable**: 正确显示条件数量
- **SceneDescriptions**: 正确显示条件详情
- **SceneForm**: 可以正确编辑条件

---

## 🚀 部署更新

### 1. 重新构建
```bash
cd /Users/advance/workspace/chamberlain/examples/demo-app
pnpm build
```

### 2. 重启开发服务器
```bash
pnpm dev
```

### 3. 验证更新
访问 http://localhost:8000/scenes 查看场景列表，确认"条件数量"列显示正确。

---

## 📝 注意事项

### 数据一致性
- `availableConditions` 和 `conditionList` 现在使用相同的数据结构
- 这使得数据更加一致和易于维护

### 向后兼容
- 新的数据结构包含了更多信息，但保持了向后兼容
- 旧的代码可能需要更新以使用新字段

### Mock API
Mock API (`mock/scenes.ts`) 也需要更新以处理新的数据结构，特别是：
- 创建场景时的 `conditions` 参数
- 添加条件的 API 端点

---

## ✨ 改进建议

### 短期
- [x] 修复 Mock 数据结构
- [x] 重新构建和部署
- [ ] 测试所有场景相关功能

### 中期
- [ ] 更新 Mock API 以完全支持新结构
- [ ] 添加条件管理的 UI 测试
- [ ] 完善条件验证逻辑

### 长期
- [ ] 考虑添加条件模板功能
- [ ] 支持更复杂的条件类型
- [ ] 添加条件导入/导出功能

---

## 🎉 总结

Mock 数据已成功更新，`conditionList` 字段现在包含完整的条件定义信息。这使得：

1. ✅ 前端可以正确显示条件数量
2. ✅ 条件详情显示更加丰富
3. ✅ 数据结构更加规范和一致
4. ✅ 为未来功能扩展打下基础

服务器已重新启动，可以访问 http://localhost:8000 查看更新效果。

