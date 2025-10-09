# 🚀 快速启动指南

## 1. 安装依赖

### macOS (使用 Homebrew)

```bash
# 安装 Java 17
brew install openjdk@17

# 配置 Java 环境变量
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证 Java 安装
java -version

# 安装 Maven
brew install maven

# 验证 Maven 安装
mvn -version
```

### 或者使用 SDKMAN（推荐）

```bash
# 安装 SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 安装 Java
sdk install java 17.0.9-tem

# 安装 Maven
sdk install maven

# 验证
java -version
mvn -version
```

## 2. 准备数据库

### 启动 MySQL

```bash
# 如果使用 Homebrew 安装的 MySQL
brew services start mysql

# 或者使用 Docker
docker run -d \
  --name mysql-chamberlain \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=chamberlain_dev \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

### 创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE chamberlain_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

## 3. 启动 Redis（可选）

```bash
# 使用 Homebrew
brew services start redis

# 或者使用 Docker
docker run -d --name redis-chamberlain -p 6379:6379 redis:7.0

# 验证
redis-cli ping
```

## 4. 配置应用

编辑 `src/main/resources/application-dev.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/chamberlain_dev?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: password  # 修改为你的密码
  
  data:
    redis:
      host: localhost
      port: 6379
```

## 5. 编译项目

```bash
cd /Users/duguguiyu-work/workspace/chamberlain/examples/demo-backend

# 首次编译（下载依赖，可能需要几分钟）
mvn clean install

# 跳过测试编译（更快）
mvn clean install -DskipTests
```

## 6. 运行测试

```bash
# 运行所有测试
mvn test

# 运行单个测试类
mvn test -Dtest=ConfigIdGeneratorTest

# 运行单个测试方法
mvn test -Dtest=ConfigIdGeneratorTest#testGenerateDefaultId
```

## 7. 启动应用

```bash
# 方式 1: Maven 插件（开发推荐）
mvn spring-boot:run

# 方式 2: 指定配置文件
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 方式 3: 打包后运行
mvn clean package -DskipTests
java -jar target/chamberlain-backend-0.1.0.jar

# 方式 4: 指定 JVM 参数
java -Xms512m -Xmx1024m -jar target/chamberlain-backend-0.1.0.jar
```

## 8. 验证运行

### 检查健康状态
```bash
curl http://localhost:8080/actuator/health
```

### 测试 API
```bash
# 获取服务能力
curl http://localhost:8080/api/capabilities

# 获取场景列表
curl "http://localhost:8080/api/scenes?page=1&pageSize=10"
```

### 访问 API 文档
```bash
open http://localhost:8080/swagger-ui.html
```

## 9. 常见问题

### 问题 1: Java 版本不对
```bash
# 检查版本
java -version

# 应该显示 Java 17 或更高版本
# 如果版本不对，使用 SDKMAN 切换
sdk use java 17.0.9-tem
```

### 问题 2: 端口 8080 被占用
```bash
# 查找占用 8080 的进程
lsof -i :8080

# 杀死进程
kill -9 <PID>

# 或者修改配置文件中的端口
# src/main/resources/application.yml
server:
  port: 8081
```

### 问题 3: MySQL 连接失败
```bash
# 检查 MySQL 是否运行
mysql -u root -p

# 检查数据库是否存在
SHOW DATABASES;

# 测试连接字符串
mysql -h localhost -P 3306 -u root -p chamberlain_dev
```

### 问题 4: 依赖下载失败
```bash
# 清理 Maven 缓存
rm -rf ~/.m2/repository

# 使用国内镜像（可选）
# 编辑 ~/.m2/settings.xml
<mirrors>
  <mirror>
    <id>aliyun</id>
    <mirrorOf>central</mirrorOf>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

## 10. 开发调试

### IDEA 配置

1. 打开项目：File -> Open -> 选择 demo-backend 目录
2. 等待 Maven 导入依赖
3. 配置运行配置：
   - Main class: `com.chamberlain.ChamberlainApplication`
   - VM options: `-Dspring.profiles.active=dev`
   - Working directory: `$MODULE_WORKING_DIR$`

### VSCode 配置

1. 安装扩展：
   - Extension Pack for Java
   - Spring Boot Extension Pack

2. 创建 `.vscode/launch.json`：
```json
{
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot",
      "request": "launch",
      "mainClass": "com.chamberlain.ChamberlainApplication",
      "projectName": "chamberlain-backend",
      "args": "--spring.profiles.active=dev"
    }
  ]
}
```

## 11. 生产部署

### 构建生产镜像

```bash
# 打包
mvn clean package -DskipTests

# 构建 Docker 镜像
docker build -t chamberlain-backend:0.1.0 .

# 运行容器
docker run -d \
  -p 8080:8080 \
  -e MYSQL_URL="jdbc:mysql://host.docker.internal:3306/chamberlain" \
  -e MYSQL_USERNAME=root \
  -e MYSQL_PASSWORD=password \
  -e REDIS_HOST=host.docker.internal \
  --name chamberlain-backend \
  chamberlain-backend:0.1.0
```

## 12. 协议兼容性测试

```bash
# 确保后端运行在 8080 端口

# 切换到 protocol 包
cd /Users/duguguiyu-work/workspace/chamberlain/packages/protocol

# 运行兼容性测试
TEST_ENDPOINT=http://localhost:8080/api pnpm test:compat
```

预期结果：
```
✓ 17 tests passed
```

## 13. 监控和日志

### 查看日志
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

---

## 🎯 下一步

项目启动后，你可以：

1. ✅ 访问 Swagger UI 测试 API
2. ✅ 连接前端 Demo App
3. ✅ 运行协议兼容性测试
4. ✅ 开始开发新功能

**需要帮助？** 查看 `IMPLEMENTATION_COMPLETE.md` 了解更多详情。

