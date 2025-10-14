# Demo Backend 指南

Chamberlain Demo Backend 是基于 Spring Boot 3.2 的后端服务实现，展示了如何实现 Chamberlain 协议规范。

## 技术栈

- **Java**: 17 LTS
- **Spring Boot**: 3.2.1
- **MySQL**: 8.0+ (生产环境)
- **H2**: 内存数据库 (开发环境)
- **Redis**: 7.0+ (可选)
- **Flyway**: 数据库版本管理
- **SpringDoc**: OpenAPI 文档

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.9+
- MySQL 8.0+ (生产环境必需，开发可选)
- Redis 7.0+ (可选，用于缓存)

### 环境选择

Chamberlain Backend 支持三种运行环境：

| 环境 | 数据库 | Flyway | 适用场景 |
|------|--------|--------|----------|
| **local** | H2 内存 | 禁用 | 快速开发测试 |
| **dev** | MySQL | 启用 | 团队开发，数据持久化 |
| **prod** | MySQL | 启用 | 生产部署 |

### 安装 Java 和 Maven

**macOS (Homebrew)**:

```bash
brew install openjdk@17 maven

# 配置环境变量
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
java -version
mvn -version
```

**或使用 SDKMAN**:

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

sdk install java 17.0.9-tem
sdk install maven
```

### 启动服务

根据你的需求选择合适的环境：

**Local 环境（H2 内存数据库）**:

```bash
cd examples/demo-backend
# 无需创建数据库，直接启动
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Dev 环境（MySQL 开发环境）**:

```bash
# 1. 创建数据库
mysql -u root -p
CREATE DATABASE chamberlain_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 2. 启动服务（首次启动会自动执行 Flyway 迁移）
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Prod 环境（生产部署）**:

```bash
# 1. 设置环境变量
export MYSQL_URL="jdbc:mysql://prod-host:3306/chamberlain"
export MYSQL_USERNAME="chamberlain"
export MYSQL_PASSWORD="strong_password"

# 2. 构建并启动
mvn clean package -DskipTests
java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=prod
```

> **💡 提示**: 详细的部署说明请查看 [DEPLOYMENT_GUIDE.md](../examples/demo-backend/DEPLOYMENT_GUIDE.md)

### 访问服务

- **API 文档**: http://localhost:8080/swagger-ui.html
- **健康检查**: http://localhost:8080/actuator/health
- **H2 控制台**: http://localhost:8080/h2-console (仅 local 配置)
  - JDBC URL: `jdbc:h2:mem:chamberlain_local`
  - Username: `sa`
  - Password: (留空)

## 项目结构

```
src/main/java/com/chamberlain/
├── controller/          # REST API 控制器
│   ├── CapabilitiesController.java
│   ├── SceneController.java
│   └── ConfigController.java
├── service/            # 业务逻辑
│   ├── SceneService.java
│   ├── ConfigService.java
│   └── SchemaValidationService.java
├── repository/         # 数据访问层
│   ├── SceneRepository.java
│   └── ConfigRepository.java
├── entity/             # JPA 实体
│   ├── Scene.java
│   └── Config.java
├── dto/                # 数据传输对象
├── config/             # Spring 配置
├── exception/          # 异常处理
└── util/               # 工具类
```

## 配置文件

- `application.yml` - 基础配置
- `application-local.yml` - 本地开发 (H2)
- `application-dev.yml` - 开发环境 (MySQL)
- `application-prod.yml` - 生产环境

## API 端点

### Capabilities
- `GET /api/capabilities` - 获取服务能力

### Scenes
- `GET /api/scenes` - 获取场景列表
- `POST /api/scenes` - 创建场景
- `GET /api/scenes/{id}` - 获取场景详情
- `PUT /api/scenes/{id}` - 更新场景
- `DELETE /api/scenes/{id}` - 删除场景
- `GET /api/scenes/{id}/schemes` - 获取 Schema 版本列表
- `POST /api/scenes/{id}/schemes` - 更新 Schema
- `POST /api/scenes/{id}/schemes:validate` - 验证 Schema

### Configs
- `GET /api/configs` - 获取配置列表
- `POST /api/configs` - 创建配置
- `GET /api/configs/{id}` - 获取配置详情
- `PUT /api/configs/{id}` - 更新配置
- `DELETE /api/configs/{id}` - 删除配置
- `POST /api/configs/{id}:copy` - 复制配置

## 数据库管理

### Local 环境（H2）

- **特点**: 内存数据库，无需安装
- **建表方式**: JPA 自动创建（`ddl-auto: create-drop`）
- **Flyway**: 禁用
- **数据持久化**: 服务重启后数据丢失
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:chamberlain_local`
  - Username: `sa`
  - Password: (留空)

### Dev/Prod 环境（MySQL）

- **特点**: 生产级关系数据库
- **建表方式**: Flyway 迁移脚本（`db/migration/`）
- **Flyway**: 启用，自动执行迁移
- **数据持久化**: 永久保存
- **验证模式**: `ddl-auto: validate`（确保代码与数据库一致）

#### 迁移脚本

```
src/main/resources/db/migration/
├── V1__init_schema.sql       # 初始化表结构
└── V2__add_sample_data.sql   # 示例数据
```

#### Flyway 管理

```bash
# 查看迁移状态
mvn flyway:info

# 手动执行迁移
mvn flyway:migrate

# 清理数据库（仅开发环境！）
mvn flyway:clean
```

## 测试

```bash
# 运行所有测试
mvn test

# 运行单个测试类
mvn test -Dtest=ConfigIdGeneratorTest

# 跳过测试
mvn install -DskipTests
```

## 协议兼容性测试

```bash
# 确保后端服务运行中
cd ../../packages/protocol
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

## Docker 部署

```bash
# 构建镜像
docker build -t chamberlain-backend .

# 运行容器
docker run -d -p 8080:8080 \
  -e MYSQL_URL=jdbc:mysql://host.docker.internal:3306/chamberlain \
  -e MYSQL_USERNAME=root \
  -e MYSQL_PASSWORD=password \
  chamberlain-backend
```

## 常见问题

### 端口 8080 被占用

查找并终止占用进程:
```bash
lsof -i :8080
kill -9 <PID>
```

或修改配置文件中的端口。

### MySQL 连接失败

1. 检查 MySQL 是否运行:
```bash
mysql -u root -p
```

2. 检查数据库是否存在:
```sql
SHOW DATABASES;
```

3. 验证连接字符串和密码

### MapStruct 生成错误

确保 Maven 编译包含 generated-sources:
```bash
mvn clean install
```

## 监控和日志

### 日志文件

日志位于 `logs/chamberlain.log`:

```bash
# 实时查看日志
tail -f logs/chamberlain.log

# 查看错误日志
grep ERROR logs/chamberlain.log
```

### Actuator 端点

- 健康检查: http://localhost:8080/actuator/health
- 应用信息: http://localhost:8080/actuator/info
- 指标: http://localhost:8080/actuator/metrics

## 相关文档

- [后端设计文档](./backend-java-design.md)
- [API 规范](../packages/protocol/docs/api-spec.md)
- [部署指南](./deployment.md)
- [前端集成](./demo-app.md)

