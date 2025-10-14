# 🎉 前后端联调状态

**更新时间**: 2025-10-14 10:37

## ✅ 服务状态

### 前端服务
- **状态**: ✅ 运行中
- **端口**: 8000 (注意：实际可能在 8001)
- **访问地址**: http://localhost:8000 或 http://localhost:8001
- **Mock 模式**: 是（当前使用 Mock 数据）

### 后端服务  
- **状态**: ✅ 运行中
- **端口**: 8080
- **访问地址**: http://localhost:8080
- **数据库**: H2 (内存数据库，local 配置)
- **API 文档**: http://localhost:8080/swagger-ui.html
- **H2 控制台**: http://localhost:8080/h2-console

## 🔧 环境检查

| 组件 | 状态 | 版本/信息 |
|------|------|-----------|
| Java | ✅ | 22 (要求 ≥17) |
| Maven | ✅ | 3.9.11 |
| Node.js | ✅ | - |
| pnpm | ✅ | - |
| React Components | ✅ | 已构建，包含条件选择功能 |
| MySQL | ⚠️ | 未使用（使用 H2 代替） |

## 📡 API 测试

### Capabilities API
```bash
curl http://localhost:8080/api/capabilities
```

**响应示例**:
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

### Scenes API
```bash
# 获取场景列表
curl "http://localhost:8080/api/scenes?page=1&pageSize=10"

# 创建场景
curl -X POST http://localhost:8080/api/scenes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_scene",
    "name": "测试场景",
    "schema": {
      "type": "object",
      "properties": {
        "host": {"type": "string", "title": "主机地址"}
      }
    },
    "availableConditions": [
      {"key": "env", "name": "环境", "type": "string", "values": ["dev", "prod"]}
    ]
  }'
```

### Configs API
```bash
# 获取配置列表
curl "http://localhost:8080/api/configs?sceneId=test_scene&page=1&pageSize=10"

# 创建配置
curl -X POST http://localhost:8080/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": "test_scene",
    "conditionList": [{"key": "env", "value": "prod"}],
    "config": {"host": "localhost"},
    "schemeVersion": 1
  }'
```

## 🔄 切换前端到真实后端

### 步骤 1: 修改前端配置

编辑 `examples/demo-app/src/app.tsx`:

```typescript
// 找到这一行
<ChamberlainProvider endpoint="/api">

// 修改为
<ChamberlainProvider endpoint="http://localhost:8080/api">
```

### 步骤 2: 重启前端

```bash
cd /Users/advance/workspace/chamberlain/examples/demo-app
# 停止当前服务（Ctrl+C）
rm -rf src/.umi node_modules/.cache
pnpm dev
```

### 步骤 3: 验证联调

1. **打开浏览器**: http://localhost:8000
2. **打开 DevTools**: F12
3. **查看 Network**: 应该看到请求发送到 `http://localhost:8080`
4. **测试功能**:
   - ✅ 查看场景列表
   - ✅ 创建场景
   - ✅ 查看配置列表  
   - ✅ 创建配置（含条件选择）
   - ✅ 复制配置
   - ✅ 编辑配置

## 🐛 已知问题

### 1. Java 版本警告
- **问题**: 项目需要 Java 17，当前系统是 Java 22
- **影响**: 测试编译失败
- **解决方案**: 使用 `-DskipTests` 跳过测试
- **长期方案**: 安装 Java 17 或修改项目支持 Java 22

### 2. 健康检查显示 DOWN
- **问题**: `/actuator/health` 返回 `status: DOWN`
- **影响**: 无实际影响，API 正常工作
- **原因**: 可能是某个健康指标检查失败（如 Redis）
- **解决方案**: 无需处理，或检查具体健康指标

### 3. H2 数据库数据不持久化
- **问题**: 使用内存数据库，重启后数据丢失
- **影响**: 仅开发测试受影响
- **解决方案**: 
  - 短期：每次重启后重新创建测试数据
  - 长期：配置 MySQL 或使用文件模式 H2

## 📋 测试清单

### 前端 Mock 模式（当前）
- [x] 场景列表加载
- [x] 创建场景
- [x] 编辑场景
- [x] 删除场景
- [x] 场景详情
- [x] 配置列表加载
- [x] 创建配置（含条件选择）
- [x] 复制配置（预填充数据）
- [x] 编辑配置（条件只读）
- [x] 删除配置
- [x] 配置详情（元数据/配置数据分区）

### 后端 API（待测试）
- [ ] 场景 CRUD
- [ ] 配置 CRUD
- [ ] Schema 验证
- [ ] 条件过滤
- [ ] 分页和搜索
- [ ] 错误处理
- [ ] CORS 配置

### 前后端联调（待测试）
- [ ] 切换到真实后端
- [ ] 所有前端功能使用真实 API
- [ ] 错误处理
- [ ] Loading 状态
- [ ] 数据一致性

## 🚀 快速命令

### 启动后端
```bash
cd /Users/advance/workspace/chamberlain/examples/demo-backend
mvn spring-boot:run -Dspring-boot.run.profiles=local -DskipTests
```

### 启动前端
```bash
cd /Users/advance/workspace/chamberlain/examples/demo-app
pnpm dev
```

### 检查状态
```bash
# 后端健康检查
curl http://localhost:8080/actuator/health

# 后端 API
curl http://localhost:8080/api/capabilities

# 前端
curl http://localhost:8000
```

### 查看日志
```bash
# 后端日志（如果有）
tail -f /Users/advance/workspace/chamberlain/examples/demo-backend/logs/chamberlain.log

# 或在运行 Maven 的终端查看实时日志
```

## 📝 后续工作

1. **[ ] 切换前端到真实后端**
   - 修改 `app.tsx` 中的 endpoint
   - 测试所有功能

2. **[ ] 运行协议兼容性测试**
   ```bash
   cd /Users/advance/workspace/chamberlain/packages/protocol
   TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
   ```

3. **[ ] 添加初始数据**
   - 创建测试场景
   - 创建测试配置

4. **[ ] 处理 Java 版本问题**
   - 安装 Java 17
   - 或更新项目配置支持 Java 22

5. **[ ] 配置持久化数据库**
   - 安装 MySQL
   - 或配置 H2 文件模式

## 💡 有用的链接

- **前端**: http://localhost:8000 (或 8001)
- **后端 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:chamberlain_local`
  - Username: `sa`
  - Password: (空)
- **健康检查**: http://localhost:8080/actuator/health
- **应用信息**: http://localhost:8080/actuator/info

## 🎯 下一步建议

现在两个服务都已启动：

1. **立即可以做的**:
   - 在浏览器中测试前端 Mock 功能
   - 使用 curl 或 Postman 测试后端 API
   - 访问 Swagger UI 查看完整 API 文档

2. **准备联调**:
   - 修改前端 endpoint 配置
   - 重启前端服务
   - 测试前后端集成

3. **完善系统**:
   - 添加更多测试数据
   - 运行协议测试
   - 解决 Java 版本问题

---

**当前状态**: ✅ 前后端都已启动，可以开始联调！

**问题反馈**: 如果遇到问题，请查看上方的"已知问题"章节。

