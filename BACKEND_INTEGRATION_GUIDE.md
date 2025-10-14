# 🔄 前后端集成切换指南

**更新时间**: 2025-10-14 12:05

## ✅ 当前状态

| 服务 | 状态 | 端口 | 模式 |
|------|------|------|------|
| 前端 | ✅ 运行中 | 8001 | **Mock 模式** |
| 后端 | ✅ 运行中 | 8080 | H2 数据库 |

### 前端（Mock 模式）
- **访问地址**: http://localhost:8001
- **数据来源**: Mock 数据文件 (`examples/demo-app/mock/`)
- **配置**: `endpoint="/api"` (使用 Umi 代理到 Mock)

### 后端（真实服务）
- **访问地址**: http://localhost:8080
- **数据库**: H2 (内存数据库)
- **CORS**: ✅ 已配置，允许所有来源
- **API 根路径**: `/api`
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## 🔀 切换到真实后端

### 方法 1: 直接修改 endpoint（推荐用于开发测试）

#### 步骤 1: 修改配置文件

编辑 `examples/demo-app/src/app.tsx`:

```typescript
// 包装根组件
export function rootContainer(container: React.ReactNode) {
  return (
    // 修改这一行：
    <ChamberlainProvider endpoint="http://localhost:8080/api">
      {container}
    </ChamberlainProvider>
  );
}
```

#### 步骤 2: 清理缓存并重启

```bash
cd /Users/advance/workspace/chamberlain/examples/demo-app

# 停止当前前端服务（Ctrl+C 或 pkill）
pkill -f "max dev"

# 彻底清理缓存
rm -rf src/.umi node_modules/.cache .umi-production

# 重启前端
pnpm dev
```

#### 步骤 3: 验证

1. 打开浏览器: http://localhost:8001
2. 打开 DevTools (F12)
3. 查看 Network 标签
4. 应该看到请求发送到 `http://localhost:8080/api/...`

### 方法 2: 使用环境变量（推荐用于生产）

#### 步骤 1: 修改 `app.tsx` 使用环境变量

```typescript
export function rootContainer(container: React.ReactNode) {
  const endpoint = process.env.API_ENDPOINT || '/api';
  
  return (
    <ChamberlainProvider endpoint={endpoint}>
      {container}
    </ChamberlainProvider>
  );
}
```

#### 步骤 2: 在 `.env` 中配置

创建或编辑 `examples/demo-app/.env.local`:

```bash
# 真实后端
API_ENDPOINT=http://localhost:8080/api

# Mock 模式（注释掉上面一行，使用默认值）
# API_ENDPOINT=/api
```

#### 步骤 3: 清理并重启

```bash
cd examples/demo-app
rm -rf src/.umi node_modules/.cache
pnpm dev
```

## 🐛 可能遇到的问题

### 问题 1: 前端启动失败

**现象**: 清理缓存后前端无法启动，出现模块解析错误

**原因**: Umi 缓存损坏或不完整

**解决方案**:
```bash
cd examples/demo-app
rm -rf src/.umi node_modules/.cache .umi-production node_modules/.vite
pnpm install
pnpm dev
```

### 问题 2: CORS 错误

**现象**: 浏览器控制台显示 CORS 错误

**检查**: 后端 CORS 配置
```bash
curl -H "Origin: http://localhost:8001" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8080/api/scenes
```

**后端配置**: `examples/demo-backend/src/main/java/com/chamberlain/config/CorsConfig.java`
```java
config.addAllowedOriginPattern("*");  // 允许所有来源
config.addAllowedMethod("*");          // 允许所有方法
config.addAllowedHeader("*");          // 允许所有头
config.setAllowCredentials(true);
```

### 问题 3: API 返回 404

**现象**: 请求返回 404 Not Found

**检查点**:
1. 后端服务是否运行: `curl http://localhost:8080/api/capabilities`
2. API 路径是否正确: 确认后端路径为 `/api/*`
3. 前端请求路径: 检查 DevTools Network 标签

### 问题 4: 数据为空

**现象**: 前端显示空列表

**原因**: 后端使用 H2 内存数据库，初始无数据

**解决方案**: 通过 Swagger UI 或前端创建测试数据

## 📊 API 测试

### 使用 curl 测试

```bash
# 测试能力接口
curl http://localhost:8080/api/capabilities

# 获取场景列表
curl "http://localhost:8080/api/scenes?page=1&pageSize=10"

# 创建场景
curl -X POST http://localhost:8080/api/scenes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_scene",
    "name": "测试场景",
    "description": "API 测试",
    "schema": {
      "type": "object",
      "properties": {
        "host": {
          "type": "string",
          "title": "主机地址"
        },
        "port": {
          "type": "number",
          "title": "端口"
        }
      },
      "required": ["host", "port"]
    },
    "availableConditions": [
      {
        "key": "env",
        "name": "环境",
        "type": "string",
        "values": ["dev", "test", "prod"]
      }
    ]
  }'

# 获取特定场景
curl http://localhost:8080/api/scenes/test_scene
```

### 使用 Swagger UI 测试

1. 打开: http://localhost:8080/swagger-ui.html
2. 展开 API 端点
3. 点击 "Try it out"
4. 输入参数
5. 点击 "Execute"

## 🔧 后端管理

### 查看 H2 数据库

1. 访问: http://localhost:8080/h2-console
2. 连接信息:
   - **JDBC URL**: `jdbc:h2:mem:chamberlain_local`
   - **Username**: `sa`
   - **Password**: (留空)
3. 点击 "Connect"

### 重启后端

```bash
# 停止
pkill -f "spring-boot:run"

# 启动
cd /Users/advance/workspace/chamberlain/examples/demo-backend
mvn spring-boot:run -Dspring-boot.run.profiles=local -DskipTests
```

### 查看后端日志

后端日志会输出到控制台，包含所有 SQL 语句和请求详情。

## 📝 切换清单

### 切换到真实后端前

- [ ] 确认后端服务运行中
- [ ] 确认后端 API 可访问
- [ ] 备份当前 Mock 数据（可选）
- [ ] 在后端创建测试数据

### 切换步骤

- [ ] 修改 `app.tsx` 中的 endpoint
- [ ] 清理前端缓存
- [ ] 重启前端服务
- [ ] 等待编译完成（约 30-40 秒）

### 切换后验证

- [ ] 前端页面可以加载
- [ ] DevTools 显示请求到 `http://localhost:8080`
- [ ] 场景列表可以显示/创建
- [ ] 配置列表可以显示/创建
- [ ] 条件选择器正常工作
- [ ] 复制配置功能正常
- [ ] 编辑配置功能正常

## 🔙 回退到 Mock 模式

如果遇到问题，可以快速回退：

```bash
# 1. 修改 app.tsx
# 将 endpoint 改回 "/api"

# 2. 清理并重启
cd examples/demo-app
rm -rf src/.umi node_modules/.cache
pnpm dev
```

## 💡 最佳实践

### 开发流程建议

1. **阶段 1: Mock 开发**
   - 使用 Mock 数据快速开发 UI
   - 不依赖后端服务
   - 数据结构稳定

2. **阶段 2: API 对接**
   - 切换到真实后端
   - 验证 API 集成
   - 测试错误处理

3. **阶段 3: 端到端测试**
   - 完整功能测试
   - 性能测试
   - 错误场景测试

### 数据准备

#### Mock 数据 → 真实数据

Mock 数据在 `examples/demo-app/mock/data/`:
- `sample-scenes.json` - 场景数据
- `sample-configs.json` - 配置数据

可以通过以下方式导入到后端：

```bash
# 使用 Swagger UI 逐个创建
# 或编写脚本批量导入
```

## 🎯 下一步

选择你的开发模式：

### 选项 A: 继续使用 Mock（当前）
✅ 适合：UI 开发、前端功能测试、不依赖后端

### 选项 B: 切换到真实后端
✅ 适合：API 集成、端到端测试、数据持久化验证

### 选项 C: 混合模式
✅ 适合：部分使用真实 API，部分使用 Mock

---

**当前推荐**: 继续使用 Mock 模式开发 UI，待后端功能完善后再切换。

**快速切换**: 只需修改一个文件（`app.tsx`）即可在两种模式间切换。

