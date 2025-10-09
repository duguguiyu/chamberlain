# 开发指南

欢迎参与 Chamberlain 项目开发！

## 🛠️ 开发环境设置

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 克隆仓库

```bash
git clone https://github.com/yourusername/chamberlain.git
cd chamberlain
```

### 安装依赖

```bash
pnpm install
```

## 📁 项目结构

```
chamberlain/
├── packages/               # Monorepo 包
│   ├── protocol/          # 协议定义
│   └── react-components/  # React 组件库
├── examples/              # 示例应用
│   └── demo-app/         # Demo 应用
├── docs/                  # 文档
├── scripts/               # 脚本
└── package.json          # 根 package.json
```

## 🚀 开发工作流

### 1. 创建功能分支

```bash
git checkout -b feature/my-new-feature
```

### 2. 开发

```bash
# 启动开发模式（所有包）
pnpm dev

# 或者单独启动某个包
cd packages/react-components
pnpm dev
```

### 3. 测试

```bash
# 运行所有测试
pnpm test

# 运行协议兼容性测试
pnpm test:compat
```

### 4. 代码检查

```bash
# Lint
pnpm lint

# 类型检查
pnpm typecheck

# 格式化代码
pnpm format
```

### 5. 提交

```bash
git add .
git commit -m "feat: add my new feature"
```

### 6. 推送和创建 PR

```bash
git push origin feature/my-new-feature
```

然后在 GitHub 上创建 Pull Request。

## 📦 包管理

### 添加依赖

```bash
# 为特定包添加依赖
pnpm --filter @chamberlain/react-components add axios

# 为根项目添加开发依赖
pnpm add -D -w prettier
```

### 包之间的依赖

在 `package.json` 中使用 workspace 协议：

```json
{
  "dependencies": {
    "@chamberlain/protocol": "workspace:*"
  }
}
```

## 🧪 测试

### 单元测试

使用 Vitest：

```typescript
import { describe, test, expect } from 'vitest';

describe('MyComponent', () => {
  test('should render correctly', () => {
    expect(true).toBe(true);
  });
});
```

### 组件测试

使用 React Testing Library：

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## 📝 代码规范

### TypeScript

- 使用严格模式
- 为所有公共 API 添加类型注解
- 避免使用 `any`

### React

- 使用函数组件和 Hooks
- 遵循 React 最佳实践
- 为所有组件添加 props 类型

### 命名规范

- 文件名：`PascalCase.tsx` (组件), `camelCase.ts` (工具)
- 组件名：`PascalCase`
- 函数名：`camelCase`
- 常量名：`UPPER_SNAKE_CASE`

## 🎨 组件开发

### 创建新组件

```tsx
import React from 'react';

export interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### 导出组件

在 `src/components/index.ts` 中：

```typescript
export { MyComponent, type MyComponentProps } from './MyComponent';
```

## 📚 文档

### 添加文档

- 为所有公共 API 添加 JSDoc 注释
- 在 `docs/` 目录添加使用指南
- 更新相关 README

### JSDoc 示例

```typescript
/**
 * 创建场景
 * @param request - 创建场景请求
 * @returns 创建的场景
 * @throws {BusinessException} 如果场景 ID 已存在
 */
export async function createScene(request: CreateSceneRequest): Promise<Scene> {
  // ...
}
```

## 🐛 调试

### 前端调试

使用浏览器开发者工具和 React DevTools。

### Mock 数据

在 `examples/demo-app/mock/` 修改 Mock 数据：

```typescript
export default {
  'GET /api/scenes': (req, res) => {
    res.json({ success: true, data: [...] });
  },
};
```

## 🔧 常见任务

### 添加新的 API 端点

1. 在 `packages/protocol/docs/openapi.yaml` 添加定义
2. 在 `packages/protocol/src/types/` 添加类型
3. 在 `packages/react-components/src/services/` 添加客户端方法
4. 在 `examples/demo-app/mock/` 添加 Mock 实现

### 添加新组件

1. 在 `packages/react-components/src/components/` 创建组件
2. 添加类型定义和 Props 接口
3. 在 `src/components/index.ts` 导出
4. 编写测试
5. 更新文档

## 📋 Commit 规范

使用 Conventional Commits：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: add ConfigTable component
fix: resolve scene deletion issue
docs: update API documentation
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### PR 检查清单

- [ ] 代码通过所有测试
- [ ] 代码通过 lint 检查
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] Commit 消息符合规范

## 📞 获取帮助

- [GitHub Discussions](https://github.com/yourusername/chamberlain/discussions)
- [GitHub Issues](https://github.com/yourusername/chamberlain/issues)

## 📄 License

MIT


