# ✅ 前后端联调配置完成

## 📊 当前状态

### 🎯 已完成
1. ✅ 后端服务运行在 `http://localhost:8080`
2. ✅ 前端服务运行在 `http://localhost:8000`
3. ✅ 前端通过代理连接到真实后端
4. ✅ Mock 服务已禁用
5. ✅ CORS 已正确配置（后端支持）

### 🔧 关键配置

#### 1. 前端配置 (`.umirc.ts`)
```typescript
mock: false, // 禁用 Mock，使用真实后端
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
},
```

#### 2. 后端 CORS 配置 (`CorsConfig.java`)
- 允许所有来源（开发模式）
- 允许所有方法和 Header
- 支持凭证传递
- 预检请求缓存 1 小时

#### 3. 代理机制
- 前端请求 `/api/*` → 自动代理到 → `http://localhost:8080/api/*`
- 不存在跨域问题（代理是服务器端的）
- 浏览器看到的请求来自同源（localhost:8000）

## 🚀 访问地址

### 前端
- **应用**: http://localhost:8000
- **场景管理**: http://localhost:8000/scenes
- **配置管理**: http://localhost:8000/configs

### 后端
- **API 根路径**: http://localhost:8080/api
- **API 文档**: http://localhost:8080/swagger-ui.html
- **H2 控制台**: http://localhost:8080/h2-console
- **健康检查**: http://localhost:8080/actuator/health

## 🧪 测试连接

### 测试前端代理
```bash
curl http://localhost:8000/api/capabilities
```

### 测试后端直连
```bash
curl http://localhost:8080/api/capabilities
```

### 预期响应
```json
{
  "success": true,
  "data": {
    "scenes.sort": true,
    "configs.sort": true,
    "configs.search": true,
    "scenes.search": true,
    "configs.filter": true
  }
}
```

## 📝 启动命令

### 启动后端
```bash
cd examples/demo-backend
mvn spring-boot:run -Dspring-boot.run.profiles=local -DskipTests
```

### 启动前端
```bash
cd examples/demo-app
pnpm dev
```

## 🔄 在 Mock 和真实后端之间切换

### 使用真实后端（当前配置）
```typescript
// .umirc.ts
mock: false,
```

### 切换回 Mock
```typescript
// .umirc.ts
mock: {
  exclude: [],
},
```

重启前端服务后生效：
```bash
# 停止前端
pkill -f "max dev"

# 清理缓存（推荐）
cd examples/demo-app
rm -rf src/.umi node_modules/.cache

# 重新启动
pnpm dev
```

## ⚠️  注意事项

### 1. 数据一致性
- 后端使用 H2 内存数据库，服务重启后数据会丢失
- Mock 数据和后端数据是独立的
- 切换模式后，数据不会同步

### 2. API 兼容性
- 前端和后端 API 契约需要保持一致
- Protocol 包定义了共同的类型和接口
- 任何 API 变更都需要同步更新前后端

### 3. 开发建议
- **UI 开发**: 优先使用 Mock 模式，速度快，数据稳定
- **集成测试**: 使用真实后端，验证完整流程
- **API 调试**: 使用 Swagger UI 或 Postman 直接测试后端

## 🐛 故障排查

### 前端无法连接后端

#### 检查后端是否运行
```bash
curl http://localhost:8080/api/capabilities
```

#### 检查前端代理配置
```bash
# 查看启动日志，应该看到：
# [HPM] Proxy created: /api -> http://localhost:8080
```

#### 检查浏览器控制台
- 打开 DevTools → Network
- 查看 `/api/*` 请求状态
- 如果是 404，检查后端路由
- 如果是 500，检查后端日志

### Mock 仍然生效

#### 确认配置
```bash
cat examples/demo-app/.umirc.ts | grep mock
# 应该看到: mock: false,
```

#### 清理缓存
```bash
cd examples/demo-app
rm -rf src/.umi node_modules/.cache .umi-production
pnpm dev
```

### 后端编译失败

#### 跳过测试
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local -DskipTests
```

#### 检查 Java 版本
```bash
java -version
# 需要 Java 17
```

## 📚 相关文档

- [后端开发指南](examples/demo-backend/README.md)
- [前端开发指南](examples/demo-app/README.md)
- [API 文档](packages/protocol/docs/api-spec.md)
- [集成状态](INTEGRATION_STATUS.md)
- [后端集成指南](BACKEND_INTEGRATION_GUIDE.md)

---

**最后更新**: 2025-10-14
**状态**: ✅ 前后端联调成功

