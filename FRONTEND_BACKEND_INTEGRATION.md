# 前后端联调指南

## 📋 联调准备

### 1. 后端准备

#### 检查 Java 和 Maven 环境

```bash
# 检查 Java 版本（需要 17+）
java -version

# 检查 Maven 版本（需要 3.9+）
mvn -version

# 如果没有安装，使用 Homebrew 安装
brew install openjdk@17 maven
```

#### 编译和测试后端

```bash
cd /Users/advance/workspace/chamberlain/examples/demo-backend

# 编译项目
mvn clean install -DskipTests

# 运行单元测试
mvn test

# 预期结果：所有测试通过
# Tests run: X, Failures: 0, Errors: 0, Skipped: 0
```

#### 准备数据库

```bash
# 方式 1: 使用 Docker（推荐，无需本地安装）
docker run -d \
  --name mysql-chamberlain \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=chamberlain_dev \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 方式 2: 使用本地 MySQL
brew services start mysql
mysql -u root -p -e "CREATE DATABASE chamberlain_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 启动后端服务

```bash
cd /Users/advance/workspace/chamberlain/examples/demo-backend

# 启动（会自动运行 Flyway 迁移）
mvn spring-boot:run

# 或者指定配置文件
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**预期输出**：
```
Started ChamberlainApplication in X.XXX seconds
```

**验证服务**：
```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 获取 Capabilities
curl http://localhost:8080/api/capabilities

# 获取场景列表
curl http://localhost:8080/api/scenes
```

### 2. 前端准备

#### 修改 ChamberlainProvider 支持配置后端地址

前端组件已经支持通过 `endpoint` prop 配置后端地址。

**当前配置**（在 `examples/demo-app/src/app.tsx`）：

```typescript
export function rootContainer(container: React.ReactNode) {
  return (
    <ChamberlainProvider endpoint="/api">
      {container}
    </ChamberlainProvider>
  );
}
```

**联调时修改为**：

```typescript
export function rootContainer(container: React.ReactNode) {
  return (
    <ChamberlainProvider endpoint="http://localhost:8080/api">
      {container}
    </ChamberlainProvider>
  );
}
```

#### 处理 CORS 问题

后端已经配置了 CORS，在 `CorsConfig.java` 中：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:8000", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 3. 协议兼容性验证

#### 运行协议测试套件

```bash
cd /Users/advance/workspace/chamberlain/packages/protocol

# 确保后端运行在 8080 端口
# 运行兼容性测试
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

**预期结果**：
```
✓ 所有测试通过
```

## 🔄 联调步骤

### 步骤 1: 启动后端

```bash
# 终端 1
cd /Users/advance/workspace/chamberlain/examples/demo-backend
mvn spring-boot:run
```

等待看到：
```
Started ChamberlainApplication
```

### 步骤 2: 修改前端配置

修改 `examples/demo-app/src/app.tsx`：

```typescript
// 从 Mock 切换到真实后端
<ChamberlainProvider endpoint="http://localhost:8080/api">
  {container}
</ChamberlainProvider>
```

### 步骤 3: 重启前端

```bash
# 终端 2
cd /Users/advance/workspace/chamberlain/examples/demo-app
pnpm dev
```

### 步骤 4: 访问应用

打开浏览器：http://localhost:8000

### 步骤 5: 功能测试

#### 场景管理

1. **查看场景列表**
   - ✅ 能看到后端返回的场景
   - ✅ 分页正常
   - ✅ 搜索正常

2. **创建场景**
   - ✅ 填写场景信息
   - ✅ 添加条件
   - ✅ 提交 JSON Schema
   - ✅ 创建成功

3. **编辑场景**
   - ✅ 修改场景名称
   - ✅ 保存成功

4. **查看场景详情**
   - ✅ 显示完整信息
   - ✅ Schema 正确渲染

#### 配置管理

1. **查看配置列表**
   - ✅ 选择场景后显示配置
   - ✅ 分页正常
   - ✅ 搜索正常

2. **创建配置**
   - ✅ 选择条件（environment, customer等）
   - ✅ 填写配置数据
   - ✅ 提交成功
   - ✅ ID 自动生成（sceneId:key1:value1:key2:value2）

3. **复制配置**
   - ✅ 点击复制
   - ✅ 数据预填充
   - ✅ 修改条件
   - ✅ 保存为新配置

4. **编辑配置**
   - ✅ 条件只读显示
   - ✅ 配置数据可编辑
   - ✅ 保存成功

5. **查看配置详情**
   - ✅ 元数据和配置数据分区显示
   - ✅ Schema 验证通过

## 🐛 常见问题

### 问题 1: 后端启动失败

**症状**：MySQL 连接失败

**解决**：
```bash
# 检查 MySQL 是否运行
docker ps | grep mysql

# 如果没有运行，启动容器
docker start mysql-chamberlain

# 或重新创建容器
docker rm mysql-chamberlain
docker run -d --name mysql-chamberlain -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=chamberlain_dev -p 3306:3306 mysql:8.0
```

### 问题 2: CORS 错误

**症状**：浏览器 Console 显示
```
Access to XMLHttpRequest at 'http://localhost:8080/api/scenes' from origin 'http://localhost:8000' has been blocked by CORS policy
```

**解决**：
1. 检查 `CorsConfig.java` 中是否包含 `http://localhost:8000`
2. 重启后端服务
3. 清除浏览器缓存

### 问题 3: 协议不匹配

**症状**：前端请求失败，返回 404 或 500

**检查清单**：
- [ ] 后端 API 路径是否与协议定义一致
- [ ] 请求/响应 DTO 字段是否匹配
- [ ] 枚举值是否一致
- [ ] 日期格式是否一致

**验证**：
```bash
# 运行协议兼容性测试
cd packages/protocol
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

### 问题 4: 前端无法加载数据

**检查步骤**：

1. **打开浏览器 DevTools**
2. **查看 Network 面板**
   - 请求是否发送到 `http://localhost:8080`？
   - 响应状态码是什么？
   - 响应数据格式是否正确？

3. **查看 Console**
   - 是否有 JavaScript 错误？
   - 是否有 CORS 错误？

4. **检查后端日志**
   ```bash
   tail -f logs/chamberlain.log
   ```

### 问题 5: 条件选择器不显示

**检查**：
1. Mock 数据中的 `availableConditions` 是否存在
2. 后端 API 是否返回 `availableConditions`
3. 前端是否正确解析数据

**调试**：
```javascript
// 在浏览器 Console 中
console.log('Selected Scene:', selectedScene);
console.log('Available Conditions:', selectedScene?.availableConditions);
```

## 📊 API 对比检查

### Capabilities API

**协议定义**：
```typescript
GET /api/capabilities
Response: {
  scenes: { create, search, ... },
  configs: { create, search, ... },
  schema: { validate, ... }
}
```

**后端实现**：
```bash
curl http://localhost:8080/api/capabilities
```

### Scenes API

**协议定义**：
```typescript
GET /api/scenes?page=1&pageSize=10
POST /api/scenes
PUT /api/scenes/:id
DELETE /api/scenes/:id
```

**后端实现**：
```bash
# 列表
curl "http://localhost:8080/api/scenes?page=1&pageSize=10"

# 创建
curl -X POST http://localhost:8080/api/scenes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_scene",
    "name": "测试场景",
    "schema": {"type": "object", "properties": {}},
    "availableConditions": [
      {"key": "env", "name": "环境", "type": "string"}
    ]
  }'

# 更新
curl -X PUT http://localhost:8080/api/scenes/test_scene \
  -H "Content-Type: application/json" \
  -d '{"name": "新名称"}'

# 删除
curl -X DELETE http://localhost:8080/api/scenes/test_scene
```

### Configs API

**协议定义**：
```typescript
GET /api/configs?sceneId=xxx&page=1&pageSize=10
POST /api/configs
PUT /api/configs/:id
DELETE /api/configs/:id
POST /api/configs/:id/copy
```

**后端实现**：
```bash
# 列表
curl "http://localhost:8080/api/configs?sceneId=mysql_database_config&page=1&pageSize=10"

# 创建
curl -X POST http://localhost:8080/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": "mysql_database_config",
    "conditionList": [{"key": "environment", "value": "prod"}],
    "config": {"host": "localhost", "port": 3306},
    "schemeVersion": 1
  }'

# 更新
curl -X PUT http://localhost:8080/api/configs/mysql_database_config:environment:prod \
  -H "Content-Type: application/json" \
  -d '{"config": {"host": "newhost", "port": 3306}}'

# 删除
curl -X DELETE http://localhost:8080/api/configs/mysql_database_config:environment:prod

# 复制
curl -X POST http://localhost:8080/api/configs/mysql_database_config:environment:prod/copy
```

## ✅ 联调检查清单

### 后端检查

- [ ] Java 17 已安装
- [ ] Maven 已安装
- [ ] MySQL 数据库已创建
- [ ] 后端服务启动成功（端口 8080）
- [ ] 健康检查通过
- [ ] 单元测试全部通过
- [ ] Swagger UI 可访问

### 前端检查

- [ ] ChamberlainProvider endpoint 已配置为后端地址
- [ ] 前端服务启动成功（端口 8000）
- [ ] 浏览器缓存已清除
- [ ] Console 无错误

### 功能检查

- [ ] 场景列表加载成功
- [ ] 创建场景成功
- [ ] 编辑场景成功
- [ ] 删除场景成功
- [ ] 配置列表加载成功
- [ ] 创建配置（含条件选择）成功
- [ ] 复制配置成功
- [ ] 编辑配置成功
- [ ] 删除配置成功
- [ ] 查看详情正常显示

### 协议检查

- [ ] 协议兼容性测试全部通过
- [ ] API 路径一致
- [ ] 请求/响应格式一致
- [ ] 错误处理一致

## 🚀 下一步

联调完成后：

1. **性能测试**
   - 并发请求测试
   - 大数据量测试

2. **集成测试**
   - 完整业务流程测试
   - 边界条件测试

3. **文档更新**
   - API 文档
   - 部署文档

---

**最后更新**: 2025-10-11  
**前端端口**: 8000  
**后端端口**: 8080

