# Chamberlain Backend Service

Chamberlain 配置管理系统后端服务 - Spring Boot 实现

## 技术栈

- **Java**: 17 LTS
- **Spring Boot**: 3.2.1
- **MySQL**: 8.0+
- **Redis**: 7.0+
- **Flyway**: 数据库版本管理
- **SpringDoc OpenAPI**: API 文档

## 快速开始

### 前置要求

- JDK 17+
- Maven 3.9+
- MySQL 8.0+
- Redis 7.0+

### 数据库准备

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE chamberlain_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动服务

```bash
# 编译
mvn clean package

# 运行
mvn spring-boot:run

# 或者
java -jar target/chamberlain-backend-0.1.0.jar
```

### 访问

- **API 文档**: http://localhost:8080/swagger-ui.html
- **API JSON**: http://localhost:8080/api-docs
- **健康检查**: http://localhost:8080/actuator/health

## 开发

### 项目结构

```
src/main/java/com/chamberlain/
├── controller/          # REST API 控制器
├── service/            # 业务逻辑服务
├── repository/         # JPA 数据访问
├── entity/             # JPA 实体
├── dto/                # 数据传输对象
├── config/             # Spring 配置
├── exception/          # 异常处理
├── util/               # 工具类
└── ChamberlainApplication.java  # 启动类
```

### 配置文件

- `application.yml`: 主配置
- `application-dev.yml`: 开发环境
- `application-prod.yml`: 生产环境

### 数据库迁移

使用 Flyway 管理数据库版本：

```bash
# 迁移脚本位置
src/main/resources/db/migration/
├── V1__init_schema.sql        # 初始化表结构
└── V2__add_sample_data.sql    # 示例数据
```

## 测试

```bash
# 运行所有测试
mvn test

# 运行集成测试
mvn verify
```

## 部署

### Docker

```bash
# 构建镜像
docker build -t chamberlain-backend .

# 运行容器
docker run -d -p 8080:8080 \
  -e MYSQL_URL=jdbc:mysql://mysql:3306/chamberlain \
  -e MYSQL_USERNAME=chamberlain \
  -e MYSQL_PASSWORD=password \
  -e REDIS_HOST=redis \
  chamberlain-backend
```

## 协议兼容性测试

运行前端协议测试套件：

```bash
cd ../../packages/protocol
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

## License

MIT

