# 🌍 Chamberlain 环境配置说明

本文档说明 Chamberlain 项目支持的各种环境配置以及如何使用它们。

---

## 📋 环境列表

| 环境 | 说明 | 前端 | 后端 | Mock 数据 | 用途 |
|------|------|------|------|-----------|------|
| **mock** | Mock 模式 | ✅ | ❌ | ✅ | 前端独立开发，无需后端 |
| **local** | 本地开发 | ✅ | ✅ | ❌ | 全栈开发，前后端联调 |
| **test** | 测试环境 | ✅ | ☁️ | ❌ | 连接远程测试服务器 |
| **staging** | 预发布环境 | ✅ | ☁️ | ❌ | 上线前验证 |
| **prod** | 生产环境 | ✅ | ☁️ | ❌ | 正式部署 |

---

## 🚀 快速启动

使用统一的启动脚本：

```bash
./start.sh [环境]
```

### 示例

```bash
# Mock 模式 - 仅前端，使用 mock 数据
./start.sh mock

# 本地开发 - 前端 + 本地后端
./start.sh local

# 测试环境 - 连接测试后端
./start.sh test
```

---

## 🔧 环境详细说明

### 1. Mock 环境

**用途**：前端独立开发，无需启动后端服务

**特点**：
- ✅ 仅启动前端服务
- ✅ 使用 `/examples/demo-app/mock/` 下的 Mock 数据
- ✅ 快速启动，适合 UI 开发和演示

**配置文件**：
- 前端：`examples/demo-app/config/config.mock.ts`

**启动命令**：
```bash
./start.sh mock
```

**访问地址**：
- 前端：http://localhost:8000

---

### 2. Local 环境

**用途**：本地全栈开发，前后端联调

**特点**：
- ✅ 自动启动前端和后端
- ✅ 后端使用本地数据库（MySQL）
- ✅ 在两个独立的终端窗口中启动
- ✅ 支持前后端代码热更新

**配置文件**：
- 前端：`examples/demo-app/config/config.local.ts`
- 后端：`examples/demo-backend/src/main/resources/application-local.yml`

**前置条件**：
- MySQL 数据库已安装并运行
- Redis 已安装并运行（可选）
- 后端已编译（如不存在 JAR，脚本会自动编译）

**启动命令**：
```bash
./start.sh local
```

**访问地址**：
- 前端：http://localhost:8000
- 后端：http://localhost:8080
- API 文档：http://localhost:8080/swagger-ui.html
- 健康检查：http://localhost:8080/actuator/health

---

### 3. Test 环境

**用途**：连接远程测试服务器，用于集成测试

**特点**：
- ✅ 前端连接远程测试后端
- ✅ 可选择是否编译后端
- ⚠️ 需要手动部署后端到测试服务器

**配置文件**：
- 前端：`examples/demo-app/config/config.test.ts`
- 后端：`examples/demo-backend/src/main/resources/application-test.yml`

**后端地址**：
- 默认：`http://test-backend.chamberlain.com`
- 可在 `config/config.test.ts` 中修改

**启动命令**：
```bash
./start.sh test
```

**部署后端**：
```bash
# 1. 编译（脚本会询问）
mvn clean package -DskipTests -Ptest

# 2. 上传 JAR 到测试服务器
scp examples/demo-backend/target/chamberlain-backend-0.1.0.jar user@test-server:/app/

# 3. 在测试服务器启动
java -jar chamberlain-backend-0.1.0.jar --spring.profiles.active=test
```

---

### 4. Staging 环境

**用途**：预发布环境，上线前的最后验证

**特点**：
- ✅ 前端连接 staging 后端
- ✅ 可选择是否编译后端
- ⚠️ 需要手动部署后端到 staging 服务器

**配置文件**：
- 前端：`examples/demo-app/config/config.staging.ts`
- 后端：需要创建 `application-staging.yml`（可复制 prod 配置）

**后端地址**：
- 默认：`http://staging-backend.chamberlain.com`
- 可在 `config/config.staging.ts` 中修改

**启动命令**：
```bash
./start.sh staging
```

---

### 5. Prod 环境

**用途**：生产环境部署

**特点**：
- ✅ 前端连接生产后端
- ⚠️ 需要二次确认
- ⚠️ 务必小心操作

**配置文件**：
- 前端：`examples/demo-app/config/config.prod.ts`
- 后端：`examples/demo-backend/src/main/resources/application-prod.yml`

**后端地址**：
- 默认：`http://prod-backend.chamberlain.com`
- 可在 `config/config.prod.ts` 中修改

**启动命令**：
```bash
./start.sh prod
# 会提示二次确认
```

**⚠️ 生产环境部署注意事项**：
1. 确保所有测试通过
2. 备份生产数据库
3. 使用 CI/CD 流程部署
4. 监控日志和性能指标

---

## ⚙️ 自定义环境配置

### 前端配置

前端配置位于 `examples/demo-app/config/` 目录：

```
config/
├── config.ts          # 基础配置（所有环境共享）
├── config.mock.ts     # Mock 环境
├── config.local.ts    # Local 环境
├── config.test.ts     # Test 环境
├── config.staging.ts  # Staging 环境
└── config.prod.ts     # Prod 环境
```

**修改后端地址**：

编辑对应环境的配置文件，修改 `proxy.target`：

```typescript
// config/config.test.ts
export default defineConfig({
  proxy: {
    '/api': {
      target: 'http://your-test-backend.com', // 修改这里
      changeOrigin: true,
    },
  },
});
```

### 后端配置

后端配置位于 `examples/demo-backend/src/main/resources/`：

```
resources/
├── application.yml          # 基础配置
├── application-local.yml    # Local 环境
├── application-dev.yml      # Dev 环境
├── application-test.yml     # Test 环境
└── application-prod.yml     # Prod 环境
```

**修改数据库连接**：

```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:mysql://your-test-db:3306/chamberlain
    username: your_username
    password: your_password
```

---

## 📝 环境变量

### 前端

通过 `UMI_ENV` 环境变量切换配置：

```bash
UMI_ENV=test pnpm dev    # 使用 config.test.ts
UMI_ENV=prod pnpm dev    # 使用 config.prod.ts
```

### 后端

通过 `SPRING_PROFILES_ACTIVE` 环境变量切换配置：

```bash
SPRING_PROFILES_ACTIVE=test java -jar app.jar
SPRING_PROFILES_ACTIVE=prod java -jar app.jar
```

或通过命令行参数：

```bash
java -jar app.jar --spring.profiles.active=test
```

---

## 🐛 常见问题

### Q: Mock 模式下为什么看不到数据？

A: 检查 `examples/demo-app/mock/` 目录下的 mock 数据文件是否存在。

### Q: Local 模式后端启动失败？

A: 检查：
1. MySQL 是否运行：`mysql -u root -p`
2. 数据库是否存在：`CREATE DATABASE chamberlain_dev;`
3. 后端 JAR 是否编译：`ls examples/demo-backend/target/*.jar`

### Q: 如何连接自己的后端服务？

A: 修改对应环境的配置文件中的 `proxy.target` 地址。

### Q: 如何添加新的环境？

A: 
1. 创建前端配置：`config/config.newenv.ts`
2. 创建后端配置：`application-newenv.yml`
3. 在 `start.sh` 中添加新环境的 case

---

## 📚 相关文档

- [快速开始](../README.md#-快速开始)
- [API 规范](../packages/protocol/docs/api-spec.md)
- [前端组件文档](../packages/react-components/README.md)
- [后端设计文档](./backend-java-design.md)
- [部署文档](./deployment.md)
- [Demo 应用说明](./demo-app.md)


