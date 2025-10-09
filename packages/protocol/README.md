# @chamberlain/protocol

Chamberlain 协议定义包，包含类型定义、验证器和兼容性测试。

## 📦 安装

```bash
pnpm add @chamberlain/protocol
```

## 📖 使用

### TypeScript 类型

```typescript
import type {
  Scene,
  Config,
  Condition,
  JSONSchema,
  ApiResponse,
  Capabilities,
} from '@chamberlain/protocol';

const scene: Scene = {
  id: 'my_config',
  name: '我的配置',
  schemeList: [...],
  conditionList: [...],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### Schema 验证

```typescript
import { SchemaValidator } from '@chamberlain/protocol';

const validator = new SchemaValidator();

// 验证数据
const result = validator.validate(schema, data);
if (!result.valid) {
  console.error('验证失败:', result.errors);
}

// 比较 Schema 兼容性
const warnings = validator.compareSchemas(oldSchema, newSchema);
if (warnings.length > 0) {
  console.warn('Schema 变更警告:', warnings);
}
```

### 工具函数

```typescript
import {
  validateSceneId,
  generateConfigId,
  matchConditions,
  parseConditionsFromString,
} from '@chamberlain/protocol';

// 验证场景 ID
if (!validateSceneId('my_config')) {
  throw new Error('Invalid scene ID');
}

// 生成配置 ID
const configId = generateConfigId('my_config', [
  { key: 'env', value: 'prod' },
]);

// 匹配条件
const matched = matchConditions(
  [{ key: 'env', value: 'prod' }],
  [{ key: 'env', value: 'prod' }]
);

// 解析条件字符串
const conditions = parseConditionsFromString('env:prod,region:us');
```

## 📚 文档

- [API 规范](./docs/api-spec.md)
- [OpenAPI 定义](./docs/openapi.yaml)

## 🧪 协议兼容性测试

运行兼容性测试确保服务端实现符合协议规范：

```bash
# 设置测试端点
export TEST_ENDPOINT=http://localhost:8080/api

# 运行测试
pnpm test:compat
```

测试覆盖：
- ✅ Capabilities API
- ✅ Scene 管理
- ✅ Config 管理
- ✅ 错误处理
- ✅ 参数验证

## 📄 License

MIT


