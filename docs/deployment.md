# 部署指南

本指南介绍如何部署 Chamberlain 配置管理系统。

## 🏗️ 架构概述

Chamberlain 由以下部分组成：

```
┌─────────────────┐
│  前端应用        │  (React + Ant Design Pro)
│  或组件库        │
└────────┬────────┘
         │ HTTP/HTTPS
         │ REST API
         ↓
┌─────────────────┐
│  后端服务        │  (Java / Node.js / ...)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  数据库          │  (MySQL / PostgreSQL)
└─────────────────┘
```

## 🎯 部署选项

### 选项 1：仅使用前端组件

如果你只想使用 Chamberlain 的 React 组件库，不需要部署后端。

#### 步骤：

1. 安装组件库：
```bash
npm install @chamberlain/react-components
```

2. 配置你的后端 API 端点：
```tsx
<ChamberlainProvider endpoint="https://your-api.example.com/api">
  <App />
</ChamberlainProvider>
```

3. 确保你的后端实现符合 [Chamberlain 协议](../packages/protocol/docs/api-spec.md)

### 选项 2：部署完整应用（前端 + 后端）

#### 前端部署

**1. 构建前端**

```bash
cd examples/demo-app
pnpm build
```

构建产物在 `dist/` 目录。

**2. 部署到静态服务器**

可以使用任何静态文件服务器：

- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name chamberlain.example.com;
    
    root /var/www/chamberlain/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 后端部署

**Java 后端部署（示例）**

1. 构建 JAR 包：
```bash
cd backend
mvn clean package
```

2. 运行：
```bash
java -jar target/chamberlain-backend.jar
```

3. 使用 systemd 管理（推荐）：

```ini
[Unit]
Description=Chamberlain Backend Service
After=network.target

[Service]
Type=simple
User=chamberlain
WorkingDirectory=/opt/chamberlain
ExecStart=/usr/bin/java -jar /opt/chamberlain/chamberlain-backend.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl enable chamberlain
sudo systemctl start chamberlain
```

## 🐳 Docker 部署

### Dockerfile（前端）

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: ./examples/demo-app
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/chamberlain
      - SPRING_DATASOURCE_USERNAME=chamberlain
      - SPRING_DATASOURCE_PASSWORD=password
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=chamberlain
      - MYSQL_USER=chamberlain
      - MYSQL_PASSWORD=password
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

## 🔒 安全建议

1. **使用 HTTPS**
   - 为前端和 API 配置 SSL 证书
   - 推荐使用 Let's Encrypt

2. **配置 CORS**
   - 限制允许的来源
   - 只允许必要的 HTTP 方法

3. **实现认证授权**
   - JWT Token
   - OAuth 2.0
   - API Key

4. **数据库安全**
   - 使用强密码
   - 限制数据库访问
   - 定期备份

5. **环境变量**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理配置

## 📊 监控和日志

### 推荐工具

- **应用监控**: Prometheus + Grafana
- **日志收集**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **错误追踪**: Sentry

### 监控指标

- API 响应时间
- 错误率
- 数据库连接数
- 内存使用
- CPU 使用

## 🔧 性能优化

1. **前端优化**
   - 启用 Gzip 压缩
   - 配置 CDN
   - 代码分割和懒加载

2. **后端优化**
   - 数据库索引优化
   - 使用 Redis 缓存
   - 连接池配置

3. **数据库优化**
   - 为常用查询字段添加索引
   - 定期清理过期数据

## 📝 检查清单

部署前确认：

- [ ] 所有环境变量已配置
- [ ] 数据库连接正常
- [ ] API 端点可访问
- [ ] HTTPS 已配置
- [ ] 认证机制已实现
- [ ] 备份策略已制定
- [ ] 监控已配置
- [ ] 日志收集已配置

## 🆘 故障排查

### 前端无法连接后端

1. 检查 API 端点配置
2. 检查 CORS 配置
3. 检查网络防火墙

### 后端启动失败

1. 检查数据库连接
2. 检查端口占用
3. 查看日志文件

## 📄 更多资源

- [协议规范](../packages/protocol/docs/api-spec.md)
- [开发指南](./development.md)


