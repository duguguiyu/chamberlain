#!/bin/bash

##############################################################################
# Chamberlain 统一启动脚本
# 
# 用法:
#   ./start.sh [环境]
#
# 环境选项:
#   mock     - 仅前端，使用 Mock 数据（默认）
#   local    - 前端 + 本地后端（开发模式）
#   test     - 前端 + 测试环境后端
#   staging  - 前端 + Staging 环境后端
#   prod     - 前端 + 生产环境后端
#
# 示例:
#   ./start.sh mock      # 仅前端 Mock 模式
#   ./start.sh local     # 本地开发模式（前端 + 后端）
#   ./start.sh test      # 测试环境
##############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo ""
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 获取环境参数（默认为 mock）
ENV=${1:-mock}

# 验证环境参数
case "$ENV" in
    mock|local|test|staging|prod)
        ;;
    *)
        print_error "无效的环境: $ENV"
        echo ""
        echo "支持的环境:"
        echo "  mock     - 仅前端，使用 Mock 数据"
        echo "  local    - 前端 + 本地后端"
        echo "  test     - 前端 + 测试环境后端"
        echo "  staging  - 前端 + Staging 环境后端"
        echo "  prod     - 前端 + 生产环境后端"
        exit 1
        ;;
esac

print_header "🚀 Chamberlain 启动 - ${ENV} 环境"

# 根据环境执行不同的启动逻辑
case "$ENV" in
    mock)
        print_info "启动模式: 仅前端 (Mock 数据)"
        print_info "前端地址: http://localhost:8000"
        echo ""
        
        cd examples/demo-app
        print_info "执行命令: UMI_ENV=mock PORT=8000 pnpm dev"
        echo ""
        
        UMI_ENV=mock PORT=8000 pnpm dev
        ;;
    
    local)
        print_info "启动模式: 前端 + 本地后端"
        print_info "后端地址: http://localhost:8080"
        print_info "前端地址: http://localhost:8000"
        print_info "API 文档: http://localhost:8080/swagger-ui.html"
        echo ""
        
        # 检查后端 JAR 是否存在
        BACKEND_JAR="examples/demo-backend/target/chamberlain-backend-0.1.0.jar"
        if [ ! -f "$BACKEND_JAR" ]; then
            print_warning "后端 JAR 文件不存在，开始编译..."
            cd examples/demo-backend
            mvn clean package -DskipTests
            cd ../..
            print_success "后端编译完成"
        fi
        
        # 在新终端启动后端
        print_info "在新终端窗口启动后端..."
        osascript -e 'tell application "Terminal"
            do script "cd \"'$(pwd)'/examples/demo-backend\" && echo \"🔌 启动后端服务 (local 环境)...\" && echo \"\" && SPRING_PROFILES_ACTIVE=local java -jar target/chamberlain-backend-0.1.0.jar"
            activate
        end tell' 2>/dev/null
        
        # 等待后端启动
        print_info "等待后端启动..."
        sleep 10
        
        # 检查后端是否启动成功
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            print_success "后端启动成功"
        else
            print_warning "后端可能还在启动中..."
        fi
        
        # 在新终端启动前端
        print_info "在新终端窗口启动前端..."
        osascript -e 'tell application "Terminal"
            do script "cd \"'$(pwd)'/examples/demo-app\" && echo \"🎨 启动前端服务 (local 环境)...\" && echo \"\" && UMI_ENV=local PORT=8000 pnpm dev"
            activate
        end tell' 2>/dev/null
        
        print_success "服务已在新终端窗口中启动"
        ;;
    
    test)
        print_info "启动模式: 前端 + 测试环境后端"
        print_info "后端地址: http://test-backend.chamberlain.com"
        print_info "前端地址: http://localhost:8000"
        echo ""
        
        print_warning "注意: 需要先编译并部署后端到测试环境"
        echo ""
        
        # 编译后端（如果需要）
        read -p "是否需要编译后端? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "编译后端 (test 环境)..."
            cd examples/demo-backend
            mvn clean package -DskipTests -Ptest
            cd ../..
            print_success "后端编译完成"
            print_warning "请手动部署 JAR 到测试环境"
        fi
        
        # 启动前端
        cd examples/demo-app
        print_info "启动前端 (test 环境)..."
        UMI_ENV=test PORT=8000 pnpm dev
        ;;
    
    staging)
        print_info "启动模式: 前端 + Staging 环境后端"
        print_info "后端地址: http://staging-backend.chamberlain.com"
        print_info "前端地址: http://localhost:8000"
        echo ""
        
        print_warning "注意: 需要先编译并部署后端到 staging 环境"
        echo ""
        
        # 编译后端（如果需要）
        read -p "是否需要编译后端? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "编译后端 (staging 环境)..."
            cd examples/demo-backend
            mvn clean package -DskipTests -Pstaging
            cd ../..
            print_success "后端编译完成"
            print_warning "请手动部署 JAR 到 staging 环境"
        fi
        
        # 启动前端
        cd examples/demo-app
        print_info "启动前端 (staging 环境)..."
        UMI_ENV=staging PORT=8000 pnpm dev
        ;;
    
    prod)
        print_info "启动模式: 前端 + 生产环境后端"
        print_info "后端地址: http://prod-backend.chamberlain.com"
        print_info "前端地址: http://localhost:8000"
        echo ""
        
        print_error "⚠️  生产环境部署 - 请确认操作！"
        echo ""
        
        # 二次确认
        read -p "是否确认编译生产环境版本? (yes/N): " -r
        echo
        if [[ ! $REPLY =~ ^yes$ ]]; then
            print_info "已取消"
            exit 0
        fi
        
        # 编译后端
        print_info "编译后端 (prod 环境)..."
        cd examples/demo-backend
        mvn clean package -DskipTests -Pprod
        cd ../..
        print_success "后端编译完成"
        print_warning "请手动部署 JAR 到生产环境"
        
        # 启动前端
        cd examples/demo-app
        print_info "启动前端 (prod 环境)..."
        UMI_ENV=prod PORT=8000 pnpm dev
        ;;
esac

print_success "完成！"


