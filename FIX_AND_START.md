# 🔧 修复 icu4c 依赖并启动服务

## 当前问题
Node.js 需要 `libicui18n.74.dylib`，但系统只有 `icu4c@77` (77.1 版本)。

---

## ⚡ 快速解决方案（推荐）

### 方法 1：手动创建符号链接（需要 sudo）

在终端中执行以下命令：

```bash
# 创建目录
sudo mkdir -p /opt/homebrew/opt/icu4c/lib

# 创建符号链接
sudo ln -sf /opt/homebrew/Cellar/icu4c@77/77.1/lib/libicui18n.77.1.dylib /opt/homebrew/opt/icu4c/lib/libicui18n.74.dylib
sudo ln -sf /opt/homebrew/Cellar/icu4c@77/77.1/lib/libicuuc.77.1.dylib /opt/homebrew/opt/icu4c/lib/libicuuc.74.dylib
sudo ln -sf /opt/homebrew/Cellar/icu4c@77/77.1/lib/libicudata.77.1.dylib /opt/homebrew/opt/icu4c/lib/libicudata.74.dylib

# 验证
ls -la /opt/homebrew/opt/icu4c/lib/

# 启动服务
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-app
pnpm dev
```

### 方法 2：使用启动脚本（已创建）

```bash
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-app
bash start-dev.sh
```

### 方法 3：重新安装 Node.js（最彻底）

```bash
# 卸载当前 Node
brew uninstall --ignore-dependencies node

# 重新安装
brew install node

# 启动服务
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-app
pnpm dev
```

---

## 🚀 启动完整项目

### 选项 A：只启动前端（使用 Mock 数据）

```bash
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-app

# 如果还没安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问：**http://localhost:8000**

### 选项 B：启动前端 + 后端

**终端 1 - 启动后端：**
```bash
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-backend

# 使用 H2 内存数据库
java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=local
```

后端地址：**http://localhost:8080**

**终端 2 - 启动前端：**
```bash
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-app
pnpm dev
```

前端地址：**http://localhost:8000**

---

## ✅ 验证启动成功

### 检查前端服务
```bash
curl http://localhost:8000
# 应该返回 HTML 页面

# 或者在浏览器中打开
open http://localhost:8000
```

### 检查后端服务（如果启动了）
```bash
curl http://localhost:8080/api/capabilities
# 应该返回 JSON 数据
```

---

## 📖 使用 Mock 数据测试

启动前端后，您可以测试以下功能：

### 场景管理（/scenes）
1. 查看场景列表（会显示 Mock 数据）
2. 点击"创建"按钮，填写表单创建场景
3. 点击"查看"查看场景详情
4. 点击"编辑"修改场景
5. 点击"删除"删除场景

### 配置管理（/configs）
1. 选择一个场景
2. 查看配置列表
3. 点击"创建配置"，表单会根据 Schema 自动生成
4. 填写配置数据并提交
5. 查看、编辑、复制、删除配置

---

## 🎯 Mock 数据说明

Mock 数据位于：
- `examples/demo-app/mock/capabilities.ts`
- `examples/demo-app/mock/scenes.ts`
- `examples/demo-app/mock/configs.ts`
- `examples/demo-app/mock/data/sample-scenes.json`
- `examples/demo-app/mock/data/sample-configs.json`

Umi.js 会自动加载这些 Mock 文件，无需额外配置。

---

## 🐛 常见问题

### Q1: pnpm: command not found
```bash
npm install -g pnpm
```

### Q2: 端口 8000 已被占用
```bash
# 查找占用端口的进程
lsof -ti:8000

# 杀死进程
kill -9 $(lsof -ti:8000)

# 或者修改端口
PORT=8001 pnpm dev
```

### Q3: Mock 数据没有生效
确保 `.umirc.ts` 中有 mock 配置：
```typescript
mock: {
  exclude: [],
}
```

### Q4: 组件导入错误
确保组件库已编译（如果修改了组件）：
```bash
cd packages/react-components
pnpm build
```

---

## 📸 预览效果

启动成功后，您将看到：

### 首页
- 左侧菜单：场景管理、配置管理
- 顶部导航栏

### 场景管理页面
- 场景列表表格
- 搜索框
- "创建场景"按钮
- 每行的操作按钮

### 配置管理页面
- 场景选择下拉框
- 配置列表表格
- "创建配置"按钮
- 动态生成的表单

---

## 🎉 功能亮点

1. **智能表单生成**：ConfigForm 会根据 JSON Schema 自动生成表单
2. **类型感知渲染**：不同类型的字段使用不同的组件
3. **实时验证**：表单提交前会进行数据验证
4. **条件标签**：配置的条件会以标签形式展示
5. **响应式设计**：适配不同屏幕尺寸

---

## 📝 下一步

1. **体验 Mock 数据流程**：创建场景 → 创建配置 → 查看详情
2. **查看组件实现**：阅读 `packages/react-components/src/components/` 下的源码
3. **连接真实后端**：启动 Java 后端服务进行完整测试
4. **自定义样式**：修改 Ant Design 主题配置

---

## 💡 提示

- 刷新页面会丢失 Mock 数据中的修改
- Mock 数据存储在内存中，不会持久化
- 要测试完整功能，建议启动后端服务
- 查看浏览器控制台可以看到 API 请求日志

---

**准备好了吗？执行上面的命令启动服务吧！** 🚀


