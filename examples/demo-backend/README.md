# Chamberlain Demo Backend

Chamberlain 配置管理系统后端服务 - Spring Boot 3.2 实现，展示了如何实现 Chamberlain 协议规范。

## 🚀 快速开始

### 使用 H2 内存数据库（推荐开发环境）

```bash
cd examples/demo-backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 使用 MySQL

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE chamberlain_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 启动服务
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 访问服务

- **API 文档**: http://localhost:8080/swagger-ui.html
- **健康检查**: http://localhost:8080/actuator/health
- **H2 控制台**: http://localhost:8080/h2-console (仅 local 配置)

## 🛠️ 技术栈

- **Java 17** / **Spring Boot 3.2**
- **MySQL 8.0+** / **H2 Database**
- **Redis 7.0+** (可选)
- **Flyway** - 数据库版本管理
- **SpringDoc** - OpenAPI 文档

## ✨ 功能特性

- **场景管理** - 创建、查询、更新、删除场景
- **配置管理** - 基于场景的配置 CRUD，支持条件过滤
- **Schema 验证** - JSON Schema 验证和版本管理
- **能力声明** - 动态声明服务支持的功能
- **审计功能** - 自动记录创建和更新信息

## 📦 API 端点

- `GET /api/capabilities` - 服务能力声明
- `GET /api/scenes` - 场景列表（支持分页、搜索、排序）
- `POST /api/scenes` - 创建场景
- `GET /api/configs` - 配置列表（支持场景筛选）
- `POST /api/configs` - 创建配置
- 更多端点请查看 Swagger 文档

## 📚 完整文档

详细文档请查看: [Demo Backend 指南](../../docs/demo-backend.md)

## 🧪 协议兼容性测试

```bash
cd ../../packages/protocol
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

## 相关链接

- [Chamberlain 主项目](../../README.md)
- [协议规范](../../packages/protocol/docs/api-spec.md)
- [前端应用](../demo-app/README.md)

