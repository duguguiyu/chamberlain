#!/bin/bash

# Chamberlain 协议兼容性测试脚本

set -e

echo "🧪 Chamberlain Protocol Compatibility Tests"
echo "==========================================="
echo ""

# 检查环境变量
if [ -z "$TEST_ENDPOINT" ]; then
  echo "⚠️  TEST_ENDPOINT 环境变量未设置"
  echo "   使用默认值: http://localhost:8080/api"
  export TEST_ENDPOINT="http://localhost:8080/api"
fi

echo "📡 测试端点: $TEST_ENDPOINT"
echo ""

# 检查服务是否可访问
echo "🔍 检查服务连接..."
if curl -s -o /dev/null -w "%{http_code}" "$TEST_ENDPOINT/capabilities" | grep -q "200"; then
  echo "✅ 服务连接正常"
else
  echo "❌ 无法连接到服务"
  echo "   请确保服务正在运行: $TEST_ENDPOINT"
  exit 1
fi

echo ""
echo "🚀 运行兼容性测试..."
echo ""

# 运行测试
cd "$(dirname "$0")/../packages/protocol"
pnpm test:compat

echo ""
echo "✅ 所有测试通过！"
echo "   服务端实现符合 Chamberlain 协议规范"


