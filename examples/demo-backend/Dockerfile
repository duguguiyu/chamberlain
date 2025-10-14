# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /build

# 复制 Maven 配置文件
COPY pom.xml .
COPY src ./src

# 构建应用（如果有 Maven Wrapper）
# COPY mvnw .
# COPY .mvn .mvn
# RUN ./mvnw clean package -DskipTests

# 如果使用系统 Maven
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="chamberlain-team"
LABEL version="0.1.0"
LABEL description="Chamberlain Backend Service"

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder /build/target/chamberlain-backend-0.1.0.jar app.jar

# 创建非 root 用户
RUN addgroup -S spring && adduser -S spring -G spring && \
    chown spring:spring app.jar

# 切换到非 root 用户
USER spring:spring

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 暴露端口
EXPOSE 8080

# JVM 参数
ENV JAVA_OPTS="-Xms512m -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]

