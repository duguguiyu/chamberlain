#!/bin/bash

echo "🚀 Chamberlain - 一键启动"
echo "========================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 选择启动模式
echo "请选择启动模式："
echo "  1) 仅前端 (Mock 数据)"
echo "  2) 前端 + 后端"
echo ""
read -p "请输入选择 (1/2): " -n 1 -r
echo
echo ""

if [[ $REPLY == "1" ]]; then
    echo "📦 启动前端 (Mock 数据模式)..."
    echo "=============================="
    cd examples/demo-app
    echo ""
    echo "前端将在 http://localhost:8000 启动"
    echo "使用 Ctrl+C 停止服务"
    echo ""
    pnpm dev

elif [[ $REPLY == "2" ]]; then
    echo "📦 启动前端 + 后端..."
    echo "======================"
    echo ""
    echo "将在两个终端窗口中启动服务："
    echo "  - 后端: http://localhost:8080"
    echo "  - 前端: http://localhost:8000"
    echo ""
    
    # 在新终端启动后端
    osascript -e 'tell application "Terminal"
        do script "cd \"'$(pwd)'/examples/demo-backend\" && echo \"🔌 启动后端服务...\" && echo \"\" && java -jar target/chamberlain-backend-0.1.0.jar --spring.profiles.active=local"
        activate
    end tell'
    
    # 等待后端启动
    echo "⏳ 等待后端启动 (10秒)..."
    sleep 10
    
    # 在新终端启动前端
    osascript -e 'tell application "Terminal"
        do script "cd \"'$(pwd)'/examples/demo-app\" && echo \"🎨 启动前端服务...\" && echo \"\" && pnpm dev"
        activate
    end tell'
    
    echo ""
    echo "✅ 服务已在新终端窗口中启动"
    echo ""
    echo "访问地址："
    echo "  前端: http://localhost:8000"
    echo "  后端: http://localhost:8080"
    echo "  API文档: http://localhost:8080/swagger-ui.html"
    echo ""
    
else
    echo "❌ 无效的选择"
    exit 1
fi


