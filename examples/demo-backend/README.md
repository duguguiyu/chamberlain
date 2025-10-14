# Chamberlain Demo Backend

Chamberlain 配置管理系统后端服务 - Spring Boot 3.2 实现，展示了如何实现 Chamberlain 协议规范。

## 🚀 快速开始

Chamberlain Backend 支持三种运行模式，通过 Spring Profile 切换：

### 方式 1: Local 环境（H2 内存数据库）- 推荐快速开发

```bash
cd examples/demo-backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**特点**：无需安装数据库，服务重启后数据重置

### 方式 2: Dev 环境（MySQL 开发环境）- 推荐团队开发

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE chamberlain_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 启动服务（首次启动会自动执行 Flyway 迁移）
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**特点**：数据持久化，使用 Flyway 管理数据库版本

### 方式 3: Prod 环境（生产部署）

```bash
# 设置环境变量
export MYSQL_URL="jdbc:mysql://localhost:3306/chamberlain"
export MYSQL_USERNAME="chamberlain"
export MYSQL_PASSWORD="your_password"

# 构建并启动
mvn clean package -DskipTests
java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=prod
```

**特点**：使用环境变量配置，支持 Redis 缓存，生产级配置

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

- [Demo Backend 指南](../../docs/demo-backend.md) - 功能介绍和开发指南
- [测试和打包指南](./TESTING_AND_PACKAGING_GUIDE.md) - 测试、打包和 Docker 构建
- [部署指南](./DEPLOYMENT_GUIDE.md) - 不同环境的详细部署说明
- [数据库配置](./DATABASE_CONFIGURATION.md) - 数据库配置和切换详解

## 🧪 测试

### 运行单元测试

```bash
# 设置 Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"

# 运行测试
mvn test

# 测试结果：13/13 通过 ✅
```

### 协议兼容性测试

```bash
cd ../../packages/protocol
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

详细测试指南请查看: [TESTING_AND_PACKAGING_GUIDE.md](./TESTING_AND_PACKAGING_GUIDE.md)

## 🐳 Docker 部署

### 快速启动（Docker Compose）

```bash
# 启动所有服务（MySQL + Redis + Backend）
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

### 单独构建 Docker 镜像

```bash
# 先打包应用
mvn clean package

# 构建镜像
docker build -t chamberlain-backend:0.1.0 .

# 运行容器
docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=local \
  chamberlain-backend:0.1.0
```

## 相关链接

- [Chamberlain 主项目](../../README.md)
- [协议规范](../../packages/protocol/docs/api-spec.md)
- [前端应用](../demo-app/README.md)

